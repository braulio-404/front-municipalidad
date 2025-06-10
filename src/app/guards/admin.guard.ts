import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { map, take, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Esperar a que el servicio se inicialice completamente
    return this.authService.initialized$.pipe(
      filter(initialized => initialized), // Solo continuar cuando esté inicializado
      take(1),
      switchMap(() => {
        // Ahora verificar autenticación con el estado actualizado
        return this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            const isAuthenticated = this.authService.isAuthenticated();
            
            // Permitir acceso a cualquier usuario autenticado
            if (isAuthenticated && user) {
              return true;
            } else {
              // No está autenticado
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: state.url }
              });
              return false;
            }
          })
        );
      })
    );
  }
} 