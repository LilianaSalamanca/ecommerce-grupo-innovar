import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

/* ================= MODELOS ================= */

export interface Pedido {
  id: number;

  nombreCliente: string;
  apellidoCliente: string;
  emailCliente: string;
  telefonoCliente: string;

  direccionEnvio: string;
  ciudadEnvio: string;
  departamentoEnvio: string;
  codigoPostalEnvio: string;

  subtotal: number;
  costoEnvio: number;
  total: number;

  estadoPedido: string;

  fechaCreacion: string;
  fechaActualizacion?: string;

  estadoPago:
    | 'PENDIENTE'
    | 'APROBADO'
    | 'RECHAZADO'
    | 'PAGO_FALLIDO'
    | 'CANCELADO'
    | 'EN_WALLET';

  metodoPago?: 'WOMPI' | 'CONTRA_ENTREGA';
  idTransaccion?: string;
  fechaPago?: string | Date;

  productos: ProductoPedido[];
}

export interface ProductoPedido {
  productoId: number;
  nombreProducto: string;
  imagen: string;

  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/* ================= RESPUESTA PAGINADA ================= */

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

/* ================= SERVICE ================= */

@Injectable({
  providedIn: 'root'
})
export class AdminPedidoService {

  private apiUrl = `${environment.apiUrl}/api/admin/pedidos`;

  constructor(private http: HttpClient) {}

  /* ================= LISTAR ================= */

  listar(
    page: number,
    size: number,
    email?: string,
    estado?: string,
    fechaInicio?: string
  ): Observable<PageResponse<Pedido>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (email) params = params.set('email', email);
    if (estado) params = params.set('estado', estado);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);

    return this.http.get<PageResponse<Pedido>>(this.apiUrl, { params });
  }

  /* ================= ESTADO PEDIDO ================= */

  actualizarEstado(id: number, estado: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}/estado`,
      {},
      {
        params: { estado }
      }
    );
  }

  /* ================= ESTADO PAGO ================= */

  actualizarEstadoPago(
    pedidoId: number,
    estado: Pedido['estadoPago']
  ): Observable<void> {

    return this.http.put<void>(
      `${this.apiUrl}/${pedidoId}/estado-pago`,
      {},
      {
        params: { estado }
      }
    );
  }

  /* ================= ELIMINAR ================= */

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}