import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/api/admin/usuarios`;

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/me`);
  }

  actualizarPerfil(data: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/update-profile`, data);
  }

  cambiarPassword(data: { actual: string; nueva: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, {
      currentPassword: data.actual,
      newPassword: data.nueva
    });
  }
}