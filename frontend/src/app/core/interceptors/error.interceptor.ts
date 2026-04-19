import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {

    console.log('401 detectado en:', req.url);

    // Ignorar endpoints públicos
    if (
      req.url.includes('/auth') ||
      req.url.includes('/usuarios/me')
    ) {
      return throwError(() => error);
    }

    // Solo logout si NO es endpoint admin
    if (req.url.includes('/api/admin')) {
      console.warn('401 en admin - posible error backend, no logout');
      return throwError(() => error);
    }

    if (authService.isAuthenticated()) {
      authService.logout();
      router.navigate(['/login'], {
        queryParams: { returnUrl: router.url }
      });
    }
  }

      return throwError(() => error);
    })

  );
};