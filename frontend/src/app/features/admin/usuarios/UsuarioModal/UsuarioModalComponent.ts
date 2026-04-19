import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminUserService, Usuario } from '@core/services/admin-user.service';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.scss']
})
export class UsuarioModalComponent {
  @Input() usuario: Usuario | null = null; // null = crear
  @Output() onGuardar = new EventEmitter<Usuario>();
  @Output() onCerrar = new EventEmitter<void>();

  loading = false;
  modelo: Usuario = { nombre: '', apellido: '', email: '', rol: 'USUARIO', activo: true };

  constructor(private adminUserService: AdminUserService) {}

  ngOnChanges() {
    if (this.usuario) {
      this.modelo = { ...this.usuario }; // clona para no alterar la original
    } else {
      this.modelo = { nombre: '', apellido: '', email: '', rol: 'USUARIO', activo: true };
    }
  }

  guardar(form: NgForm) {
    if (!form.valid) return;
    this.loading = true;

    const request$ = this.usuario?.id
      ? this.adminUserService.actualizarUsuario(this.usuario.id!, this.modelo)
      : this.adminUserService.crearUsuario(this.modelo);

    request$.subscribe({
      next: (usuarioGuardado) => {
        this.onGuardar.emit(usuarioGuardado);
        this.cerrar();
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar usuario');
        this.loading = false;
      }
    });
  }

  cerrar() {
    this.onCerrar.emit();
  }
}