import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = '';
  password = '';
  message = '';

  confirmPassword = '';
  error = '';


  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {

    this.error = '';

    if (this.password.length < 8) {
      this.error =
        'Mínimo 8 caracteres';
      return;
    }

    if (
      this.password !==
      this.confirmPassword
    ) {
      this.error =
        'Las contraseñas no coinciden';
      return;
    }

    this.authService
      .resetPassword(
        this.token,
        this.password
      )
      .subscribe({
        next: () => {
          this.message =
            'Contraseña actualizada';
        },
        error: () => {
          this.error =
            'Token inválido o expirado';
        }
      });
  }
}