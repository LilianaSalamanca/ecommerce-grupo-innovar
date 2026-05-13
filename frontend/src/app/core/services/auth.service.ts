import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  BehaviorSubject,
  Observable,
  firstValueFrom
} from 'rxjs';

import {
  tap,
} from 'rxjs/operators';

import { Usuario } from '@core/models/usuario.model';

// Firebase
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from '@angular/fire/auth';

import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/api`;

  // ================== AUTH STATE ==================

  private authSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );

  isLogged$ = this.authSubject.asObservable();

  private userSubject = new BehaviorSubject<Usuario | null>(null);

  user$ = this.userSubject.asObservable();

  // ================== CONSTRUCTOR ==================

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {

    // Restaurar sesión inicial
    this.restoreSession();

    // Sincronización entre pestañas
    if (this.isBrowser()) {

      window.addEventListener('storage', (event) => {

        if (event.key === 'token') {

          // Login en otra pestaña
          if (event.newValue) {
            this.restoreSession();
          }

          // Logout en otra pestaña
          else {
            this.userSubject.next(null);

            this.authSubject.next(false);

            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  // ================== HELPERS ==================

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isAuthenticated(): boolean {
    return this.authSubject.value;
  }

  getToken(): string | null {

    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('token');
  }

  // ================== JWT ==================

  private decodeToken(): any {

    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {

      const payload = token.split('.')[1];

      return JSON.parse(atob(payload));

    } catch {

      return null;
    }
  }

  getUserRole(): string | null {

    const decoded = this.decodeToken();

    if (!decoded) {
      return null;
    }

    let role: string | null = null;

    if (decoded.role) {

      role = decoded.role;

    } else if (decoded.authorities?.length) {

      role = decoded.authorities[0];
    }

    if (!role) {
      return null;
    }

    return role.replace('ROLE_', '');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  // ================== SESSION ==================
  restoreSession(): void {

    if (!this.isBrowser()) {
      return;
    }

    const token = this.getToken();

    if (!token) {
      this.clearSession();
      return;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    // Sesión válida inmediatamente
    this.authSubject.next(true);

    // Intentar obtener usuario
    this.http.get<Usuario>(`${this.apiUrl}/usuarios/me`)
      .subscribe({

        next: (user) => {

          this.userSubject.next(user);
        },

        error: (error) => {

          console.error('Error restaurando usuario:', error);

          // SOLO destruir sesión si JWT inválido
          if (error.status === 401) {
            this.clearSession();
          }
        }
      });
  }

  private clearSession(redirect = true): void {

    if (this.isBrowser()) {

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }

    this.userSubject.next(null);

    this.authSubject.next(false);

    if (redirect){
      this.router.navigate(['/']);
    }
  }

  async logout(): Promise<void> {

    this.clearSession();

    try {

      await signOut(this.auth);

    } catch {}
  }

  // ================== LOGIN ==================

  login(
    email: string,
    password: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    ).pipe(

      tap((res) => this.handleAuthSuccess(res))
    );
  }

  async loginWithGoogle(): Promise<void> {

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      this.auth,
      provider
    );

    const idToken = await result.user.getIdToken();

    const res: any = await firstValueFrom(

      this.http.post(
        `${this.apiUrl}/auth/google`,
        { idToken }
      )
    );

    this.handleAuthSuccess(res);
  }

  // ================== REGISTER ==================

  register(payload: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/auth/register`,
      payload
    ).pipe(

      tap((res) => {

        if (res.token) {
          this.handleAuthSuccess(res);
        }
      })
    );
  }

  // ================== PASSWORD ==================

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/usuarios/change-password`,
      payload
    );
  }

  // ================== PRIVATE ==================

  private handleAuthSuccess(res: any): void {

    if (!this.isBrowser()) {
      return;
    }

    if (res.token) {
      localStorage.setItem('token', res.token);
    }

    if (res.refreshToken) {
      localStorage.setItem(
        'refreshToken',
        res.refreshToken
      );
    }

    // Activar sesión inmediatamente
    this.authSubject.next(true);

    // Obtener usuario
    this.http.get<Usuario>(`${this.apiUrl}/usuarios/me`)
      .subscribe({

        next: (user) => {

          this.userSubject.next(user);
        },

        error: (error) => {

           console.error('Error obteniendo usuario:', error);

          // SOLO cerrar sesión si realmente el token es inválido
          if (error.status === 401) {
            this.clearSession();
          }
        }
      });
  }

  private isTokenExpired(token: string): boolean {

    try {

      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      const exp = payload.exp;

      if (!exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);

      return exp < now;

    } catch {

      return true;
    }
  }

  private hasValidToken(): boolean {

    if (!this.isBrowser()) {
      return false;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  forgotPassword(email: string) {
    return this.http.post(
      `${environment.apiUrl}/api/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, password: string) {
    return this.http.post(
      `${environment.apiUrl}/api/auth/reset-password`,
      {
        token,
        password
      }
    );
  }
}