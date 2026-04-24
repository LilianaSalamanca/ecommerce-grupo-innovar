import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '@core/services/producto.service';
import { Producto } from '@core/models/producto.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

  promociones: Producto[] = [];
  productosDestacados: Producto[] = [];

  cargando = true;
  mostrandoPromociones = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarContenidoBanner();
  }

  cargarContenidoBanner() {
    this.cargando = true;

    // Primero intentamos cargar promociones activas
    this.productoService.obtenerPromocionesActivas().subscribe({
      next: promos => {
        if (promos.length > 0) {
          this.promociones = promos;
          this.productosDestacados = promos;
          this.mostrandoPromociones = true;
        } else {
          this.cargarProductosDestacados();
        }
        this.cargando = false;
      },
      error: () => {
        this.cargarProductosDestacados();
        this.cargando = false;
      }
    });
  }

  cargarProductosDestacados() {
    this.productoService.obtenerProductosDestacados().subscribe({
      next: dest => {
        this.productosDestacados = dest;
        this.mostrandoPromociones = false;
        this.cargando = false;
      },
      error: () => {
        this.productosDestacados = [];
        this.mostrandoPromociones = false;
        this.cargando = false;
      }
    });
  }

  goToProductos() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getImagenUrl(imagen: string): string {
    if (!imagen) return 'assets/default.png';

    // Si ya es URL completa (Cloudinary)
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }

    // Si es asset local
    return `assets/${imagen}`;
  }
}
