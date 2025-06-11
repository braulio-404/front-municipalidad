import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, of, catchError } from 'rxjs';
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
  
  // Estado de inicialización para manejar el loading del usuario al inicio
  private initializationSubject = new BehaviorSubject<boolean>(false);
  public initialized$ = this.initializationSubject.asObservable();

  constructor(
    protected override http: HttpClient,
    private router: Router
  ) {
    super(http);
    
    // Limpiar localStorage corrupto al inicializar
    this.cleanCorruptedStorage();
    
    this.loadCurrentUser();
  }

  /**
   * Limpia el localStorage si tiene formato corrupto del backend
   */
  private cleanCorruptedStorage(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const stored = JSON.parse(userStr);
        // Si tiene estructura de respuesta del backend, limpiarlo
        if (stored && stored.status && stored.message && stored.data) {
          localStorage.removeItem('current_user');
        }
      } catch (error) {
        localStorage.removeItem('current_user');
      }
    }
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
          this.setUser(authResponse.user);
          this.currentUserSubject.next(authResponse.user);
          this.initializationSubject.next(true);
        })
      );
  }

  // Cerrar sesión
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        }),
        catchError(() => {
          // Incluso si el logout falla en el servidor, limpiar localmente
          this.clearAuth();
          return of(null);
        })
      );
  }

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
          this.setUser(profile);
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

  private setUser(user: UserProfile): void {
    // Extraer el usuario real si viene en formato de respuesta del backend
    let actualUser = user;
    
    // Si es una respuesta del backend con estructura anidada
    if (user && typeof user === 'object' && user !== null && 'data' in user) {
      const userWithData = user as any;
      if (userWithData.data && typeof userWithData.data === 'object') {
        // El usuario está directamente en data
        actualUser = userWithData.data;
      }
    }
    
    try {
      localStorage.setItem('current_user', JSON.stringify(actualUser));
    } catch (error) {
      // Silenciar error
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredUser(): UserProfile | null {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const stored = JSON.parse(userStr);
        
        // Si está en formato de respuesta del backend, extraer el usuario
        if (stored && typeof stored === 'object' && stored !== null && 'data' in stored) {
          const storedWithData = stored as any;
          if (storedWithData.data && typeof storedWithData.data === 'object') {
            // El usuario está directamente en data
            const actualUser = storedWithData.data;
            
            // Actualizar localStorage con el formato correcto
            this.setUser(actualUser);
            return actualUser;
          }
        }
        
        // Si ya está en formato correcto, devolverlo
        if (stored && stored.rol) {
          return stored;
        }
        
        return null;
      } catch (error) {
        localStorage.removeItem('current_user');
        return null;
      }
    }
    return null;
  }

  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.initializationSubject.next(true);
    this.router.navigate(['/login']);
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    const storedUser = this.getStoredUser();
    
    if (token && storedUser) {
      // Usar el usuario almacenado inmediatamente
      this.currentUserSubject.next(storedUser);
      
      // Solo intentar actualizar el perfil si el servidor está disponible
      // y manejar errores sin limpiar la sesión local
      this.getProfile().subscribe({
        next: (profile) => {
          // Solo actualizar si realmente hay cambios
          if (profile && profile.rol) {
            this.setUser(profile);
            this.currentUserSubject.next(profile);
          }
          this.initializationSubject.next(true);
        },
        error: (error) => {
          // NO limpiar auth, mantener el usuario local
          this.initializationSubject.next(true);
        }
      });
    } else if (token && !storedUser) {
      // Solo si hay token pero no usuario almacenado
      this.getProfile().subscribe({
        next: (profile) => {
          this.setUser(profile);
          this.currentUserSubject.next(profile);
          this.initializationSubject.next(true);
        },
        error: (error) => {
          this.clearAuth();
        }
      });
    } else {
      // Sin token ni usuario
      this.initializationSubject.next(true);
    }
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    const hasUser = !!this.getCurrentUser();
    return hasToken && hasUser;
  }

  getCurrentUser(): UserProfile | null {
    let user = this.currentUserSubject.value;
    
    if (!user) {
      user = this.getStoredUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
    
    return user;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isAdminFromStorage(): boolean {
    const user = this.getStoredUser();
    return user?.rol === 'admin';
  }

  /**
   * Fuerza la corrección del formato de usuario en localStorage
   */
  fixUserStorageFormat(): void {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  // Método para verificar si el servicio está inicializado
  isInitialized(): boolean {
    return this.initializationSubject.value;
  }
} 