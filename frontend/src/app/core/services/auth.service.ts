import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario } from '@core/models/usuario.model';

// Firebase
import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/api`;

  private authSubject = new BehaviorSubject<boolean>(false);
  isLogged$ = this.authSubject.asObservable();

  private userSubject = new BehaviorSubject<Usuario | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private auth: Auth
  ) {
    this.restoreSession();
  }

  /* ================== HELPERS ================== */

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isAuthenticated(): boolean {
    return this.authSubject.value;
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  /* ================== JWT DECODE ================== */

  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;

    let role: string | null = null;

    if (decoded.role) {
      role = decoded.role;
    } else if (decoded.authorities?.length) {
      role = decoded.authorities[0];
    }

    if (!role) return null;

    // 🔥 Normalizamos quitando ROLE_
    return role.replace('ROLE_', '');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  /* ================== SESSION ================== */

  restoreSession(): void {
    if (!this.isBrowser()) return;

    const token = this.getToken();

    if (!token || this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    // 🔥 Primero marcar como autenticado SOLO por el token
    this.authSubject.next(true);

    // 🔥 Luego intentar cargar usuario
    this.http.get<Usuario>(`${this.apiUrl}/usuarios/me`).pipe(
      catchError(() => {
        // Si falla, NO destruir sesión inmediatamente
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
        this.userSubject.next(user);
      }
    });
  }

  private clearSession(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }

    this.userSubject.next(null);
    this.authSubject.next(false);
  }

  async logout(): Promise<void> {
    this.clearSession();
    try {
      await signOut(this.auth);
    } catch {}
  }

  /* ================== LOGIN ================== */

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const idToken = await result.user.getIdToken();

    const res: any = await firstValueFrom(
      this.http.post(`${this.apiUrl}/auth/google`, { idToken })
    );

    this.handleAuthSuccess(res);
  }

  /* ================== REGISTER ================== */

  register(payload: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, payload).pipe(
      tap(res => {
        if (res.token) {
          this.handleAuthSuccess(res);
        }
      })
    );
  }

  /* ================== PASSWORD ================== */

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, payload);
  }

  /* ================== PRIVATE ================== */

  private handleAuthSuccess(res: any): void {
    if (!this.isBrowser()) return;

    if (res.token) {
      localStorage.setItem('token', res.token);
    }

    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }

    // Activamos sesión inmediatamente
    this.authSubject.next(true);

    // Luego cargamos usuario desde backend
    this.http.get<Usuario>(`${this.apiUrl}/usuarios/me`)
      .subscribe({
        next: (user) => {
          this.userSubject.next(user);
        },
        error: () => {
          this.clearSession();
        }
      });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;

      if (!exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return exp < now;

    } catch (error) {
      return true;
    }
  }

}
