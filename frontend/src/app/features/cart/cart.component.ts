import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { Producto } from '@core/models/producto.model';
import { CartService } from '@core/services/cart.service';
import { ProductoService } from '@core/services/producto.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  carrito: { producto: Producto; cantidad: number }[] = [];
  productosRelacionados: Producto[] = [];

  cantidades: Record<number, string> = {};
  pantallaPequena = false;

  private isBrowser = false;

  constructor(
    private cartService: CartService,
    private productoService: ProductoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    window.scrollTo(0, 0)
    
    this.cartService.carrito$.subscribe(items => {
      this.carrito = items;
      this.syncCantidades();
      this.cargarProductosRelacionados();
    });

    if (this.isBrowser) {
      this.pantallaPequena = window.innerWidth < 768;
    }
  }

  /* -------------------- Responsive -------------------- */
  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      this.pantallaPequena = window.innerWidth < 768;
    }
  }

  /* -------------------- Cantidades -------------------- */
  private syncCantidades(): void {
    const map: Record<number, string> = {};
    this.carrito.forEach(item => {
      if (item.producto.id != null) {
        map[item.producto.id] = String(item.cantidad);
      }
    });
    this.cantidades = map;
  }

  incrementar(producto: Producto): void {
    if (producto.id != null) {
      this.cartService.aumentarCantidad(producto.id);
    }
  }

  decrementar(producto: Producto): void {
    if (producto.id != null) {
      this.cartService.disminuirCantidad(producto.id);
    }
  }

  onCantidadInput(value: string, producto: Producto): void {
    if (producto.id == null) return;
    this.cantidades[producto.id] = value.replace(/\D+/g, '');
  }

  onCantidadCommit(producto: Producto): void {
    if (producto.id == null) return;

    let cantidad = parseInt(this.cantidades[producto.id], 10);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;

    this.cantidades[producto.id] = String(cantidad);
    this.cartService.actualizarCantidad(producto.id, cantidad);
  }

  /* -------------------- Precios -------------------- */
  precioUnitario(prod: Producto, cant: number): number {
    return this.cartService.calcularPrecioUnitario(prod, cant);
  }

  precioTotal(prod: Producto, cant: number): number {
    return this.cartService.calcularPrecioTotal(prod, cant);
  }

  total(): number {
    return this.cartService.obtenerTotalCarrito();
  }

  /* =========================
     NUEVA LÓGICA DE ENVÍO
     ========================= */

  tieneMayorista(): boolean {
    return this.cartService.tieneMayorista();
  }

  envioGratis(): boolean {
    return this.cartService.aplicaEnvioGratis();
  }

  faltanteEnvio(): number {
    return this.cartService.faltanteEnvioGratis();
  }

  /* -------------------- Acciones -------------------- */
  eliminar(id: number): void {
    this.cartService.eliminarProducto(id);
  }

  limpiar(): void {
    this.cartService.vaciarCarrito();
  }

  continuarCompra(): void {
    this.router.navigate(['/checkout']);
  }

  /* -------------------- Productos relacionados -------------------- */
  cargarProductosRelacionados(): void {
    if (this.carrito.length === 0) {
      this.productosRelacionados = [];
      return;
    }

    const base = this.carrito[0].producto;

    if (!base.categoria?.id || !base.subcategoria?.id) {
      this.productosRelacionados = [];
      return;
    }

    this.productoService.obtenerProductos().subscribe(productos => {
      const idsEnCarrito = new Set(
        this.carrito.map(i => i.producto.id)
      );

      this.productosRelacionados = productos
        .filter(p =>
          p.id &&
          !idsEnCarrito.has(p.id) &&
          p.categoria?.id === base.categoria.id &&
          p.subcategoria?.id === base.subcategoria.id
        )
        .slice(0, 6);
    });
  }

  agregarRelacionado(producto: Producto): void {
    this.cartService.agregarAlCarrito(producto, 1);
  }

  cumpleCompraMinima(): boolean {
    return this.cartService.cumpleCompraMinima()
  }

  faltanteCompraMinima(): number {
    return this.cartService.faltanteCompraMinima();
  }

  /* ENVÍO */
  costoEnvio(): number {
    return this.cartService.obtenerCostoEnvio();
  }

  totalConEnvio(): number {
    return this.cartService.obtenerTotalConEnvio();
  }

  getImagenUrl(imagen: string | null | undefined): string {

    if (!imagen) {
      return 'assets/no-image.png';
    }

    // Si ya es URL externa (Cloudinary)
    if (imagen.startsWith('http')) {
      return imagen;
    }

    // Si es imagen local
    return `assets/${imagen}`;
  }

  onImageError(event: any) {
    event.target.src = 'assets/no-image.png';
  }

}