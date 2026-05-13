import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminCategoriaService,
  Categoria,
  Subcategoria
} from '@core/services/admin-categoria.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categorias.component.html',
  styleUrls: ['./admin-categorias.component.scss']
})
export class AdminCategoriasComponent implements OnInit {

  categorias: Categoria[] = [];

  loading = false;

  // ================= CATEGORIA =================

  modalCategoria = false;
  editandoCategoria = false;

  categoriaActual: Partial<Categoria> = {};

  // ================= SUBCATEGORIA =================

  modalSubcategoria = false;
  editandoSubcategoria = false;

  subcategoriaActual: Partial<Subcategoria> = {};

  categoriaSeleccionadaId!: number;

  // ================= MENSAJES =================

  message = '';
  messageType: 'success' | 'error' = 'success';

  private timeoutId: any;

  // ================= CONFIRMACIÓN =================

  modalConfirmacionAbierto = false;

  tipoEliminar: 'categoria' | 'subcategoria' = 'categoria';

  categoriaAEliminar: Categoria | null = null;

  subcategoriaAEliminar: Subcategoria | null = null;

  mensajeConfirmacion = '';

  constructor(
    private adminCategoriaService: AdminCategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  // ================= CARGAR =================

  cargarCategorias() {

    this.loading = true;

    this.adminCategoriaService
      .listarCategorias()
      .subscribe({

        next: (data) => {

          this.categorias = data;

          this.loading = false;

        },

        error: () => {

          this.loading = false;

          this.showMessage(
            'Error al cargar categorías',
            'error'
          );

        }

      });

  }

  // ================= MODAL CATEGORÍA =================

  abrirModalCategoria() {

    this.categoriaActual = {};

    this.editandoCategoria = false;

    this.modalCategoria = true;

  }

  editarCategoria(categoria: Categoria) {

    this.categoriaActual = { ...categoria };

    this.editandoCategoria = true;

    this.modalCategoria = true;

  }

  cerrarModalCategoria() {

    this.modalCategoria = false;

  }

  guardarCategoria() {

    if (!this.categoriaActual.nombre?.trim()) {

      this.showMessage(
        'El nombre es obligatorio',
        'error'
      );

      return;

    }

    if (this.editandoCategoria) {

      this.adminCategoriaService
        .actualizarCategoria(
          this.categoriaActual.id!,
          this.categoriaActual
        )
        .subscribe({

          next: () => {

            this.cargarCategorias();

            this.cerrarModalCategoria();

            this.showMessage(
              'Categoría actualizada correctamente'
            );

          },

          error: () => {

            this.showMessage(
              'Error al actualizar categoría',
              'error'
            );

          }

        });

    } else {

      this.adminCategoriaService
        .crearCategoria(this.categoriaActual)
        .subscribe({

          next: () => {

            this.cargarCategorias();

            this.cerrarModalCategoria();

            this.showMessage(
              'Categoría creada correctamente'
            );

          },

          error: () => {

            this.showMessage(
              'Error al crear categoría',
              'error'
            );

          }

        });

    }

  }

  // ================= ELIMINAR CATEGORÍA =================

  solicitarEliminarCategoria(categoria: Categoria) {

    this.tipoEliminar = 'categoria';

    this.categoriaAEliminar = categoria;

    this.mensajeConfirmacion =
      `¿Deseas eliminar la categoría "${categoria.nombre}"?`;

    this.modalConfirmacionAbierto = true;

  }

  // ================= SUBCATEGORÍA =================

  abrirModalSubcategoria(categoriaId: number) {

    this.subcategoriaActual = {};

    this.categoriaSeleccionadaId = categoriaId;

    this.editandoSubcategoria = false;

    this.modalSubcategoria = true;

  }

  editarSubcategoria(
    subcategoria: Subcategoria,
    categoriaId: number
  ) {

    this.subcategoriaActual = { ...subcategoria };

    this.categoriaSeleccionadaId = categoriaId;

    this.editandoSubcategoria = true;

    this.modalSubcategoria = true;

  }

  cerrarModalSubcategoria() {

    this.modalSubcategoria = false;

  }

  guardarSubcategoria() {

    if (!this.subcategoriaActual.nombre?.trim()) {

      this.showMessage(
        'El nombre es obligatorio',
        'error'
      );

      return;

    }

    const payload = {

      nombre: this.subcategoriaActual.nombre,

      categoria: {
        id: this.categoriaSeleccionadaId
      }

    };

    if (this.editandoSubcategoria) {

      this.adminCategoriaService
        .actualizarSubcategoria(
          this.subcategoriaActual.id!,
          payload
        )
        .subscribe({

          next: () => {

            this.cargarCategorias();

            this.cerrarModalSubcategoria();

            this.showMessage(
              'Subcategoría actualizada correctamente'
            );

          },

          error: () => {

            this.showMessage(
              'Error al actualizar subcategoría',
              'error'
            );

          }

        });

    } else {

      this.adminCategoriaService
        .crearSubcategoria(payload)
        .subscribe({

          next: () => {

            this.cargarCategorias();

            this.cerrarModalSubcategoria();

            this.showMessage(
              'Subcategoría creada correctamente'
            );

          },

          error: () => {

            this.showMessage(
              'Error al crear subcategoría',
              'error'
            );

          }

        });

    }

  }

  // ================= ELIMINAR SUBCATEGORÍA =================

  solicitarEliminarSubcategoria(sub: Subcategoria) {

    this.tipoEliminar = 'subcategoria';

    this.subcategoriaAEliminar = sub;

    this.mensajeConfirmacion =
      `¿Deseas eliminar la subcategoría "${sub.nombre}"?`;

    this.modalConfirmacionAbierto = true;

  }

  // ================= CONFIRMAR ELIMINACIÓN =================

  confirmarEliminar() {

    if (
      this.tipoEliminar === 'categoria' &&
      this.categoriaAEliminar
    ) {

      this.adminCategoriaService
        .eliminarCategoria(this.categoriaAEliminar.id)
        .subscribe({

          next: () => {

            this.cargarCategorias();

            this.showMessage(
              'Categoría eliminada correctamente'
            );

            this.cerrarModalConfirmacion();

          },

          error: () => {

            this.showMessage(
              'Error al eliminar categoría',
              'error'
            );

          }

        });

    }

    if (
      this.tipoEliminar === 'subcategoria' &&
      this.subcategoriaAEliminar
    ) {

      this.adminCategoriaService
        .eliminarSubcategoria(
          this.subcategoriaAEliminar.id
        )
        .subscribe({

          next: () => {

            this.cargarCategorias();

            this.showMessage(
              'Subcategoría eliminada correctamente'
            );

            this.cerrarModalConfirmacion();

          },

          error: () => {

            this.showMessage(
              'Error al eliminar subcategoría',
              'error'
            );

          }

        });

    }

  }

  cerrarModalConfirmacion() {

    this.modalConfirmacionAbierto = false;

    this.categoriaAEliminar = null;

    this.subcategoriaAEliminar = null;

  }

  // ================= TOAST =================

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

}