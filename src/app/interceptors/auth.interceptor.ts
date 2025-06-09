import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el token de autenticación
  const token = authService.getToken();
  
  // Clonar la request y agregar el header de autorización si hay token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Enviar la request y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es error 401 (No autorizado)
      if (error.status === 401) {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken && !req.url.includes('/auth/refresh')) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Reintentar la request original con el nuevo token
              const newToken = authService.getToken();
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(() => {
              // Si falla el refresh, cerrar sesión
              authService.logout().subscribe();
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          // No hay refresh token o ya estamos intentando refrescar
          // Redirigir al login
          authService.logout().subscribe();
          router.navigate(['/login']);
        }
      }

      // Para otros errores, simplemente reenviarlos
      return throwError(() => error);
    })
  );
}; 