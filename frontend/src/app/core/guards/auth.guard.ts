import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // Validación REAL de autenticación
    if (!this.auth.isAuthenticated()) {

      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: state.url
        }
      });

      return false;
    }

    // Roles esperados
    const expectedRoles =
      route.data['roles'] as string[] | undefined;

    const userRole = this.auth.getUserRole();

    // Usuario sin rol válido
    if (!userRole) {

      this.router.navigate(['/login']);

      return false;
    }

    // ADMIN acceso total
    if (userRole === 'ADMIN') {
      return true;
    }

    // Validar permisos
    if (
      expectedRoles?.length &&
      !expectedRoles.includes(userRole)
    ) {

      this.router.navigate(['/']);

      return false;
    }

    return true;
  }
}