import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected apiUrl = environment.apiUrl;
  
  protected httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected http: HttpClient) {}

  /**
   * Maneja errores HTTP
   */
  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tus credenciales.';
          break;
        case 403:
          errorMessage = 'Acceso prohibido.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error en la API:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * GET request
   */
  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * POST request
   */
  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   */
  protected put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   */
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PATCH request
   */
  protected patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
} 