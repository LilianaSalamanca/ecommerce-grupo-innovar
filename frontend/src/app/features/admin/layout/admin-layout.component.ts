import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Observable } from 'rxjs';
import { Usuario } from '@core/models/usuario.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'] 
})
export class AdminLayoutComponent {

  usuario$: Observable<Usuario | null>;

  constructor(
    private router: Router,
    private authService: AuthService 
  ) {
    this.usuario$ = this.authService.user$;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}