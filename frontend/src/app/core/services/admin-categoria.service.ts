import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subcategoria {
  id: number;
  nombre: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  subcategorias: Subcategoria[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminCategoriaService {

  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.api}/categorias`);
  }

  crearCategoria(categoria: Partial<Categoria>) {
    return this.http.post(`${this.api}/categorias`, categoria);
  }

  actualizarCategoria(id: number, categoria: Partial<Categoria>) {
    return this.http.put(`${this.api}/categorias/${id}`, categoria);
  }

  eliminarCategoria(id: number) {
    return this.http.delete(`${this.api}/categorias/${id}`);
  }

  crearSubcategoria(subcategoria: any) {
    return this.http.post(`${this.api}/subcategorias`, subcategoria);
  }

  actualizarSubcategoria(id: number, subcategoria: any) {
    return this.http.put(`${this.api}/subcategorias/${id}`, subcategoria);
  }

  eliminarSubcategoria(id: number) {
    return this.http.delete(`${this.api}/subcategorias/${id}`);
  }
}