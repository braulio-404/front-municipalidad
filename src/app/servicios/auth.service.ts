import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { BaseApiService } from './base-api.service';
import { 
  LoginDto, 
  RegisterDto, 
  AuthResponse,
  BackendAuthResponse, 
  UserProfile,
  ChangePasswordDto,
  ResetPasswordDto
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    protected override http: HttpClient,
    private router: Router
  ) {
    super(http);
    this.loadCurrentUser();
  }

  // Registrar nuevo usuario
  register(registerData: RegisterDto): Observable<AuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      .pipe(
        map(response => ({
          access_token: response.data.access_token,
          user: response.data.user
        }))
      );
  }

  // Iniciar sesión
  login(loginData: LoginDto): Observable<AuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        map(response => ({
          access_token: response.data.access_token,
          user: response.data.user
        })),
        tap(authResponse => {
          this.setToken(authResponse.access_token);
          this.currentUserSubject.next(authResponse.user);
        })
      );
  }

  // Cerrar sesión
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  // Obtener perfil del usuario
  getProfile(): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/auth/profile`)
      .pipe(
        map(response => {
          // Si la respuesta tiene estructura de backend, extraer data
          if (response.data && response.data.user) {
            return response.data.user;
          }
          // Si es respuesta directa, devolverla tal como está
          return response;
        }),
        tap(profile => {
          this.currentUserSubject.next(profile);
        })
      );
  }

  // Validar token
  validateToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/validate`);
  }

  // Refrescar token
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/auth/refresh`, {})
      .pipe(
        map(response => ({
          access_token: response.data.access_token,
          user: response.data.user
        })),
        tap(authResponse => {
          this.setToken(authResponse.access_token);
        })
      );
  }

  // Solicitar reset de contraseña
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { email });
  }

  // Cambiar contraseña
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Métodos de utilidad
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      this.getProfile().subscribe({
        next: (profile) => {
          this.currentUserSubject.next(profile);
        },
        error: () => {
          this.clearAuth();
        }
      });
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
} 