import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { map, take } from 'rxjs/operators';

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
    
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        const isAuthenticated = this.authService.isAuthenticated();
        const isAdmin = this.authService.isAdmin();
        
        if (isAuthenticated && isAdmin) {
          return true;
        } else if (isAuthenticated && !isAdmin) {
          // Usuario autenticado pero no es admin
          this.router.navigate(['/unauthorized']);
          return false;
        } else {
          // No está autenticado
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
} 