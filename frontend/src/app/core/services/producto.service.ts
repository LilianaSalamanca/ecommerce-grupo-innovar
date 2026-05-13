import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categoria, Producto, ProductoDTO, Subcategoria } from '../models/producto.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = `${environment.apiUrl}/api`;
  
  currentTerminoBusqueda = '';

  private terminoBusquedaSubject = new BehaviorSubject<string>(this.currentTerminoBusqueda);
  terminoBusqueda$ = this.terminoBusquedaSubject.asObservable();  

  private categoriaSubject = new BehaviorSubject<number | null>(null);
  categoria$ = this.categoriaSubject.asObservable();

  private subcategoriaSubject = new BehaviorSubject<number | null>(null);
  subcategoria$ = this.subcategoriaSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────
  // Productos
  // ─────────────────────────────────────

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  obtenerProductosById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  crearProducto(producto: ProductoDTO): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto);
  }

  actualizarProducto(id: number, producto: ProductoDTO): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`);
  }

  // ─────────────────────────────────────
  // Categorías y Subcategorías
  // ─────────────────────────────────────

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  obtenerSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.apiUrl}/subcategorias`);
  }

  // ─────────────────────────────────────
  // Búsqueda reactiva
  // ─────────────────────────────────────

  actualizarBusqueda(term: string) {

    this.currentTerminoBusqueda = term;

    // si hay búsqueda → limpiar selects
    if (term.trim().length > 0) {
      this.categoriaSubject.next(null);
      this.subcategoriaSubject.next(null);
    }

    this.terminoBusquedaSubject.next(term);
  }

  actualizarCategoria(categoria: number | null) {
    this.categoriaSubject.next(categoria);
  }

  actualizarSubcategoria(subcategoria: number | null) {
    this.subcategoriaSubject.next(subcategoria);
  }

  // ─────────────────────────────────────
  // Productos relacionados
  // ─────────────────────────────────────
  obtenerRelacionados(productId: number) {
    return this.http.get<Producto[]>(
      `${this.apiUrl}/productos/${productId}/relacionados`
    );
  }

  // ─────────────────────────────────────  
  // Promociones
  // ─────────────────────────────────────
  obtenerPromocionesActivas() {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/promociones/activas`
    );
  }

  // ─────────────────────────────────────  
  // Productos Destacados
  // ─────────────────────────────────────
  obtenerProductosDestacados(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/destacados`);
  }

  
}
