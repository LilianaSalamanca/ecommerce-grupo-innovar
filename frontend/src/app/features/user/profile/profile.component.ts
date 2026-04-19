import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { Router } from '@angular/router';

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
  message: string = '';
  errorMessage: string = '';
  loading = false;
  router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0)
    
    this.initForm();
    this.loadUserData();
  }

  // ===============================
  // Inicializar formulario vacío
  // ===============================
  initForm(): void {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: [{ value: '', disabled: true }],  // No editable
      telefono: [''],
      direccion: [''],
      ciudad: [''],
      departamento: ['']
    });
  }

  // ===============================================
  // Cargar datos del usuario al abrir la vista
  // ===============================================
  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,  // aunque está disabled, sí se puede mostrar
          telefono: user.telefono,
          direccion: user.direccion,
          ciudad: user.ciudad,
          departamento: user.departamento
        });
      },
      error: () => {
        this.errorMessage = 'Error al cargar los datos del usuario.';
      }
    });
  }

  // ===============================
  // Guardar cambios
  // ===============================
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    const updatedData = {
      ...this.profileForm.getRawValue() // permite extraer valores incluso de los campos disabled
    };

    this.userService.updateProfile(updatedData).subscribe({
      next: () => {
        this.message = 'Datos actualizados correctamente.';
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al actualizar el perfil.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  };
}
