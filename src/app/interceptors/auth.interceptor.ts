import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  // Obtener el token directamente del localStorage para evitar dependencia circular
  const token = localStorage.getItem('auth_token');
  
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
      // Si es error 401 (No autorizado) y no es una request de login
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Limpiar token inválido
        localStorage.removeItem('auth_token');
        // Redirigir al login
        router.navigate(['/login']);
      }

      // Para otros errores, simplemente reenviarlos
      return throwError(() => error);
    })
  );
}; 