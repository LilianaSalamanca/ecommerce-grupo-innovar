import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '@core/services/cart.service';
import { ProductoService } from '@core/services/producto.service';
import { AuthService } from '@core/services/auth.service';
import { debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit {

  terminoBusqueda = '';
  searchUpdate = new Subject<string>();

  menuAbierto = false;
  userMenuOpen = false;
  carritoAbierto = false;

  cantidadCarrito = 0;
  isLogged = false;
  nombreUsuario = '';

  private isBrowser = false;

  constructor(
    private cartService: CartService,
    private productoService: ProductoService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {

    // Estado de sesión
    this.authService.isLogged$.subscribe(isLogged => {
      this.isLogged = isLogged;
    });

    this.authService.user$.subscribe(user => {
      this.nombreUsuario = user?.nombre ?? '';
    });

    // Cantidad carrito
    this.cartService.itemCount$.subscribe(count => {
      this.cantidadCarrito = count;
    });

    // Buscador
    this.searchUpdate.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      filter(text => text.length >= 3 || text.length === 0)
    ).subscribe(text => {
      this.productoService.actualizarBusqueda(text);
    });

    this.productoService.terminoBusqueda$
      .subscribe(term => {

        this.terminoBusqueda = term;
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onSearchInput() {
    this.searchUpdate.next(this.terminoBusqueda.trim().toLowerCase());
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  abrirCarrito() {
    if (!this.isBrowser) return;

    if (window.innerWidth < 768) {
      this.carritoAbierto = !this.carritoAbierto;
    } else {
      this.router.navigate(['/carrito']);
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  @HostListener('document:click', ['$event'])
    closeMenu(event: Event): void {

      const target = event.target as HTMLElement;

      if (!target.closest('.usuario-menu')) {
        this.userMenuOpen = false;
      }
    }
}
