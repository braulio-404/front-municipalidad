import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formulario } from '../interfaces/formulario.interface';
import { BaseApiService } from './base-api.service';

export interface CreateFormularioDto {
  cargo: string;
  descripcion?: string;
  requisitos?: string;
  fechaInicio: string;
  fechaTermino: string;
  estado?: 'Activo' | 'Inactivo';
  requisitosSeleccionados?: number[];
}

export interface UpdateFormularioDto extends Partial<CreateFormularioDto> {}

export interface FormularioConConteo extends Formulario {
  cantidadPostulantes: number;
}

export interface DescargarDocumentosDto {
  ids: number[];
}

@Injectable({
  providedIn: 'root'
})
export class FormulariosService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Métodos que coinciden con el controller de NestJS

  // Crear un nuevo formulario
  create(createFormularioDto: CreateFormularioDto): Observable<Formulario> {
    return this.http.post<Formulario>(`${this.apiUrl}/formularios`, createFormularioDto);
  }

  // Obtener todos los formularios
  findAll(): Observable<Formulario[]> {
    return this.http.get<Formulario[]>(`${this.apiUrl}/formularios`);
  }

  // Obtener todos los formularios con conteo optimizado
  findAllConConteo(): Observable<FormularioConConteo[]> {
    return this.http.get<FormularioConConteo[]>(`${this.apiUrl}/formularios/con-conteo`);
  }

  // Obtener un formulario por ID
  findOne(id: number): Observable<Formulario> {
    return this.http.get<Formulario>(`${this.apiUrl}/formularios/${id}`);
  }

  // Actualizar un formulario
  update(id: number, updateFormularioDto: UpdateFormularioDto): Observable<Formulario> {
    return this.http.patch<Formulario>(`${this.apiUrl}/formularios/${id}`, updateFormularioDto);
  }

  // Eliminar un formulario
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/formularios/${id}`);
  }

  // Descargar documentos asociados a formularios
  descargarDocumentos(descargarDocumentosDto: DescargarDocumentosDto): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/formularios/descargar`, descargarDocumentosDto, { responseType: 'blob' });
  }

  // Métodos de compatibilidad con código existente

  // Obtener todos los formularios (método de compatibilidad)
  getFormularios(): Observable<Formulario[]> {
    return this.findAll();
  }

  // Obtener todos los formularios con conteo (método de compatibilidad)
  getFormulariosConConteo(): Observable<FormularioConConteo[]> {
    return this.findAllConConteo();
  }

  // Obtener un formulario por ID (método de compatibilidad)
  getFormularioById(id: number): Observable<Formulario> {
    return this.findOne(id);
  }

  // Crear un nuevo formulario (método de compatibilidad)
  crearFormulario(formulario: CreateFormularioDto): Observable<Formulario> {
    return this.create(formulario);
  }

  // Actualizar un formulario (método de compatibilidad)
  actualizarFormulario(id: number, formulario: UpdateFormularioDto): Observable<Formulario> {
    return this.update(id, formulario);
  }

  // Eliminar un formulario (método de compatibilidad)
  eliminarFormulario(id: number): Observable<any> {
    return this.remove(id);
  }
} 