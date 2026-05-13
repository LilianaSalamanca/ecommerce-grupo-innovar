import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminPromocionService,
  Promocion
} from '@core/services/admin-promocion.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.scss']
})
export class PromocionesComponent implements OnInit {

  promociones: Promocion[] = [];
  loading = false;
  modalAbierto = false;
  editando = false;

  promocionActual: Partial<Promocion> = {
    activa: true,
    prioridad: 0
  };

  constructor(
    private adminPromocionService: AdminPromocionService
  ) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones() {

    this.loading = true;

    this.adminPromocionService
      .listar()
      .subscribe({
       next: (data) => {

          this.promociones = data;
          this.loading = false;

        },

        error: () => {

          this.loading = false;

        }

      });
  }

  abrirModal() {

    this.promocionActual = {
      activa: true,
      prioridad: 0
    };

    this.editando = false;

    this.modalAbierto = true;
  }

  editar(promocion: Promocion) {

    this.promocionActual = {
      ...promocion
    };

    this.editando = true;

    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {

    if (this.editando) {

      this.adminPromocionService
        .actualizar(
          this.promocionActual.id!,
          this.promocionActual
        )
        .subscribe(() => {

          this.cargarPromociones();
          this.cerrarModal();

        });

    } else {

      this.adminPromocionService
        .crear(this.promocionActual)
        .subscribe(() => {

          this.cargarPromociones();
          this.cerrarModal();

        });

    }
  }

  eliminar(id: number) {

    const confirmado = confirm(
      '¿Eliminar promoción?'
    );

    if (!confirmado) return;

    this.adminPromocionService
        .eliminar(id)
        .subscribe(() => {

            this.cargarPromociones();

        });
  }
}