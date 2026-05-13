import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProductoService } from '@core/services/producto.service';

import { Producto } from '@core/models/producto.model';
import { Promocion } from '@core/models/promocion.model';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

  promociones: Promocion[] = [];

  productosDestacados: Producto[] = [];

  cargando = true;

  constructor(
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {

    this.cargarBanner();

  }

  cargarBanner() {

    this.cargando = true;

    this.productoService
      .obtenerPromocionesActivas()
      .subscribe({

        next: (promos) => {

          this.promociones = promos;

          this.cargarProductosDestacados();

        },

        error: () => {

          this.cargarProductosDestacados();

        }

      });

  }

  cargarProductosDestacados() {

    this.productoService
      .obtenerProductosDestacados()
      .subscribe({

        next: (productos) => {

          this.productosDestacados = productos;

          this.cargando = false;

        },

        error: () => {

          this.cargando = false;

        }

      });

  }

  getImagenUrl(imagen: string): string {

    if (!imagen) {
      return 'assets/default.png';
    }

    if (
      imagen.startsWith('http://') ||
      imagen.startsWith('https://')
    ) {
      return imagen;
    }

    return `assets/${imagen}`;

  }

}