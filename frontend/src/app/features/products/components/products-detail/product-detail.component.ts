import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '@core/services/producto.service';
import { Producto } from '@core/models/producto.model';
import { ProductCardComponent } from '@features/products/components/product-card/product-card.component';
import { CartService } from '@core/services/cart.service';
import { UiService } from '@core/services/ui.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  producto!: Producto;
  relacionados: Producto[] = [];
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private cartService: CartService,
    private ui: UiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));

    if (!id) {
        this.router.navigate(['/']);
        return;
    }

    this.cargarProducto(id);
    });
  }

  cargarProducto(id: number) {
    this.cargando = true;

    this.productoService.obtenerProductosById(id).subscribe(prod => {
      this.producto = prod;

      // Cargar similares usando la lógica que sí funciona
      this.cargarSimilares(
        prod.categoria?.id ?? 0,
        prod.subcategoria?.id ?? 0,
        prod.id
      );

      this.cargando = false;
    });
  }

  private cargarSimilares(categoriaId: number, subcategoriaId: number, actualId: number) {
    this.productoService.obtenerProductos().subscribe(productos => {
      this.relacionados = productos
        .filter(p =>
          p.id !== actualId &&
          p.categoria?.id === categoriaId &&
          p.subcategoria?.id === subcategoriaId
        )
        .slice(0, 6); // Máximo 6 productos
    });
  }

   agregarAlCarrito(event: Event) {
    event.stopPropagation(); // evita que haga navigate
    this.cartService.agregarAlCarrito(this.producto);
  }

  comprarAhora() {
    this.cartService.agregarAlCarrito(this.producto);
    this.router.navigate(['/checkout']); // Ir directamente al checkout
  }
  volver() {
    this.router.navigate(['/productos']);
  }
}
