import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '@core/services/orders.service';
import { EstadoPago, EstadoPedido } from '@core/enums/order-status.enum';

interface TimelineStep {
  label: string;
  status: EstadoPedido;
  completed: boolean;
  active: boolean;
  cancelled?: boolean;
  date?: string | null;
}

declare var WidgetCheckout: any;

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {

  order: any;
  loading = true;
  timelineSteps: TimelineStep[] = [];

  readonly ESTADO_PAGO = EstadoPago;
  readonly ESTADO_PEDIDO = EstadoPedido;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrdersService,
    private router: Router
    
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0)
    
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.buildTimeline();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  };

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

  canPayNow(): boolean {

    if (!this.order) return false;

    return [
      EstadoPago.PENDIENTE,
      EstadoPago.RECHAZADO,
      EstadoPago.PAGO_FALLIDO
    ].includes(this.order.estadoPago);
  }

  payNow(): void {

  if (!this.order) return;

  this.orderService
    .getWompiWidgetData(this.order.id)
    .subscribe({

      next: (data) => {

        const widget = new WidgetCheckout({

          currency: 'COP',

          amountInCents: data.amountInCents,

          reference: data.reference,

          publicKey: data.publicKey,

          signature: {
            integrity: data.integritySignature
          }

        });

        widget.open((result: any) => {

          console.log(result);

          if (
            result?.transaction?.status === 'APPROVED'
          ) {

            window.location.reload();

          }

        });

      },

      error: (err) => {
        console.error(err);
      }

    });
}

  buildTimeline(): void {

    const steps = [
      {
        status: EstadoPedido.PENDIENTE,
        label: 'PENDIENTE',
        date: this.order.fechaCreacion
      },
      {
        status: EstadoPedido.PROCESANDO,
        label: 'PROCESANDO',
        date: this.order.fechaProcesando
      },
      {
        status: EstadoPedido.ENVIADO,
        label: 'ENVIADO',
        date: this.order.fechaEnviado
      },
      {
        status: EstadoPedido.COMPLETADO,
        label: 'COMPLETADO',
        date: this.order.fechaCompletado
      }
    ];

    const currentIndex = steps.findIndex(
      s => s.status === this.order.estadoPedido
    );

    this.timelineSteps = steps.map((step, index) => {

      return {
        label: step.label,
        status: step.status,
        date: step.date,
        completed: index < currentIndex,
        active: index === currentIndex
      };

    });

    // CANCELADO
    if (this.order.estadoPedido === EstadoPedido.CANCELADO) {

      this.timelineSteps.push({
        label: 'CANCELADO',
        status: EstadoPedido.CANCELADO,
        completed: false,
        active: true,
        cancelled: true,
        date: this.order.fechaCancelado
      });

    }
  }
}