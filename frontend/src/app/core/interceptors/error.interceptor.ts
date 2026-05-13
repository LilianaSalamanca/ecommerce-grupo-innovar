import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const router = inject(Router);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        console.warn(
          '401 detectado:',
          req.url
        );

        // SOLO invalidar sesión
        // si falla endpoint de usuario autenticado
        if (
          req.url.includes('/api/usuarios/me')
        ) {

          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');

          router.navigate(['/login'], {
            queryParams: {
              returnUrl: router.url
            }
          });
        }
      }

      return throwError(() => error);
    })
  );
};