import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface ConfirmarPagoWompiRequest {
  pedidoId: number;
  transactionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);
  
  private readonly apiUrl = `${environment.apiUrl}/api/pagos`;

  confirmarPagoWompi(
    payload: ConfirmarPagoWompiRequest
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/wompi/confirmar`,
      payload
    );
  }
}
