import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Producto } from '@core/models/producto.model';
import { CartService } from '@core/services/cart.service';
import { UiService } from '@core/services/ui.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {

  @Input() producto!: Producto;
  @Input() mostrarMayoristas: boolean = false; // precio público/mayorista

  constructor(private router: Router,
              private cartService: CartService,
              private ui: UiService
  ) {}

  agregarAlCarrito(event: Event) {
    event.stopPropagation(); // evita que haga navigate
    this.cartService.agregarAlCarrito(this.producto);
  }

  verDetalle() {
    this.router.navigate(['/producto', this.producto.id]);
  }

  getImagenUrl(imagen: string | null | undefined): string {

    if (!imagen) {
      return 'assets/no-image.png';
    }

    // Cloudinary o cualquier URL externa
    if (imagen.startsWith('http')) {
      return imagen;
    }

    // assets local
    return `assets/${imagen}`;
  }
}
