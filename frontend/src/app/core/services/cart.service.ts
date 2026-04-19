import { Injectable } from '@angular/core';
import { Producto } from '../models/producto.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private carrito: { producto: Producto; cantidad: number }[] = [];
  
  private carritoSubject = new BehaviorSubject<{ producto: Producto; cantidad: number }[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  private itemCountSubject = new BehaviorSubject<number>(0);
  itemCount$ = this.itemCountSubject.asObservable();

  private carritoVisibleSubject = new BehaviorSubject<boolean>(false);
  carritoVisible$ = this.carritoVisibleSubject.asObservable();

  private readonly minimoMayorista = 5;
  private readonly compraMinima = 50000;

  private readonly costoEnvio = 15000;

  private actualizarContador() {
    const total = this.obtenerCantidadTotal();
    this.carritoSubject.next(this.carrito);
    this.itemCountSubject.next(total);
  }
  
  agregarAlCarrito(producto: Producto, cantidad = 1): void {
    const existente = this.carrito.find(p => p.producto.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({ producto: { ...producto }, cantidad });
    }
    this.actualizarContador();
    this.mostrarSidebarCarrito();
  }

  obtenerCarrito() {
    return this.carrito;
  }

  vaciarCarrito(){
    this.carrito = [];
    this.actualizarContador();
  }

  eliminarProducto(id: number): void {
    this.carrito = this.carrito.filter(p => p.producto.id !== id);
    this.actualizarContador();
  }

  aumentarCantidad(id: number): void {
    const item = this.carrito.find(p => p.producto.id === id);
    if (item) item.cantidad += 1;
    this.actualizarContador();
  }

  disminuirCantidad(id: number): void {
    const item = this.carrito.find(p => p.producto.id === id);
    if (item && item.cantidad > 1) item.cantidad -= 1;
    this.actualizarContador();
  }

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
      const precioUnitario = item.cantidad >= this.minimoMayorista
        ? item.producto.precioMayorista
        : item.producto.precioPublico;
      return total + (precioUnitario * item.cantidad);
    }, 0);
  }

  obtenerCantidadTotal(): number {
    return this.carrito.reduce((suma, item) => suma + item.cantidad, 0);
  }

  getItemCount(): number {
    return this.obtenerCantidadTotal();
  }

  mostrarSidebarCarrito() {
    this.carritoVisibleSubject.next(true);
  }

  ocultarSidebarCarrito() {
    this.carritoVisibleSubject.next(false);
  }

  actualizarCantidad(id: number, nuevaCantidad: number): void {
    const item = this.carrito.find(p => p.producto.id === id);
    if (item) {
      item.cantidad = nuevaCantidad;
      this.actualizarContador();
    }
  }

  getSubtotal(): number {
    return this.obtenerTotalCarrito();
  }

  obtenerTotalCarritoSinEnvio(): number {
    return this.obtenerTotalCarrito();
  }

  /* =========================
     LÓGICA DE ENVÍO
     ========================= */

  tieneMayorista(): boolean {
    return this.carrito.some(item => item.cantidad >= this.minimoMayorista);
  }

  aplicaEnvioGratis(): boolean {
    const total = this.obtenerTotalCarrito();
    const tieneMayorista = this.tieneMayorista();

    // misma lógica del backend
    if (!tieneMayorista) return true;
    if (total >= 600000) return true;

    return false;
  }

  faltanteEnvioGratis(): number {
    if (!this.tieneMayorista()) return 0;

    const faltante = 600000 - this.obtenerTotalCarrito();
    return faltante > 0 ? faltante : 0;
  }

  // NUEVO → costo de envío real
  obtenerCostoEnvio(): number {
    return this.aplicaEnvioGratis() ? 0 : this.costoEnvio;
  }

  // NUEVO → total final
  obtenerTotalConEnvio(): number {
    return this.obtenerTotalCarrito() + this.obtenerCostoEnvio();
  }

  /* =========================
     COMPRA MÍNIMA
     ========================= */

  cumpleCompraMinima(): boolean {
    return this.obtenerTotalCarrito() >= this.compraMinima;
  }

  faltanteCompraMinima(): number {
    const faltante = this.compraMinima - this.obtenerTotalCarrito();
    return faltante > 0 ? faltante : 0;
  }
}