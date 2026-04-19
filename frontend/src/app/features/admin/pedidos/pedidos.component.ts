import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPedidoService, Pedido } from '@core/services/admin-pedido.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {

  pedidos: Pedido[] = [];
  loading = false;

  emailFiltro = '';
  estadoFiltro = '';
  fechaInicio = '';

  paginaActual = 0;
  elementosPorPagina = 20;
  totalPaginas = 0;

  pedidoSeleccionado: Pedido | null = null;

  constructor(
    private adminPedidoService: AdminPedidoService,
    private route: ActivatedRoute
  ) {}

  private filtroSubject = new Subject<void>();

  message = '';
  messageType: 'success' | 'error' = 'success';
  private timeoutId: any;

  modalConfirmacionAbierto = false;
  pedidoAAccion: Pedido | null = null;
  mensajeConfirmacion = '';

  estados = ['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'COMPLETADO', 'CANCELADO'];

  estadosPago: Pedido['estadoPago'][] = [
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO',
    'PAGO_FALLIDO',
    'CANCELADO',
    'EN_WALLET'
  ];

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      if (params['fecha'] === 'hoy') this.filtrarHoy();
      if (params['fecha'] === 'mes') this.filtrarMes();

      if (params['estado']) {
        this.estadoFiltro = params['estado'];
        this.cargarPedidos();
      }
    });

    this.filtroSubject
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.paginaActual = 0;
        this.cargarPedidos();
      });

    this.cargarPedidos();
  }

  private formatearFechaLocal(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  cargarPedidos() {
    this.loading = true;

    this.adminPedidoService
      .listar(
        this.paginaActual,
        this.elementosPorPagina,
        this.emailFiltro,
        this.estadoFiltro,
        this.fechaInicio
      )
      .subscribe({
        next: (data) => {
          this.pedidos = data.content;
          this.totalPaginas = data.totalPages;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showMessage('Error al cargar pedidos', 'error');
        }
      });
  }

  abrirDetalles(pedido: Pedido) {
    this.pedidoSeleccionado = pedido;
  }

  cerrarDetalles() {
    this.pedidoSeleccionado = null;
  }

  // LÓGICA COMPLETA ALINEADA AL BACKEND
  esEstadoValido(pedido: Pedido, destino: string): boolean {

    const estado = pedido.estadoPedido;
    const pago = pedido.estadoPago;
    const metodo = pedido.metodoPago;

    if (estado === 'COMPLETADO' || estado === 'CANCELADO') return false;

    const flujoValido =
      (estado === 'PENDIENTE' && (destino === 'PROCESANDO' || destino === 'CANCELADO')) ||
      (estado === 'PROCESANDO' && (destino === 'ENVIADO' || destino === 'CANCELADO')) ||
      (estado === 'ENVIADO' && destino === 'COMPLETADO');

    if (!flujoValido) return false;

    if (metodo === 'WOMPI') {
      if (
        (destino === 'PROCESANDO' || destino === 'COMPLETADO') &&
        pago !== 'APROBADO'
      ) return false;
    }

    if (metodo === 'CONTRA_ENTREGA') {
      if (destino === 'COMPLETADO' && pago !== 'APROBADO') return false;
    }

    return true;
  }

  cambiarEstado(pedido: Pedido, estado: string) {
    this.adminPedidoService.actualizarEstado(pedido.id, estado).subscribe({
      next: () => {
        this.showMessage(`Pedido #${pedido.id} actualizado a ${estado}`, 'success');
        this.cargarPedidos();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al actualizar estado';
        this.showMessage(msg, 'error');
      }
    });
  }

  cambiarEstadoPago(pedido: Pedido, estado: Pedido['estadoPago']) {

    if (estado === 'EN_WALLET') {
      this.showMessage('Este estado es automático', 'error');
      return;
    }

    if (pedido.estadoPago === estado) return;

    this.adminPedidoService.actualizarEstadoPago(pedido.id, estado).subscribe({
      next: () => {
        this.showMessage(`Pago actualizado a ${this.getTextoEstadoPago(estado)}`, 'success');
        this.cargarPedidos();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al actualizar el pago';
        this.showMessage(msg, 'error');
      }
    });
  }

  // REGLAS PAGO ALINEADAS
  getEstadosPagoDisponibles(pedido: Pedido): Pedido['estadoPago'][] {

    if (pedido.estadoPedido === 'COMPLETADO' || pedido.estadoPedido === 'CANCELADO') {
      return [];
    }

    if (pedido.estadoPago === 'EN_WALLET') return [];

    if (pedido.metodoPago === 'CONTRA_ENTREGA') {
      return pedido.estadoPago === 'PENDIENTE' ? ['APROBADO'] : [];
    }

    if (pedido.metodoPago === 'WOMPI') {
      if (pedido.estadoPago === 'PENDIENTE') {
        return ['APROBADO', 'RECHAZADO', 'PAGO_FALLIDO'];
      }
    }

    return [];
  }

  getOpcionesEstadoPago(pedido: Pedido): Pedido['estadoPago'][] {
    return [pedido.estadoPago, ...this.getEstadosPagoDisponibles(pedido)];
  }

  getClaseEstadoPago(estado: Pedido['estadoPago']): string {
    switch (estado) {
      case 'APROBADO': return 'aprobado';
      case 'PENDIENTE': return 'pendiente';
      case 'RECHAZADO':
      case 'PAGO_FALLIDO': return 'rechazado';
      case 'CANCELADO': return 'cancelado';
      case 'EN_WALLET': return 'en_wallet';
      default: return '';
    }
  }

  getTextoEstadoPago(estado: Pedido['estadoPago']): string {
    if (estado === 'PAGO_FALLIDO') return 'FALLIDO';
    if (estado === 'EN_WALLET') return 'SALDO';
    return estado;
  }

  puedeCancelar(pedido: Pedido): boolean {
    return !['COMPLETADO', 'CANCELADO'].includes(pedido.estadoPedido);
  }

  solicitarCancelarPedido(pedido: Pedido) {
    if (!this.puedeCancelar(pedido)) return;

    this.pedidoAAccion = pedido;
    this.mensajeConfirmacion = `¿Cancelar pedido #${pedido.id}?`;
    this.modalConfirmacionAbierto = true;
  }

  confirmarCancelar() {
    if (!this.pedidoAAccion) return;

    this.adminPedidoService
      .actualizarEstado(this.pedidoAAccion.id, 'CANCELADO')
      .subscribe(() => {
        this.showMessage('Pedido cancelado', 'success');
        this.cerrarModalConfirmacion();
        this.cargarPedidos();
      });
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.pedidoAAccion = null;
  }

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
      this.cargarPedidos();
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarPedidos();
    }
  }

  limpiarFiltros() {
    this.emailFiltro = '';
    this.estadoFiltro = '';
    this.fechaInicio = '';
    this.paginaActual = 0;
    this.cargarPedidos();
  }

  onFiltroChange() {
    this.filtroSubject.next();
  }

  filtrarHoy() {
    this.fechaInicio = this.formatearFechaLocal(new Date());
    this.cargarPedidos();
  }

  filtrarMes() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = this.formatearFechaLocal(inicioMes);
    this.cargarPedidos();
  }

  private showMessage(msg: string, type: 'success' | 'error' = 'success', duration = 3000) {
    clearTimeout(this.timeoutId);
    this.message = msg;
    this.messageType = type;
    this.timeoutId = setTimeout(() => this.message = '', duration);
  }

  getMensajeCancelacion(pedido: Pedido): string {

    if (pedido.estadoPedido === 'COMPLETADO') {
      return 'El pedido ya fue completado';
    }

    if (pedido.estadoPedido === 'CANCELADO') {
      return 'El pedido ya fue cancelado';
    }

    if (pedido.estadoPedido === 'ENVIADO') {
      return 'El pedido ya fue enviado';
    }

    return '';
  }

  esSelectEstadoPedidoDeshabilitado(pedido: Pedido): boolean {
    return (
      pedido.estadoPedido === 'COMPLETADO' ||
      pedido.estadoPedido === 'CANCELADO' ||
      (pedido.metodoPago === 'WOMPI' && pedido.estadoPago !== 'APROBADO')
    );
  }

  esSelectEstadoPagoDeshabilitado(pedido: Pedido): boolean {
    return (
      this.getEstadosPagoDisponibles(pedido).length === 0 ||
      pedido.estadoPedido === 'COMPLETADO' ||
      pedido.estadoPedido === 'CANCELADO'
    );
  }
}