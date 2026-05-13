import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Producto } from '../models/producto.model';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { CartApiService } from './cart-api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl = `${environment.apiUrl}`;

  private initialized = false;
  private syncingFromServer = false;

  /* =====================================================
   * STORAGE
   * ===================================================== */
  private readonly STORAGE_KEY = 'cart';

  /* =====================================================
   * STATE
   * ===================================================== */
  private carrito: { producto: Producto; cantidad: number }[] = [];

  private carritoSubject =
    new BehaviorSubject<{ producto: Producto; cantidad: number }[]>([]);

  carrito$ = this.carritoSubject.asObservable();

  private itemCountSubject =
    new BehaviorSubject<number>(0);

  itemCount$ = this.itemCountSubject.asObservable();

  private carritoVisibleSubject =
    new BehaviorSubject<boolean>(false);

  carritoVisible$ = this.carritoVisibleSubject.asObservable();

  /* =====================================================
   * CONFIG
   * ===================================================== */
  private readonly minimoMayorista = 5;
  private readonly compraMinima = 50000;
  private readonly costoEnvio = 15000;

  private isBrowser = false;
  private isLogged = false;

  /* =====================================================
   * CONSTRUCTOR
   * ===================================================== */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private cartApi: CartApiService,
    private http: HttpClient,
  ) {

    this.isBrowser = isPlatformBrowser(platformId);

    this.authService.isLogged$
    .pipe(distinctUntilChanged())
    .subscribe(isLogged => {

      this.isLogged = isLogged;

      if (!this.initialized) return;

      if (isLogged) {
        this.syncLocalCartToServer();
      } else {
        this.restoreLocalCartOnly();
      }
    });
  
    // inicialización única
    if (this.isBrowser) {
      this.restoreLocalCartOnly();
    }
    this.initialized = true;

    window.addEventListener('storage', (event) => {

      if (event.key !== this.STORAGE_KEY) return;

      if (this.isLogged) return; 

      this.restoreLocalCartOnly();
    });
  }

  private restoreLocalCartOnly(): void {

    if (!this.isBrowser) return;

    const data = localStorage.getItem(this.STORAGE_KEY);

    if (!data) {
      this.carrito = [];
      this.emitCart();
      return;
    }

    try {
      this.carrito = JSON.parse(data);
      this.emitCart();
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      this.carrito = [];
      this.emitCart();
    }
  }

  /* =====================================================
   * BACKEND
   * ===================================================== */
  private loadServerCart(): void {

    this.syncingFromServer = true;

    this.cartApi.getCart().subscribe({
      next: (items: any[]) => {

        this.carrito = items.map(i => ({
          producto: i.producto,
          cantidad: i.cantidad
        }));

        this.emitCart();

        this.syncingFromServer = false;
      },
      error: () => {
        this.syncingFromServer = false;
      }
    });
  }

  private getLocalCart(): any[] {

    if (!this.isBrowser) return [];

    const data = localStorage.getItem(this.STORAGE_KEY);

    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private syncLocalCartToServer(): void {

    const localCart = this.getLocalCart();

    if (!localCart.length) {
      this.loadServerCart();
      return;
    }

    const payload = localCart.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad
    }));

    this.cartApi.syncCart(payload).subscribe({
      next: () => {

        // importante:
        // backend ya quedó sincronizado
        // ahora cargamos estado real desde servidor
        this.loadServerCart();

        // limpiar local duplicado
        localStorage.removeItem(this.STORAGE_KEY);
      },
      error: () => {
        this.loadServerCart();
      }
    });
  }

  private syncAdd(productoId: number, cantidad: number) {
    this.cartApi.addItem(productoId, cantidad)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private syncUpdate(productoId: number, cantidad: number) {
    this.cartApi.updateItem(productoId, cantidad)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private syncDelete(productoId: number) {
    this.cartApi.deleteItem(productoId)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  /* =====================================================
   * STATE EMITTER (ÚNICO)
   * ===================================================== */
  private emitCart(): void {
    this.carritoSubject.next([...this.carrito]);
    this.itemCountSubject.next(this.obtenerCantidadTotal());
  }

  private persist(): void {

    this.emitCart();

    // SOLO guardar local si NO estás sincronizando backend
    if (!this.syncingFromServer) {
      this.saveLocal();
    }
  }

  /* =====================================================
   * CRUD 
   * ===================================================== */
  agregarAlCarrito(producto: Producto, cantidad = 1): void {

    const existente = this.carrito.find(
      p => p.producto.id === producto.id
    );

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({
        producto: { ...producto },
        cantidad
      });
    }

    if (this.isLogged) {
      this.syncAdd(producto.id, cantidad);
    }

    this.persist();
    this.mostrarSidebarCarrito();
  }

  eliminarProducto(id: number): void {

    this.carrito = this.carrito.filter(
      p => p.producto.id !== id
    );

    if (this.isLogged) {
      this.syncDelete(id);
    }

    this.persist();
  }

  aumentarCantidad(id: number): void {

    const item = this.carrito.find(p => p.producto.id === id);
    if (!item) return;

    item.cantidad++;

    if (this.isLogged) {
      this.syncUpdate(id, item.cantidad);
    }

    this.persist();
  }

  disminuirCantidad(id: number): void {

    const item = this.carrito.find(p => p.producto.id === id);
    if (!item || item.cantidad <= 1) return;

    item.cantidad--;

    if (this.isLogged) {
      this.syncUpdate(id, item.cantidad);
    }

    this.persist();
  }

  actualizarCantidad(id: number, cantidad: number): void {

    const item = this.carrito.find(p => p.producto.id === id);
    if (!item) return;

    item.cantidad = cantidad;

    if (this.isLogged) {
      this.syncUpdate(id, cantidad);
    }

    this.persist();
  }

  vaciarCarrito(): void {
    this.carrito = [];

    if (this.isLogged) {
      this.cartApi.clearCart()
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.persist();
  }

  obtenerCarrito() {
    return this.carrito;
  }

  getSubtotal(): number {
    return this.obtenerTotalCarrito();
  }

  obtenerTotalCarritoSinEnvio(): number {
    return this.obtenerTotalCarrito();
  }
  /* =====================================================
   * TOTALES (SIN CAMBIOS)
   * ===================================================== */
  calcularPrecioUnitario(producto: Producto, cantidad: number): number {
    return cantidad >= this.minimoMayorista
      ? producto.precioMayorista
      : producto.precioPublico;
  }

  calcularPrecioTotal(producto: Producto, cantidad: number): number {
    return this.calcularPrecioUnitario(producto, cantidad) * cantidad;
  }

  obtenerTotalCarrito(): number {
    return this.carrito.reduce((total, item) => {

      const precio =
        item.cantidad >= this.minimoMayorista
          ? item.producto.precioMayorista
          : item.producto.precioPublico;

      return total + (precio * item.cantidad);

    }, 0);
  }

  obtenerCantidadTotal(): number {
    return this.carrito.reduce((s, i) => s + i.cantidad, 0);
  }

  getItemCount(): number {
    return this.obtenerCantidadTotal();
  }

  /* =====================================================
   * ENVÍO (SIN CAMBIOS)
   * ===================================================== */
  tieneMayorista(): boolean {
    return this.carrito.some(i => i.cantidad >= this.minimoMayorista);
  }

  aplicaEnvioGratis(): boolean {
    const total = this.obtenerTotalCarrito();
    if (!this.tieneMayorista()) return true;
    return total >= 600000;
  }

  faltanteEnvioGratis(): number {
    if (!this.tieneMayorista()) return 0;

    const faltante = 600000 - this.obtenerTotalCarrito();
    return faltante > 0 ? faltante : 0;
  }

  obtenerCostoEnvio(): number {
    return this.aplicaEnvioGratis() ? 0 : this.costoEnvio;
  }

  obtenerTotalConEnvio(): number {
    return this.obtenerTotalCarrito() + this.obtenerCostoEnvio();
  }

  /* =====================================================
   * UI
   * ===================================================== */
  mostrarSidebarCarrito(): void {
    this.carritoVisibleSubject.next(true);
  }

  ocultarSidebarCarrito(): void {
    this.carritoVisibleSubject.next(false);
  }


  /* =====================================================
   * COMPRA MÍNIMA
   * ===================================================== */
  cumpleCompraMinima(): boolean {
    return this.obtenerTotalCarrito() >= this.compraMinima;
  }

  faltanteCompraMinima(): number {

    const faltante = this.compraMinima - this.obtenerTotalCarrito();

    return faltante > 0 ? faltante : 0;
  }

  private saveLocal(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.carrito));
  }
}