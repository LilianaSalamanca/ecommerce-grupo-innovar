import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  router = inject(Router);

  // FORMULARIO
  passwordForm: FormGroup;

  // VISIBILIDAD PASSWORDS
  showPasswordActual = false;
  showPasswordNueva = false;
  showPasswordConfirmar = false;

  // ESTADO LOADING
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {

    this.passwordForm = this.fb.group({

      actual: ['', Validators.required],

      nueva: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/
          )
        ]
      ],

      confirmar: ['', Validators.required]

    }, {
      validators: this.matchPasswords('nueva', 'confirmar')
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  // VALIDAR CONTRASEÑAS IGUALES
  matchPasswords(pass1: string, pass2: string): ValidatorFn {

    return (form: AbstractControl): ValidationErrors | null => {

      const password = form.get(pass1)?.value;
      const confirm = form.get(pass2)?.value;

      if (password !== confirm) {

        form.get(pass2)?.setErrors({
          notMatch: true
        });

        return {
          notMatch: true
        };
      }

      return null;
    };
  }

  // MOSTRAR / OCULTAR PASSWORD
  togglePassword(field: string): void {

    if (field === 'actual') {
      this.showPasswordActual = !this.showPasswordActual;
    }

    if (field === 'nueva') {
      this.showPasswordNueva = !this.showPasswordNueva;
    }

    if (field === 'confirmar') {
      this.showPasswordConfirmar = !this.showPasswordConfirmar;
    }
  }

  // CAMBIAR PASSWORD
  cambiarPassword(): void {

    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Revisa los campos antes de continuar.'
      });

      return;
    }

    this.loading = true;

    const payload = this.passwordForm.value;

    this.authService.changePassword({
      currentPassword: payload.actual,
      newPassword: payload.nueva
    }).subscribe({

      next: () => {

        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña se cambió correctamente.',
          timer: 2000,
          showConfirmButton: false
        });

        this.passwordForm.reset();
      },

      error: (err) => {

        this.loading = false;

        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            err?.error?.message ||
            'No se pudo cambiar la contraseña'
        });
      }
    });
  }

  // VOLVER
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}