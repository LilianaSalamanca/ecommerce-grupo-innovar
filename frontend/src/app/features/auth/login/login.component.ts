import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  /* =====================================================
   * LOGIN NORMAL
   * ===================================================== */
  login() {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;

    this.authService.login(this.email.trim(), this.password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {

          console.log('LOGIN RESPONSE:', res);

          // GUARDAR TOKEN CORRECTAMENTE
          localStorage.setItem('token', res.token);

          console.log('TOKEN GUARDADO:', localStorage.getItem('token'));

          const returnUrl = this.route.snapshot.queryParams['returnUrl'];

          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
            return;
          }

          // Detectar rol desde JWT
          const role = this.getRoleFromToken();
          console.log('ROLE DETECTADO:', role);

          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }

        },
        error: (err) => {
          console.error('LOGIN ERROR:', err);
          this.errorMessage = err?.error?.message || 'Credenciales incorrectas';
        }
      });
  }

  /* =====================================================
   * LOGIN GOOGLE
   * ===================================================== */
  async loginWithGoogle() {

    this.errorMessage = '';
    this.loading = true;

    try {

      await this.authService.loginWithGoogle();

      const returnUrl = this.route.snapshot.queryParams['returnUrl'];

      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
        return;
      }

      const role = this.authService.getUserRole();

      if (role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }

    } catch (error) {
      console.error('GOOGLE LOGIN ERROR:', error);
      this.errorMessage = 'Error al iniciar sesión con Google';
    } finally {
      this.loading = false;
    }
  }

  /* =====================================================
   * 🔐 EXTRAER ROL DESDE JWT
   * ===================================================== */
  private getRoleFromToken(): string | null {

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // El backend envía ROLE_ADMIN → lo limpiamos
      return payload.role?.replace('ROLE_', '');
    } catch (e) {
      console.error('Error leyendo token:', e);
      return null;
    }
  }
}