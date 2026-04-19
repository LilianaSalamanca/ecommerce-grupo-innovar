import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CartService } from '@core/services/cart.service';
import { CheckoutService } from '@core/services/checkout.service';
import { CheckoutResponse } from '@core/models/checkout.model';
import { AuthService } from '@core/services/auth.service';

declare var WidgetCheckout: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  /* ---------------- UI STATE ---------------- */
  step = 1;
  loading = false;
  error?: string;

  /* ---------------- AUTH ---------------- */
  isLoggedIn = false;

  /* ---------------- DATA ---------------- */
  checkoutData?: CheckoutResponse;
  cartItems: any[] = [];

  totals = {
    subtotal: 0,
    envio: 0,
    total: 0
  };

  /* ---------------- FORM ---------------- */
  form!: FormGroup;

  /* ---------------- DI ---------------- */
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);
  private router = inject(Router);

  /* ---------------- INIT ---------------- */
  ngOnInit(): void {
    window.scroll(0, 0)
    
    this.initForm();
    this.loadCart();
    this.listenAuthState();
  }

  /* ---------------- FORM ---------------- */
  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      departamento: ['', Validators.required],
      telefono: ['', Validators.required],
      metodoPago: ['CONTRA_ENTREGA', Validators.required]
    });
  }

  private resetCheckoutForm(): void {
    this.form.reset({
      nombre: '',
      apellido: '',
      email: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      telefono: '',
      metodoPago: 'CONTRA_ENTREGA'
    });

    this.form.enable();
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /* ---------------- AUTH ---------------- */
  private listenAuthState(): void {
    this.authService.user$.subscribe(user => {

      this.resetCheckoutForm();

      if (!user) {
        this.isLoggedIn = false;
        return;
      }

      this.isLoggedIn = true;

      this.form.patchValue({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email
      });

      this.form.get('nombre')?.disable();
      this.form.get('apellido')?.disable();
      this.form.get('email')?.disable();
    });
  }

  /* ---------------- CART ---------------- */
  private loadCart(): void {
    this.cartService.carrito$.subscribe(items => {
      this.cartItems = items.map(it => ({
        ...it,
        total: this.cartService.calcularPrecioTotal(it.producto, it.cantidad)
      }));

      this.totals.subtotal = this.cartService.obtenerTotalCarritoSinEnvio();
      this.totals.envio = this.cartService.obtenerCostoEnvio();
      this.totals.total = this.cartService.obtenerTotalConEnvio();
    });
  }

  /* ---------------- STEPS ---------------- */
  goToPayment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step = 2;
  }

  backStep(): void {
    this.step = 1;
  }

  /* ---------------- CHECKOUT ---------------- */
  confirmCheckout(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = undefined;

    const formData = this.form.getRawValue();

    this.checkoutService.iniciarCheckout({
      ...formData,
      items: this.cartItems.map(i => ({
        productoId: i.producto.id,
        cantidad: i.cantidad
      })),

      totalFront: this.totals.total

    }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.checkoutData = resp;

        if (resp.metodoPago === 'WOMPI') {
          this.openWompi();
        } else {
          this.step = 3;
          this.cartService.vaciarCarrito();
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'No fue posible procesar el pedido';
      }
    });
  }

  /* ---------------- WOMPI ---------------- */
  private openWompi(): void {
    if (!this.checkoutData) return;

    const widget = new WidgetCheckout({
      currency: 'COP',
      amountInCents: Number(this.checkoutData.amountInCents),
      reference: this.checkoutData.reference,
      publicKey: this.checkoutData.wompiPublicKey,
      signature: { integrity: this.checkoutData.integritySignature }
    });

    widget.open((result: any) => {
      if (result?.transaction?.status === 'APPROVED') {
        this.confirmWompi(result.transaction.id);
      } else {
        this.error = 'Pago no completado';
      }
    });
  }

  private confirmWompi(transactionId: string): void {
    if (!this.checkoutData) return;

    this.checkoutService.confirmarPagoWompi({
      pedidoId: this.checkoutData.pedidoId,
      transactionId
    }).subscribe({
      next: () => {
        this.step = 3;
        this.cartService.vaciarCarrito();
      },
      error: () => {
        this.error = 'Pago realizado pero no confirmado';
      }
    });
  }

  /* ---------------- NAV ---------------- */
  goToOrder(): void {
    if (!this.checkoutData?.pedidoId) return;
    this.router.navigate(['/orders', this.checkoutData.pedidoId]);
  }

  goBack() {
    this.router.navigate(['/cart']);
  };
}
