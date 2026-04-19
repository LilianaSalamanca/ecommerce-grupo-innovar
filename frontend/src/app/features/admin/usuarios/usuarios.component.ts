import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AdminUserService, Usuario } from '@core/services/admin-user.service';
import { Page } from '@core/models/page.model';
import { UsuarioModalComponent } from './UsuarioModal/UsuarioModalComponent';
import { UsuarioDetalleModalComponent } from './UsuarioDetalle/usuario-detalle-modal.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, UsuarioModalComponent, UsuarioDetalleModalComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  loading = false;

  pageNumber = 0;
  pageSize = 20;
  totalPaginas = 0;
  totalElementos = 0;

  filtros = {
    email: '',
    rol: '',
    estado: ''  // '' | 'true' | 'false'
  };

  // ================= MODAL =================
  modalVisible = false;
  usuarioSeleccionado: Usuario | null = null;

  modalDetalleVisible = false;
  usuarioDetalle: Usuario | null = null;

  // ================= MENSAJES =================
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  private timeoutId: any;

  constructor(private adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ================= CARGAR USUARIOS =================
  cargarUsuarios() {
    const paramsObj: any = {
      page: this.pageNumber,
      size: this.pageSize
    };

    // Filtros
    if (this.filtros.email) paramsObj.email = this.filtros.email.trim();
    if (this.filtros.rol) paramsObj.rol = this.filtros.rol;
    if (this.filtros.estado !== '') paramsObj.activo = this.filtros.estado === 'true';

    this.loading = true;

    this.adminUserService.listarUsuarios(paramsObj)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (resp: Page<Usuario>) => {
          this.usuarios = resp.content;
          this.totalPaginas = resp.totalPages;
          this.totalElementos = resp.totalElements;
        },
        error: () => this.showMessage('Error al cargar usuarios', 'error')
      });
  }

  // ================= FILTROS =================
  onFiltroCambio() {
    this.pageNumber = 0;
    this.cargarUsuarios();
  }

  limpiarFiltros() {
    this.filtros = { email: '', rol: '', estado: '' };
    this.pageNumber = 0;
    this.cargarUsuarios();
  }

  // ================= CAMBIAR ESTADO =================
  cambiarEstado(usuario: Usuario) {
    if (!usuario.id) return;

    this.adminUserService.cambiarEstado(usuario.id).subscribe({
      next: () => {
        usuario.activo = !usuario.activo;
        this.showMessage(`Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`, 'success');
      },
      error: () => this.showMessage('Error al cambiar estado', 'error')
    });
  }

  // ================= MODAL CREAR / EDITAR =================
  editarUsuario(usuario: Usuario | null) {
    this.usuarioSeleccionado = usuario;
    this.modalVisible = true;
  }

  onUsuarioGuardado(usuario: Usuario) {
    const index = this.usuarios.findIndex(u => u.id === usuario.id);
    if (index >= 0) {
      this.usuarios[index] = usuario;
      this.showMessage('Usuario actualizado correctamente', 'success');
    } else {
      this.usuarios.unshift(usuario);
      this.totalElementos++;
      this.showMessage('Usuario creado correctamente', 'success');
    }
  }

  verDetalles(usuario: Usuario) {
    this.usuarioDetalle = usuario;
    this.modalDetalleVisible = true;
  }

  // ================= PAGINACIÓN =================
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }

  irAPagina(i: number) {
    if (i < 0 || i >= this.totalPaginas) return;
    this.pageNumber = i;
    this.cargarUsuarios();
  }

  siguientePagina() {
    if (this.pageNumber < this.totalPaginas - 1) {
      this.pageNumber++;
      this.cargarUsuarios();
    }
  }

  anteriorPagina() {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.cargarUsuarios();
    }
  }

  // ================= MENSAJES =================
  private showMessage(msg: string, type: 'success' | 'error' = 'success', duration = 3000) {
    clearTimeout(this.timeoutId);
    this.message = msg;
    this.messageType = type;
    this.timeoutId = setTimeout(() => this.message = '', duration);
  }
}