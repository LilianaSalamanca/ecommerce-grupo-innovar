import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, Subcategoria } from '@core/models/producto.model';
import { environment } from 'environments/environment';

const API_PRODUCTOS = `${environment.apiUrl}/api/admin/productos`;
const API_CATEGORIAS = `${environment.apiUrl}/api/categorias`;
const API_SUBCATEGORIAS = `${environment.apiUrl}/api/subcategorias`;

@Injectable({
  providedIn: 'root'
})
export class AdminProductoService {

  constructor(private http: HttpClient) {}

  // ================= PRODUCTOS =================

  listar(page: number, size: number): Observable<any> {
    return this.http.get(`${API_PRODUCTOS}?page=${page}&size=${size}`);
  }

  crear(producto: any) {
    return this.http.post(API_PRODUCTOS, producto);
  }

  actualizar(id: number, producto: any) {
    return this.http.put(`${API_PRODUCTOS}/${id}`, producto);
  }

  eliminar(id: number) {
    return this.http.delete(`${API_PRODUCTOS}/${id}`);
  }

  // ================= CATEGORIAS =================

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(API_CATEGORIAS);
  }

  // ================= SUBCATEGORIAS =================

  listarSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(API_SUBCATEGORIAS);
  }

}