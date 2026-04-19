import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

  return this.auth.isLogged$.pipe(
    take(1),
    map(isLogged => {

      if (!isLogged) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      const expectedRoles = route.data['roles'] as string[] | undefined;
      const userRole = this.auth.getUserRole();

      if (!userRole) {
        this.router.navigate(['/login']);
        return false;
      }

      if (expectedRoles?.length) {

        // ADMIN acceso total
        if (userRole === 'ADMIN') {
          return true;
        }

        if (!expectedRoles.includes(userRole)) {
          this.router.navigate(['/']);
          return false;
        }
      }

      return true;
    })
  );
}
}