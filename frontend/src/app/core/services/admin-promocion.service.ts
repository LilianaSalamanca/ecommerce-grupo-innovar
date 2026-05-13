import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

const API_PROMOCIONES = `${environment.apiUrl}/api/promociones`;

export interface Promocion {

  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  botonTexto: string;
  enlace: string;
  activa: boolean;
  prioridad: number;
  fechaInicio: string;
  fechaFin: string;

}

@Injectable({
  providedIn: 'root'
})
export class AdminPromocionService {

  constructor(private http: HttpClient) {}

  listar(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(API_PROMOCIONES);
  }

  listarActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(
      `${API_PROMOCIONES}/activas`
    );
  }

  crear(promocion: Partial<Promocion>) {
    return this.http.post(API_PROMOCIONES, promocion);
  }

  actualizar(id: number, promocion: Partial<Promocion>) {
    return this.http.put(
      `${API_PROMOCIONES}/${id}`,
      promocion
    );
  }

  eliminar(id: number) {
    return this.http.delete(
      `${API_PROMOCIONES}/${id}`
    );
  }
}