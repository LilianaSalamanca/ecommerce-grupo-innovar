import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule,
            ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit{

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  form: FormGroup;
  showCurrent = false;
  showNew = false;
  showConfirm = false;
  router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.matchPasswords('newPassword', 'confirmPassword')
    });
  }

  // --- VALIDACIÓN: contraseñas iguales ---
  matchPasswords(pass1: string, pass2: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const p1 = form.get(pass1)?.value;
      const p2 = form.get(pass2)?.value;

      if (p1 !== p2) {
        form.get(pass2)?.setErrors({ notMatch: true });
        return { notMatch: true };
      }

      return null;
    };
  }

  // --- VALIDACIÓN: contraseña segura ---
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value || "";
      if (!value) return null;

      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSymbol = /[^A-Za-z0-9]/.test(value);

      const valid = hasUpper && hasLower && hasNumber && hasSymbol;

      return valid ? null : { weakPassword: true };
    };
  }

  toggle(field: string) {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'confirm') this.showConfirm = !this.showConfirm;
  }

  submit() {
    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Revisa los campos antes de continuar.'
      });
      return;
    }

    const payload = this.form.value;

    this.authService.changePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña se ha cambiado correctamente.',
          timer: 2000
        });

        this.form.reset();
      },
      error: (err) => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'No se pudo cambiar la contraseña.'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  };

}
