import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { EstadoPago, EstadoPedido, OrderItem } from '@core/enums/order-status.enum';

export interface Order {
  id: number;

  estadoPedido: EstadoPedido;
  estadoPago: EstadoPago;

  metodoPago: string;

  total: number;
  subtotal: number;
  costoEnvio: number;

  fechaCreacion: string;

  fechaProcesando?: string;
  fechaEnviado?: string;
  fechaCompletado?: string;
  fechaCancelado?: string;

  checkoutUrl?: string;

  detalles: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private apiUrl = `${environment.apiUrl}/api/pedidos`;
  
  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mis-pedidos`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getWompiWidgetData(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/${id}/wompi-widget`
    );
  }
}
