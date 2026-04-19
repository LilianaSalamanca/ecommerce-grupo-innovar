import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { CheckoutRequest, CheckoutResponse } from '../models/checkout.model';
import { environment } from 'environments/environment';

export interface ConfirmarPagoWompiPayload {
  pedidoId: number;
  transactionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private http = inject(HttpClient);

  // Idealmente usar environment.apiUrl
  private apiUrl = `${environment.apiUrl}/api/checkout`;

  /* ---------------- INICIAR CHECKOUT ---------------- */

  iniciarCheckout(req: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http
      .post<CheckoutResponse>(this.apiUrl, req)
      .pipe(map(resp => this.normalizarResponse(resp)));
  }

  /* ---------------- CONFIRMAR WOMPI ---------------- */

  confirmarPagoWompi(
    payload: ConfirmarPagoWompiPayload
  ): Observable<CheckoutResponse> {
    return this.http
      .post<CheckoutResponse>(`${this.apiUrl}/wompi/confirmar`, payload)
      .pipe(map(resp => this.normalizarResponse(resp)));
  }

  /* ---------------- HELPERS ---------------- */

  private normalizarResponse(resp: CheckoutResponse): CheckoutResponse {
    const r: any = { ...resp };

    if (typeof r.total === 'string') {
      r.total = Number(r.total);
    }

    if (typeof r.amountInCents === 'string') {
      r.amountInCents = Number(r.amountInCents);
    }

    return r as CheckoutResponse;
  }

  obtenerPerfil() {
    return this.http.get<any>(`${environment.apiUrl}/api/usuarios/me`);
  }
}
