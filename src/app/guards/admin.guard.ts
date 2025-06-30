import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('🔒 AdminGuard: Verificando permisos de administrador...');
    
    // Verificar si el usuario está autenticado
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔐 Usuario autenticado:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener información del usuario para debug
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuario actual:', currentUser);
    console.log('🎭 Rol del usuario:', currentUser?.rol);
    
    // Verificar si el usuario es admin
    const isAdmin = this.authService.isAdmin();
    console.log('👑 Es administrador:', isAdmin);
    
    if (!isAdmin) {
      console.log('❌ Usuario no es admin, redirigiendo a unauthorized');
      console.log('🔍 Valores de verificación:');
      console.log('  - currentUser:', currentUser);
      console.log('  - currentUser.rol:', currentUser?.rol);
      console.log('  - isAdmin():', this.authService.isAdmin());
      console.log('  - hasRole("admin"):', this.authService.hasRole('admin'));
      
      this.router.navigate(['/unauthorized']);
      return false;
    }

    console.log('✅ AdminGuard: Acceso permitido');
    return true;
  }
} 