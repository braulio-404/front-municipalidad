import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Requisito } from '../interfaces/requisito.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequisitosService {
  private apiUrl = `${environment.apiUrl}/requisitos`;

  // Datos de ejemplo para desarrollo
  private requisitosEjemplo: Requisito[] = [
    { id: 1, nombre: 'Nombre Completo' },
    { id: 2, nombre: 'Apellido Paterno' },
    { id: 3, nombre: 'Apellido Materno' },
    { id: 4, nombre: 'Rut' },
    { id: 5, nombre: 'Dirección' },
    { id: 6, nombre: 'Correo Electrónico' },
    { id: 7, nombre: 'CV' },
    { id: 8, nombre: 'Certificado de Antecedentes' },
    { id: 9, nombre: 'Certificado de Nacimiento' },
    { id: 10, nombre: 'Carnet de Identidad' },
    { id: 11, nombre: 'Título Profesional' },
    { id: 12, nombre: 'Certificado de Experiencia' }
  ];

  constructor(private http: HttpClient) {}

  getRequisitos(): Observable<Requisito[]> {
    // En producción, descomenta la siguiente línea y comenta la de abajo
    // return this.http.get<Requisito[]>(this.apiUrl);
    return of(this.requisitosEjemplo);
  }

  getRequisitoById(id: number): Observable<Requisito | undefined> {
    // En producción, descomenta la siguiente línea y comenta la de abajo
    // return this.http.get<Requisito>(`${this.apiUrl}/${id}`);
    return of(this.requisitosEjemplo.find(r => r.id === id));
  }

  buscarRequisitos(termino: string): Observable<Requisito[]> {
    // En producción, implementar la lógica para llamar al backend
    // return this.http.get<Requisito[]>(`${this.apiUrl}/buscar?termino=${termino}`);
    const terminoLowerCase = termino.toLowerCase();
    const resultados = this.requisitosEjemplo.filter(
      req => req.nombre.toLowerCase().includes(terminoLowerCase)
    );
    return of(resultados);
  }
} 