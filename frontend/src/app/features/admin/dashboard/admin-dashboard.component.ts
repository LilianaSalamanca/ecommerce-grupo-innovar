import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '@core/services/websocket.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminPedidoService } from '@core/services/admin-pedido.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  mostrarTicketModal = false;

  metrics: any;
  notifications: string[] = [];

  pedidos: any[] = [];
  topProductos: any[] = [];
  ultimosPedidos: any[] = [];

  ticketData: any = {
    hoy: 0,
    mes: 0,
    totalVentas: 0,
    totalPedidos: 0,
    variacion: 0
  };

  constructor(
    private wsService: WebSocketService,
    private router: Router,
    private route: ActivatedRoute,
    private pedidoService: AdminPedidoService
  ) {}

  ngOnInit(): void {

    // MÉTRICAS (websocket)
    this.wsService.connect((data) => {
      console.log("📡 Métricas recibidas:", data);
      this.metrics = data;
      this.generateNotifications();
    });

    // PEDIDOS REALES (API)
    this.cargarPedidos();
  }

  // =========================
  // CARGAR PEDIDOS
  // =========================
  cargarPedidos() {
    this.pedidoService.listar(0, 1000).subscribe({
      next: (res: any) => {

        this.pedidos = res.content || res || [];

        console.log("Pedidos cargados:", this.pedidos.length);

        // ORDENAR POR FECHA DESC (más reciente primero)
        this.ultimosPedidos = [...this.pedidos]
          .sort((a, b) =>
            new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
          )
          .slice(0, 5); // solo 5

        this.calcularTopProductos();
      },
      error: (err) => {
        console.error("Error cargando pedidos", err);
      }
    });
  }

  // =========================
  // NOTIFICACIONES
  // =========================
  generateNotifications() {
    this.notifications = [];

    if (this.metrics?.pedidosPendientes > 0) {
      this.notifications.push(`🟡 ${this.metrics.pedidosPendientes} pedidos pendientes`);
    }

    if (this.metrics?.productosSinStock > 0) {
      this.notifications.push(`🔴 ${this.metrics.productosSinStock} productos sin stock`);
    }
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  irAPedidos(tipo: string) {

    let queryParams: any = {};

    if (tipo === 'hoy') queryParams = { fecha: 'hoy' };
    if (tipo === 'mes') queryParams = { fecha: 'mes' };
    if (tipo === 'pendientes') queryParams = { estado: 'PENDIENTE' };

    this.router.navigate(['../pedidos'], {
      relativeTo: this.route,
      queryParams
    });
  }

  irAPedidosEstado(estado: string) {
    this.router.navigate(['../pedidos'], {
      relativeTo: this.route,
      queryParams: { estado }
    });
  }

  // =========================
  // 📊 MODAL TICKET
  // =========================
  abrirTicketModal() {
    this.calcularMetricasTicket();
    this.mostrarTicketModal = true;
  }

  cerrarTicketModal() {
    this.mostrarTicketModal = false;
  }

  calcularMetricasTicket() {

    if (!this.pedidos || this.pedidos.length === 0) {
      console.warn("No hay pedidos, usando fallback");
      return;
    }

    const hoy = new Date();

    const pedidosHoy = this.pedidos.filter((p: any) => {
      const fecha = new Date(p.fechaCreacion);

      return fecha.getFullYear() === hoy.getFullYear() &&
             fecha.getMonth() === hoy.getMonth() &&
             fecha.getDate() === hoy.getDate();
    });

    const pedidosMes = this.pedidos.filter((p: any) => {
      const fecha = new Date(p.fechaCreacion);
      const ahora = new Date();
      return fecha.getMonth() === ahora.getMonth() &&
             fecha.getFullYear() === ahora.getFullYear();
    });

    const totalHoy = pedidosHoy.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
    const ticketHoy = pedidosHoy.length ? totalHoy / pedidosHoy.length : 0;

    const totalMes = pedidosMes.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
    const ticketMes = pedidosMes.length ? totalMes / pedidosMes.length : 0;

    const variacionRaw = ticketMes
      ? ((ticketHoy - ticketMes) / ticketMes) * 100
      : 0;

    const variacion = Math.round(variacionRaw * 10) / 10;

    this.ticketData = {
      hoy: ticketHoy,
      mes: ticketMes,
      totalVentas: totalMes,
      totalPedidos: pedidosMes.length,
      variacion: variacion
    };

    console.log("TicketData:", this.ticketData);
  }

  // =========================
  // TOP PRODUCTOS
  // =========================
  calcularTopProductos() {

    if (!this.pedidos || this.pedidos.length === 0) {
      console.warn("No hay pedidos para calcular top productos");
      return;
    }

    const mapa: any = {};

    this.pedidos.forEach((p: any) => {
      (p.productos || []).forEach((prod: any) => {

        if (!mapa[prod.nombreProducto]) {
          mapa[prod.nombreProducto] = 0;
        }

        mapa[prod.nombreProducto] += prod.cantidad;
      });
    });

    this.topProductos = Object.keys(mapa)
      .map(nombre => ({
        nombre,
        cantidad: mapa[nombre]
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    console.log("Top productos:", this.topProductos);
  }
}