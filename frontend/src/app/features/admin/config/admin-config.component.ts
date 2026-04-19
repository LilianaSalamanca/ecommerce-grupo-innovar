import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, Usuario } from '@core/services/admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-config',
  templateUrl: './admin-config.component.html',
  styleUrls: ['./admin-config.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AdminConfigComponent implements OnInit {

  perfilForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  loadingPerfil = true;

  message: string = '';
  messageType: 'success' | 'error' = 'success';
  private timeoutId: any;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      activo: [{ value: true, disabled: true }]
    });

    this.passwordForm = this.fb.group({
      actual: ['', Validators.required],
      nueva: ['', [Validators.required, Validators.minLength(8), 
                  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      confirmar: ['', Validators.required]
    });

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loadingPerfil = true;

    this.adminService.obtenerPerfil().subscribe({
      next: (data: Usuario) => {
        this.perfilForm.patchValue({ ...data });
        this.loadingPerfil = false;
      },
      error: () => {
        this.loadingPerfil = false;
        this.showMessage('No se pudo cargar el perfil', 'error');
      }
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) return;
    this.loading = true;

    const datosActualizados = this.perfilForm.getRawValue();

    this.adminService.actualizarPerfil(datosActualizados).subscribe({
      next: () => {
        this.loading = false;
        this.showMessage('Perfil actualizado correctamente', 'success');
      },
      error: () => {
        this.loading = false;
        this.showMessage('Error al actualizar el perfil', 'error');
      }
    });
  }

  // para toggle visibilidad
  showPasswordActual = false;
  showPasswordNueva = false;
  showPasswordConfirmar = false;

  togglePassword(field: 'actual' | 'nueva' | 'confirmar') {
    if (field === 'actual') this.showPasswordActual = !this.showPasswordActual;
    if (field === 'nueva') this.showPasswordNueva = !this.showPasswordNueva;
    if (field === 'confirmar') this.showPasswordConfirmar = !this.showPasswordConfirmar;
  }

  // Validador personalizado para la seguridad de la contraseña
  get passwordNueva() {
    return this.passwordForm.get('nueva');
  }

  get passwordConfirmar() {
    return this.passwordForm.get('confirmar');
  }

  isPasswordValid(password: string): boolean {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])/;
    return password.length >= 8 && pattern.test(password);
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const { actual, nueva, confirmar } = this.passwordForm.value;

    if (nueva !== confirmar) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    this.adminService.cambiarPassword({ actual, nueva }).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.showMessage('Contraseña actualizada correctamente', 'success');
        setTimeout(() => {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: () => this.showMessage('Error al cambiar contraseña', 'error')
    });
  }

  private showMessage(msg: string, type: 'success' | 'error' = 'success', duration = 3000) {
    clearTimeout(this.timeoutId);
    this.message = msg;
    this.messageType = type;
    this.timeoutId = setTimeout(() => this.message = '', duration);
  }

  onPasswordSubmit(event: Event) {
    event.preventDefault(); // evita que recargue la página
    this.cambiarPassword();
  }

}