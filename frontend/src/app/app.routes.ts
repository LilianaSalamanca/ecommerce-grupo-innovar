import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminConfigComponent } from '@features/admin/config/admin-config.component';

export const routes: Routes = [

  /* =====================================================
   * HOME (PÚBLICO)
   * ===================================================== */
  {
    path: '',
    loadComponent: () =>
      import('@features/home/home.component')
        .then(c => c.HomeComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('@features/pages/faq/faq.component').then(c => c.FaqComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('@features/pages/contact/contact.component').then(c => c.ContactComponent)
  },
  {
    path: 'terminos',
    loadComponent: () => import('@features/pages/terms/terms.component').then(c => c.TermsComponent)
  },
  {
    path: 'privacidad',
    loadComponent: () => import('@features/pages/privacy/privacy.component').then(c => c.PrivacyComponent)
  },

  /* =====================================================
   * AUTH (PÚBLICO)
   * ===================================================== */
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/login/login.component')
        .then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@features/auth/register/register.component')
        .then(c => c.RegisterComponent)
  },

  /* =====================================================
   * USER AREA (SOLO USER)
   * ===================================================== */
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
      import('@features/user/dashboard/dashboard.component')
        .then(c => c.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
      import('@features/user/profile/profile.component')
        .then(c => c.ProfileComponent)
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
      import('@features/user/change-password/change-password.component')
        .then(c => c.ChangePasswordComponent)
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
      import('@features/user/orders/orders.component')
        .then(c => c.OrdersComponent)
  },
  {
    path: 'orders/:id',
    canActivate: [AuthGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
      import('@features/user/order-details/order-details.component')
        .then(c => c.OrderDetailsComponent)
  },

  /* =====================================================
   * PRODUCTS (PÚBLICO)
   * ===================================================== */
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('@features/products/components/products-detail/product-detail.component')
        .then(m => m.ProductDetailComponent)
  },

  /* =====================================================
   * CART & CHECKOUT (PUBLICO)
   * ===================================================== */
  {
    path: 'cart',
    loadComponent: () =>
      import('@features/cart/cart.component')
        .then(c => c.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('@features/checkout/checkout.component')
        .then(c => c.CheckoutComponent)
  },

  /* =====================================================
   * ADMIN AREA (SOLO ADMIN)
   * ===================================================== */
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('@features/admin/layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('@features/admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('@features/admin/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent)
      },

      {
        path: 'pedidos',
        loadComponent: () =>
          import('@features/admin/pedidos/pedidos.component')
            .then(m => m.PedidosComponent)
      },

      {
        path: 'productos',
        loadComponent: () =>
          import('@features/admin/productos/productos.component')
            .then(m => m.ProductosComponent)
      },

      { path: 'configuracion', component: AdminConfigComponent },

    ]
  },

  /* =====================================================
   * 404
   * ===================================================== */
  {
    path: '**',
    redirectTo: ''
  }

];