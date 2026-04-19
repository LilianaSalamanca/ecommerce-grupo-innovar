import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Categoria { id: number; nombre: string; }
interface Subcategoria { id: number; nombre: string; }

export interface Producto {
  id: number;
  referencia: string;
  nombre: string;
  descripcion: string;
  precioPublico: number;
  precioMayorista: number;
  marca: string;
  stock: number;
  imagenDestacada: string;
  categoria: Categoria;
  subcategoria: Subcategoria;
}

@Component({
  selector: 'app-producto-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detalles.component.html',
  styleUrls: ['./producto-detalles.component.scss']
})
export class ProductoDetallesComponent {
  
  @Input() producto: Producto | null = null;  // Producto a mostrar
  @Input() abierto: boolean = false;          // Control del modal
  @Output() cerrar = new EventEmitter<void>(); // Evento para cerrar el modal

  cerrarModal() {
    this.cerrar.emit();
  }
}