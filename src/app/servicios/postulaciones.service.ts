import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface CreatePostulacionDto {
  // Ajusta estos campos según tu DTO del backend
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaTermino: string;
  estado?: 'activa' | 'vencida';
}

export interface UpdatePostulacionDto extends Partial<CreatePostulacionDto> {}

export interface Postulacion {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: 'activa' | 'vencida';
  createdAt: string;
  updatedAt: string;
  fechaCreacion: string; // Añadido para compatibilidad
}

export interface FiltrosPostulacion {
  titulo?: string;
  estado?: 'activa' | 'vencida';
}

@Injectable({
  providedIn: 'root'
})
export class PostulacionesService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Crear una nueva postulación
  create(createPostulacionDto: CreatePostulacionDto): Observable<Postulacion> {
    return this.http.post<Postulacion>(`${this.apiUrl}/postulaciones`, createPostulacionDto);
  }

  // Obtener todas las postulaciones
  findAll(): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/postulaciones`);
  }

  // Filtrar postulaciones por título y/o estado
  filtrarPostulaciones(filtros: FiltrosPostulacion): Observable<Postulacion[]> {
    let params = new HttpParams();
    
    if (filtros.titulo) {
      params = params.set('titulo', filtros.titulo);
    }
    
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<Postulacion[]>(`${this.apiUrl}/postulaciones`, { params });
  }

  // Obtener una postulación por ID
  findOne(id: number): Observable<Postulacion> {
    return this.http.get<Postulacion>(`${this.apiUrl}/postulaciones/${id}`);
  }

  // Actualizar una postulación
  update(id: number, updatePostulacionDto: UpdatePostulacionDto): Observable<Postulacion> {
    return this.http.patch<Postulacion>(`${this.apiUrl}/postulaciones/${id}`, updatePostulacionDto);
  }

  // Eliminar una postulación
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/postulaciones/${id}`);
  }

  // Métodos de compatibilidad con código existente
  
  // Obtener todas las postulaciones (método de compatibilidad)
  getPostulaciones(): Observable<Postulacion[]> {
    return this.findAll();
  }

  // Obtener postulaciones activas
  getPostulacionesActivas(): Observable<Postulacion[]> {
    return this.filtrarPostulaciones({ estado: 'activa' });
  }

  // Obtener postulaciones vencidas
  getPostulacionesVencidas(): Observable<Postulacion[]> {
    return this.filtrarPostulaciones({ estado: 'vencida' });
  }

  // Obtener una postulación por ID (método de compatibilidad)
  getPostulacionById(id: number): Observable<Postulacion> {
    return this.findOne(id);
  }

  // Crear postulación (método de compatibilidad)
  crearPostulacion(postulacion: CreatePostulacionDto): Observable<Postulacion> {
    return this.create(postulacion);
  }

  // Actualizar postulación (método de compatibilidad)
  actualizarPostulacion(id: number, postulacion: UpdatePostulacionDto): Observable<Postulacion> {
    return this.update(id, postulacion);
  }

  // Eliminar postulación (método de compatibilidad)
  eliminarPostulacion(id: number): Observable<any> {
    return this.remove(id);
  }
} 