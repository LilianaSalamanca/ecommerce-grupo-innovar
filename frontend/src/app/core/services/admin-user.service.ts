import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Page } from '../models/page.model';
import { environment } from 'environments/environment';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol?: 'USUARIO' | 'ADMIN';
  activo?: boolean;
  invitado?: boolean;
  tipoUsuario?: 'PUBLICO' | 'MAYORISTA';
  fechaRegistro?: string;
  ultimoLogin?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {

  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/api/admin/usuarios`;

  listarUsuarios(paramsObj: any): Observable<Page<Usuario>> {

    let params = new HttpParams();

    Object.keys(paramsObj).forEach(key => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== ''
      ) {
        params = params.set(key, paramsObj[key]);
      }
    });

    return this.http.get<Page<Usuario>>(this.API_URL, { params });
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  cambiarEstado(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/${id}/estado`, {});
  }
}

