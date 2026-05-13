import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule,
            CommonModule,
            ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileForm!: FormGroup;

  // ESTADO UI
  loading = false;

  router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {

    window.scrollTo(0, 0);

    this.initForm();
    this.loadUserData();
  }

  // ===============================
  // INICIALIZAR FORMULARIO
  // ===============================
  initForm(): void {

    this.profileForm = this.fb.group({

      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      email: [
        {
          value: '',
          disabled: true
        }
      ],

      telefono: [
        '',
        [
          Validators.pattern(/^[0-9+\-\s()]{7,20}$/)
        ]
      ],

      direccion: [
        '',
        [
          Validators.maxLength(120)
        ]
      ],

      ciudad: [
        '',
        [
          Validators.maxLength(60)
        ]
      ],

      departamento: [
        '',
        [
          Validators.maxLength(60)
        ]
      ]
    });
  }

  // ===============================
  // GETTERS FORM
  // ===============================
  get f() {
    return this.profileForm.controls;
  }

  // ===============================================
  // CARGAR DATOS DEL USUARIO
  // ===============================================
  loadUserData(): void {

    this.userService.getProfile().subscribe({

      next: (user) => {

        this.profileForm.patchValue({

          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          telefono: user.telefono,
          direccion: user.direccion,
          ciudad: user.ciudad,
          departamento: user.departamento
        });
      },

      error: (err) => {

        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del perfil.'
        });
      }
    });
  }

  // ===============================
  // GUARDAR CAMBIOS
  // ===============================
  onSubmit(): void {

    if (this.profileForm.invalid) {

      this.profileForm.markAllAsTouched();

      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Revisa los campos antes de continuar.'
      });

      return;
    }

    this.loading = true;

    const updatedData = {
      ...this.profileForm.getRawValue()
    };

    this.userService.updateProfile(updatedData)
      .subscribe({

        next: () => {

          this.loading = false;

          Swal.fire({
            icon: 'success',
            title: 'Perfil actualizado',
            text: 'Los datos se actualizaron correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
        },

        error: (err) => {

          this.loading = false;

          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err?.error?.message ||
              'No se pudo actualizar el perfil.'
          });
        }
      });
  }

  // ===============================
  // VOLVER
  // ===============================
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}