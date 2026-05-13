import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  private authService = inject(AuthService);

  email = '';
  loading = false;

  message = '';
  error = '';

  /* ===============================
   * VALIDACIÓN SIMPLE EMAIL
   * =============================== */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ===============================
   * SUBMIT
   * =============================== */
  submit(form?: NgForm): void {

    this.message = '';
    this.error = '';

    if (!this.email) {
      this.error = 'El correo es obligatorio';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Correo inválido';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email.trim())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          // 🔒 Mensaje neutro (seguridad)
          this.message = 'Revisa tu correo. Si está registrado, recibirás un enlace para restablecer tu contraseña.';
          this.email = '';
          form?.resetForm();
        },
        error: () => {
          this.error = 'Error enviando la solicitud';
        }
      });
  }
}