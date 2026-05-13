import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '@features/products/components/product-card/product-card.component';
import { ProductoService } from '@core/services/producto.service';
import { Producto, Categoria, Subcategoria } from '@core/models/producto.model';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit {

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategoriasFiltradas: Subcategoria[] = [];

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  categoriaSeleccionada: number | null = null;
  subcategoriaSeleccionada: number | null = null;

  mostrarMayoristas = false;
  loadingProductos = false;

  paginaActual = 1;
  tamanoPagina = 100;
  totalPaginas = 0;
  productosPaginados: Producto[] = [];

  constructor(private productoService: ProductoService) {}

  // ===========================================================
  // Normalizador ─ Ignora acentos, mayúsculas y símbolos
  // ===========================================================
  private normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // acentos
      .replace(/[^a-z0-9\s]/g, '')     // símbolos
      .trim();
  }

  // ===========================================================
  // INIT
  // ===========================================================
  ngOnInit(): void {

    window.scrollTo(0, 0)
    // Búsqueda desde el navbar
    this.productoService.terminoBusqueda$.subscribe(busqueda => {
      this.aplicarFiltros(busqueda);
    });

    this.cargarDatos();

    this.productoService.categoria$.subscribe(categoria => {

      this.categoriaSeleccionada = categoria;

      this.aplicarFiltros(
        this.productoService.currentTerminoBusqueda
      );
    });

    this.productoService.subcategoria$.subscribe(subcategoria => {

      this.subcategoriaSeleccionada = subcategoria;

      this.aplicarFiltros(
        this.productoService.currentTerminoBusqueda
      );
    });

  }

  // ===========================================================
  // CARGAR DATOS
  // ===========================================================
  cargarDatos() {

    this.productoService.obtenerCategorias().subscribe(cats => {
      this.categorias = cats;
    });

    this.productoService.obtenerSubcategorias().subscribe(subs => {
      this.subcategorias = subs;
      this.subcategoriasFiltradas = [...subs];
    });

    this.loadingProductos = true;
    this.productoService.obtenerProductos().subscribe(prods => {
      this.productos = prods;
      this.productosFiltrados = [...prods];
      this.paginaActual = 1;
      this.actualizarPaginacion(); 
      this.loadingProductos = false;
    });
  }

  // ===========================================================
  // APLICAR FILTROS (categoría + subcategoría + búsqueda)
  // ===========================================================
  aplicarFiltros(terminoBusqueda: string = '') {

    this.paginaActual = 1;
    const termino = this.normalizar(terminoBusqueda);

    // Filtrar subcategorías según categoría seleccionada
    if (this.categoriaSeleccionada) {
      this.subcategoriasFiltradas = this.subcategorias.filter(
        s => s.categoria?.id === this.categoriaSeleccionada
      );
    } else {
      this.subcategoriasFiltradas = [...this.subcategorias];
    }

    // Resetear subcategoría si ya no aplica
    if (
      this.subcategoriaSeleccionada &&
      !this.subcategoriasFiltradas.some(s => s.id === this.subcategoriaSeleccionada)
    ) {
      this.subcategoriaSeleccionada = null;
    }

    // FILTRO FINAL DE PRODUCTOS
    this.productosFiltrados = this.productos.filter((p: Producto) => {

      const coincideCategoria = this.categoriaSeleccionada
        ? p.categoria?.id === this.categoriaSeleccionada
        : true;

      const coincideSubcategoria = this.subcategoriaSeleccionada
        ? p.subcategoria?.id === this.subcategoriaSeleccionada
        : true;

      const nombreNormalizado = this.normalizar(p.nombre);
      const descripcionNormalizada = this.normalizar(p.descripcion ?? '');

      const coincideBusqueda =
        termino.length === 0 ||
        nombreNormalizado.includes(termino) ||
        descripcionNormalizada.includes(termino);

      return coincideCategoria && coincideSubcategoria && coincideBusqueda;
    })

    // ordenar por relevancia
    .sort((a, b) => {

      const nombreA = this.normalizar(a.nombre);

      const nombreB = this.normalizar(b.nombre);

      const descA = this.normalizar(a.descripcion ?? '');

      const descB = this.normalizar(b.descripcion ?? '');

      const aNombre = nombreA.includes(termino);

      const bNombre = nombreB.includes(termino);

      // coincidencia en nombre tiene prioridad
      if (aNombre && !bNombre) return -1;

      if (!aNombre && bNombre) return 1;

      // exact match primero
      if (nombreA === termino) return -1;

      if (nombreB === termino) return 1;

      return 0;
    });

    this.actualizarPaginacion();

  }

  // ===========================================================
  // EVENTOS SELECT
  // ===========================================================
  onCategoriaChange(value: any) {

    this.categoriaSeleccionada =
      value ? Number(value) : null;

    this.subcategoriaSeleccionada = null;

    // limpiar búsqueda navbar
    this.productoService.actualizarBusqueda('');

    // actualizar estado global
    this.productoService.actualizarCategoria(
      this.categoriaSeleccionada
    );

    this.productoService.actualizarSubcategoria(null);

    this.aplicarFiltros('');
  }

  onSubcategoriaChange(value: any) {

    this.subcategoriaSeleccionada =
      value ? Number(value) : null;

    // limpiar búsqueda navbar
    this.productoService.actualizarBusqueda('');

    // actualizar estado global
    this.productoService.actualizarSubcategoria(
      this.subcategoriaSeleccionada
    );

    this.aplicarFiltros('');
  }

  toggleMayorista() {
    this.mostrarMayoristas = !this.mostrarMayoristas;
  }

  actualizarPaginacion() {

    if (!this.productosFiltrados) return;

    this.totalPaginas = Math.ceil(
      this.productosFiltrados.length / this.tamanoPagina
    );

    const inicio =
      (this.paginaActual - 1) * this.tamanoPagina;

    const fin =
      inicio + this.tamanoPagina;

    this.productosPaginados =
      this.productosFiltrados.slice(inicio, fin);
}

  cambiarPagina(p: number) {

    this.paginaActual = p;

    this.actualizarPaginacion();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
}
