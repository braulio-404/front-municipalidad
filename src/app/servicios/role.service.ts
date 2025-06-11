import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  constructor(private authService: AuthService) {}

  /**
   * Verifica si el usuario actual es admin
   * Prioriza localStorage para mayor confiabilidad
   */
  isAdmin(): boolean {
    // Verificar primero con AuthService
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user && user.rol === 'admin') {
        return true;
      }
    }
    
    // Fallback a localStorage directo si AuthService no tiene el usuario
    const user = this.getUserFromStorage();
    return user?.rol === 'admin';
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    // Verificar primero con AuthService
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user && user.rol === role) {
        return true;
      }
    }
    
    // Fallback a localStorage directo
    const user = this.getUserFromStorage();
    return user?.rol === role;
  }

  /**
   * Obtiene el rol actual del usuario
   */
  getCurrentRole(): string | null {
    // Primero intentar desde AuthService
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user && user.rol) {
        return user.rol;
      }
    }
    
    // Fallback a localStorage directo
    const user = this.getUserFromStorage();
    return user?.rol || null;
  }

  /**
   * Obtiene información completa del usuario desde localStorage
   */
  private getUserFromStorage(): any {
    try {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        const stored = JSON.parse(userStr);
        
        // Si está en formato de respuesta del backend, extraer el usuario
        if (stored && typeof stored === 'object' && stored !== null && 'data' in stored) {
          const storedWithData = stored as any;
          if (storedWithData.data && typeof storedWithData.data === 'object') {
            // El usuario está en data
            return storedWithData.data;
          }
        }
        
        // Si ya está en formato correcto, devolverlo
        if (stored && stored.rol) {
          return stored;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Limpia la información de usuario del localStorage
   */
  clearUserData(): void {
    localStorage.removeItem('current_user');
  }
} 