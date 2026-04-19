import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '@core/services/admin-user.service';

@Component({
  selector: 'app-usuario-detalle-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-detalle-modal.component.html',
  styleUrls: ['./usuario-detalle-modal.component.scss']
})
export class UsuarioDetalleModalComponent {

  @Input() usuario: Usuario | null = null;

  @Output() onCerrar = new EventEmitter<void>();

  cerrar() {
    this.onCerrar.emit();
  }

}