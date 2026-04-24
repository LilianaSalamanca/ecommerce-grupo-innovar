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

  listar(page: number, size: number): Observable<any> {
    return this.http.get(`${API_PRODUCTOS}?page=${page}&size=${size}`);
  }

  crear(producto: any, imagen: File): Observable<any> {
    const formData = this.buildFormData(producto, imagen);
    return this.http.post(API_PRODUCTOS, formData);
  }

  actualizar(id: number, producto: any, imagen?: File): Observable<any> {
    const formData = this.buildFormData(producto, imagen);
    return this.http.put(`${API_PRODUCTOS}/${id}`, formData);
  }

  eliminar(id: number) {
    return this.http.delete(`${API_PRODUCTOS}/${id}`);
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(API_CATEGORIAS);
  }

  listarSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(API_SUBCATEGORIAS);
  }

  // Reutilizable
  private buildFormData(producto: any, imagen?: File): FormData {
    const formData = new FormData();

    formData.append('nombre', producto.nombre);
    formData.append('referencia', producto.referencia);
    formData.append('descripcion', producto.descripcion);
    formData.append('precioPublico', String(producto.precioPublico));
    formData.append('precioMayorista', String(producto.precioMayorista));
    formData.append('marca', producto.marca);
    formData.append('stock', String(producto.stock));

    formData.append('categoriaId', String(producto.categoria.id));
    formData.append('subcategoriaId', String(producto.subcategoria.id));

    if (imagen) {
      formData.append('imagen', imagen);
    }

    return formData;
  }
}