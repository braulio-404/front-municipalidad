import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { 
  Postulante, 
  CreatePostulanteDto, 
  DocumentoPostulante, 
  PostulacionFormData 
} from '../interfaces/postulante.interface';

@Injectable({
  providedIn: 'root'
})
export class PostulantesService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Crear un nuevo postulante
  createPostulante(createPostulanteDto: CreatePostulanteDto): Observable<Postulante> {
    return this.http.post<Postulante>(`${this.apiUrl}/postulantes`, createPostulanteDto);
  }

  // Crear postulante con documentos usando el endpoint /crear-postulante
  create(createPostulanteDto: CreatePostulanteDto): Observable<Postulante> {
    const formData = new FormData();
    
    // Agregar datos del postulante
    formData.append('nombres', createPostulanteDto.nombres);
    formData.append('apellidoPaterno', createPostulanteDto.apellidoPaterno);
    formData.append('rut', createPostulanteDto.rut);
    formData.append('email', createPostulanteDto.email);
    formData.append('formulario_id', createPostulanteDto.formulario_id.toString());
    
    if (createPostulanteDto.telefono) {
      formData.append('telefono', createPostulanteDto.telefono);
    }

    // Agregar documentos si existen
    if (createPostulanteDto.documentos) {
      createPostulanteDto.documentos.forEach((doc, index) => {
        formData.append(`documentos[${index}][tipoDocumento]`, doc.tipoDocumento);
        formData.append(`documentos[${index}][archivo]`, doc.archivo);
      });
    }

    return this.http.post<Postulante>(`${this.apiUrl}/postulante/crear-postulante`, formData);
  }

  // Obtener todos los postulantes
  findAll(): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.apiUrl}/postulantes`);
  }

  // Obtener un postulante por ID
  findOne(id: string): Observable<Postulante> {
    return this.http.get<Postulante>(`${this.apiUrl}/postulantes/${id}`);
  }

  // Obtener postulantes por formulario
  findByFormulario(formularioId: number): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.apiUrl}/postulantes/formulario/${formularioId}`);
  }

  // Actualizar un postulante
  update(id: string, updatePostulanteDto: Partial<CreatePostulanteDto>): Observable<Postulante> {
    return this.http.patch<Postulante>(`${this.apiUrl}/postulantes/${id}`, updatePostulanteDto);
  }

  // Eliminar un postulante
  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/postulantes/${id}`);
  }

  // Subir documento de postulante
  uploadDocumento(postulanteId: string, formData: FormData): Observable<DocumentoPostulante> {
    return this.http.post<DocumentoPostulante>(`${this.apiUrl}/documento-postulante/${postulanteId}`, formData);
  }

  // Obtener documentos de un postulante
  getDocumentos(postulanteId: string): Observable<DocumentoPostulante[]> {
    return this.http.get<DocumentoPostulante[]>(`${this.apiUrl}/documento-postulante/postulante/${postulanteId}`);
  }

  // Eliminar documento
  deleteDocumento(documentoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documento-postulante/${documentoId}`);
  }

  // Crear postulación completa (postulante + documentos)
  createPostulacionCompleta(postulacionData: PostulacionFormData): Observable<Postulante> {
    const formData = new FormData();
    
    // Agregar datos del postulante
    formData.append('nombres', postulacionData.postulante.nombres);
    formData.append('apellidoPaterno', postulacionData.postulante.apellidoPaterno);
    formData.append('rut', postulacionData.postulante.rut);
    formData.append('email', postulacionData.postulante.email);
    formData.append('formulario_id', postulacionData.postulante.formulario_id.toString());
    
    if (postulacionData.postulante.telefono) {
      formData.append('telefono', postulacionData.postulante.telefono);
    }

    // Agregar documentos
    postulacionData.documentos.forEach((doc, index) => {
      formData.append(`documentos[${index}][tipoDocumento]`, doc.tipoDocumento);
      formData.append(`documentos[${index}][archivo]`, doc.archivo);
    });

    return this.http.post<Postulante>(`${this.apiUrl}/postulantes/postulacion-completa`, formData);
  }

  // Verificar si un RUT ya existe
  verificarRutExiste(rut: string): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/postulantes/verificar-rut/${rut}`);
  }

  // Verificar si un email ya existe
  verificarEmailExiste(email: string): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/postulantes/verificar-email/${email}`);
  }
} 