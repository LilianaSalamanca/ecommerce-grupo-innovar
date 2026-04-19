import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminProductoService } from '@core/services/admin-producto.service';
import { ProductoDetallesComponent } from './ProductoDetalle/producto-detalles.component';

interface Categoria { id: number; nombre: string; }
interface Subcategoria { id: number; nombre: string; }

interface Producto {
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
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductoDetallesComponent],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  productosOriginales: Producto[] = [];

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];

  loading = false;

  // Modal Crear/Editar
  modalAbierto = false;
  nuevoProducto: Partial<Producto> = {};
  editandoProducto = false;

  // Modal Detalles
  modalDetallesAbierto = false;
  productoDetalle: Producto | null = null;

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  itemsPorPagina = 20;

  // ================= FILTRO =================
  filtroNombre: string = '';

  // ================= MENSAJES =================
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  private timeoutId: any;

  // ================= MODAL CONFIRMACIÓN =================
  modalConfirmacionAbierto = false;
  productoAEliminar: Producto | null = null;
  mensajeConfirmacion: string = '';

  constructor(private adminProductoService: AdminProductoService) {}

  previewImagen: string | ArrayBuffer | null = null;
  imagenFile!: File;

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarSubcategorias();
    this.cargarProductos();
  }

  // ================= CARGAR PRODUCTOS =================
  cargarProductos() {

    this.loading = true;

    this.adminProductoService
      .listar(this.paginaActual - 1, this.itemsPorPagina)
      .subscribe({

        next: (data) => {

          this.productos = data.content;
          this.productosOriginales = [...data.content];

          this.totalPaginas = data.totalPages;

          this.loading = false;

        },

        error: (err) => {

          console.error(err);
          this.loading = false;
          this.showMessage('Error al cargar productos', 'error');

        }

      });

  }

  // ================= FILTRAR PRODUCTOS =================
  filtrarProductos() {

    const filtro = this.normalizarTexto(this.filtroNombre);

    if (!filtro) {
      this.productos = [...this.productosOriginales];
      return;
    }

    this.productos = this.productosOriginales.filter(producto => {

      const nombreProducto = this.normalizarTexto(producto.nombre);

      return nombreProducto.includes(filtro);

    });

  }

  // ================= CARGAR CATEGORÍAS =================
  cargarCategorias() {

    this.adminProductoService
      .listarCategorias()
      .subscribe({

        next: (data) => this.categorias = data,
        error: (err) => console.error('Error al cargar categorías', err)

      });

  }

  // ================= CARGAR SUBCATEGORÍAS =================
  cargarSubcategorias() {

    this.adminProductoService
      .listarSubcategorias()
      .subscribe({

        next: (data) => this.subcategorias = data,
        error: (err) => console.error('Error al cargar subcategorías', err)

      });

  }

  // ================= MODAL CREAR/EDITAR =================
  abrirModal() {

    this.nuevoProducto = {
      precioPublico: 0,
      precioMayorista: 0,
      stock: 0,
      imagenDestacada: '',
      categoria: this.categorias[0] ?? undefined,
      subcategoria: this.subcategorias[0] ?? undefined
    };

    this.editandoProducto = false;
    this.modalAbierto = true;

  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarProducto() {

    if(
      !this.nuevoProducto.nombre ||
      !this.nuevoProducto.referencia ||
      !this.nuevoProducto.marca ||
      this.nuevoProducto.precioPublico === undefined ||
      this.nuevoProducto.precioMayorista === undefined
    ){
      this.showMessage('Completa todos los campos obligatorios', 'error');
      return;
    }

    if (!this.nuevoProducto) return;

    if (this.editandoProducto) {

      this.adminProductoService
        .actualizar(this.nuevoProducto.id!, this.nuevoProducto)
        .subscribe({

          next: () => {

            this.cerrarModal();
            this.cargarProductos();

            this.showMessage(
              `Producto "${this.nuevoProducto.nombre}" actualizado correctamente`,
              'success'
            );

          },

          error: () => this.showMessage('Error al actualizar producto', 'error')

        });

    } else {

      this.adminProductoService
        .crear(this.nuevoProducto)
        .subscribe({

          next: () => {

            this.cerrarModal();
            this.cargarProductos();

            this.showMessage(
              `Producto "${this.nuevoProducto.nombre}" creado correctamente`,
              'success'
            );

          },

          error: () => this.showMessage('Error al crear producto', 'error')

        });

    }

  }

  // ================= ELIMINAR PRODUCTO =================
  eliminarProducto(id: number) {

    const producto = this.productos.find(p => p.id === id);

    if (!producto) return;

    const confirmado = confirm(`¿Deseas eliminar el producto "${producto.nombre}"?`);

    if (!confirmado) return;

    this.adminProductoService
      .eliminar(id)
      .subscribe({

        next: () => {

          this.cargarProductos();

          this.showMessage(
            `Producto "${producto.nombre}" eliminado correctamente`,
            'success'
          );

        },

        error: () => this.showMessage('Error al eliminar producto', 'error')

      });

  }

  // ================= EDITAR PRODUCTO =================
  editarProducto(producto: Producto) {

    this.nuevoProducto = { ...producto };

    this.editandoProducto = true;
    this.modalAbierto = true;

  }

  // ================= MODAL DETALLES =================
  abrirModalDetalles(producto: Producto) {

    this.productoDetalle = producto;
    this.modalDetallesAbierto = true;

  }

  cerrarModalDetalles() {

    this.modalDetallesAbierto = false;
    this.productoDetalle = null;

  }

  // ================= PAGINACIÓN =================
  cambiarPagina(p: number) {

    if (p < 1 || p > this.totalPaginas) return;

    this.paginaActual = p;

    this.cargarProductos();

  }

  // ================= MENSAJES =================
  private showMessage(
    msg: string,
    type: 'success' | 'error' = 'success',
    duration = 3000
  ) {

    clearTimeout(this.timeoutId);

    this.message = msg;
    this.messageType = type;

    this.timeoutId = setTimeout(() => {
      this.message = '';
    }, duration);

  }

  // ================= PREVIEW IMAGEN =================
  seleccionarImagen(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    this.imagenFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.previewImagen = reader.result;
    };

    reader.readAsDataURL(file);

  }

  private normalizarTexto(texto: string): string {

    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // elimina acentos
      .replace(/[^\w\s]/gi, '') // elimina caracteres especiales
      .trim();

  }

  solicitarConfirmacionEliminar(producto: Producto) {
    this.productoAEliminar = producto;
    this.mensajeConfirmacion = `¿Deseas eliminar el producto "${producto.nombre}"?`;
    this.modalConfirmacionAbierto = true;
  }

  confirmarEliminar() {
    if (!this.productoAEliminar) return;

    this.adminProductoService.eliminar(this.productoAEliminar.id!)
      .subscribe({
        next: () => {
          this.cargarProductos();
          this.showMessage(
            `Producto "${this.productoAEliminar!.nombre}" eliminado correctamente`,
            'success'
          );
          this.cerrarModalConfirmacion();
        },
        error: () => {
          this.showMessage('Error al eliminar producto', 'error');
          this.cerrarModalConfirmacion();
        }
      });
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.productoAEliminar = null;
    this.mensajeConfirmacion = '';
  }

}