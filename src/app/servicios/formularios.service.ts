import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Formulario } from '../interfaces/formulario.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulariosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener todos los formularios
  getFormularios(): Observable<Formulario[]> {
    // En producción, descomentar y usar:
    // return this.http.get<Formulario[]>(`${this.apiUrl}/formularios`);
    
    // Datos de ejemplo mientras se implementa el backend
    return of([
      {
        id: 1,
        cargo: 'Ingeniero Civil Geotécnico',
        fechaInicio: '2025-05-13',
        fechaTermino: '2025-05-20',
        estado: 'Activo'
      },
      {
        id: 2,
        cargo: 'Ingeniero de Soporte - Experiencia con ERP Odoo',
        fechaInicio: '2025-05-13',
        fechaTermino: '2025-05-21',
        estado: 'Activo'
      },
      {
        id: 3,
        cargo: 'Ingeniero/a Comercial Freelance',
        fechaInicio: '2025-01-13',
        fechaTermino: '2025-02-21',
        estado: 'Inactivo'
      }
    ]);
  }

  // Crear un nuevo formulario
  crearFormulario(formulario: Formulario): Observable<Formulario> {
    // En producción, descomentar y usar:
    // return this.http.post<Formulario>(`${this.apiUrl}/formularios`, formulario);
    
    // Respuesta de ejemplo
    return of({...formulario, id: Math.floor(Math.random() * 1000)});
  }

  // Actualizar un formulario
  actualizarFormulario(id: number, formulario: Formulario): Observable<Formulario> {
    // En producción, descomentar y usar:
    // return this.http.put<Formulario>(`${this.apiUrl}/formularios/${id}`, formulario);
    
    // Respuesta de ejemplo
    return of({...formulario, id});
  }

  // Eliminar un formulario
  eliminarFormulario(id: number): Observable<any> {
    // En producción, descomentar y usar:
    // return this.http.delete(`${this.apiUrl}/formularios/${id}`);
    
    // Respuesta de ejemplo
    return of({ success: true });
  }

  // Descargar documentos asociados a postulaciones
  descargarDocumentos(ids: number[]): Observable<Blob> {
    // En producción, descomentar y usar:
    // return this.http.post(`${this.apiUrl}/formularios/descargar`, { ids }, { responseType: 'blob' });
    
    // Para simular la descarga en desarrollo
    const dummyPdfBlob = new Blob(['Contenido PDF simulado'], { type: 'application/pdf' });
    return of(dummyPdfBlob);
  }
} 