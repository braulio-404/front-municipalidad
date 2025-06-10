import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Requisito } from '../interfaces/requisito.interface';
import { FiltroRequisitos } from '../interfaces/api-response.interface';
import { BaseApiService } from './base-api.service';

export interface CreateRequisitoDto {
  nombre: string;
  descripcion?: string;
  tipo: 'documento' | 'certificado' | 'titulo' | 'experiencia' | 'otro';
  obligatorio: boolean;
  activo?: boolean;
}

export interface UpdateRequisitoDto extends Partial<CreateRequisitoDto> {}

@Injectable({
  providedIn: 'root'
})
export class RequisitosService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Obtener todos los requisitos
  getRequisitos(): Observable<Requisito[]> {
    return this.http.get<Requisito[]>(`${this.apiUrl}/requisitos`);
  }

  // Obtener solo los requisitos activos
  getRequisitosActivos(): Observable<Requisito[]> {
    const params = new HttpParams().set('activo', 'true');
    return this.http.get<Requisito[]>(`${this.apiUrl}/requisitos`, { params });
  }

  // Obtener un requisito por ID
  getRequisitoById(id: number): Observable<Requisito> {
    return this.http.get<Requisito>(`${this.apiUrl}/requisitos/${id}`);
  }

  // Crear un nuevo requisito
  crearRequisito(requisito: CreateRequisitoDto): Observable<Requisito> {
    return this.http.post<Requisito>(`${this.apiUrl}/requisitos`, requisito);
  }

  // Actualizar un requisito
  actualizarRequisito(id: number, requisito: UpdateRequisitoDto): Observable<Requisito> {
    return this.http.patch<Requisito>(`${this.apiUrl}/requisitos/${id}`, requisito);
  }

  // Eliminar un requisito
  eliminarRequisito(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requisitos/${id}`);
  }

  // Buscar requisitos por término
  buscarRequisitos(termino: string): Observable<Requisito[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<Requisito[]>(`${this.apiUrl}/requisitos`, { params });
  }

  // Buscar requisitos por término (solo activos) - método específico
  buscarRequisitosActivos(termino: string): Observable<Requisito[]> {
    // Primero buscar por término, luego filtrar en frontend solo los activos
    return this.buscarRequisitos(termino);
  }

  // Filtrar requisitos
  filtrarRequisitos(filtros: FiltroRequisitos): Observable<Requisito[]> {
    let params = new HttpParams();

    if (filtros.nombre) {
      params = params.set('nombre', filtros.nombre);
    }
    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    if (filtros.activo !== undefined) {
      params = params.set('activo', filtros.activo.toString());
    }

    return this.http.get<Requisito[]>(`${this.apiUrl}/requisitos`, { params });
  }
} 