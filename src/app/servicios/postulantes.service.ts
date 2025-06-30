import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { 
  Postulante, 
  CreatePostulanteDto, 
  DocumentoPostulante, 
  PostulacionFormData,
  UpdateEstadoDto,
  UpdateEstadoLoteDto,
  UpdatePostulanteDto,
  EstadisticasEstados,
  PostulantePorEstado
} from '../interfaces/postulante.interface';
import { EstadisticasAdminService } from './estadisticas-admin.service';

@Injectable({
  providedIn: 'root'
})
export class PostulantesService extends BaseApiService {

  constructor(
    protected override http: HttpClient,
    private estadisticasAdminService: EstadisticasAdminService
  ) {
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

    return this.http.post<Postulante>(`${this.apiUrl}/postulante/crear-postulante`, formData).pipe(
      tap((postulanteCreado) => {
        // Registrar actividad de nuevo postulante
        this.estadisticasAdminService.registrarActividad({
          tipo: 'usuario',
          titulo: 'Nuevo postulante registrado',
          descripcion: `${postulanteCreado.nombres} ${postulanteCreado.apellidoPaterno} se registró como postulante`,
          icono: 'person_add'
        });
      })
    );
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

  // Obtener archivo de documento como blob para visualización
  getDocumentoArchivo(documentoId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documento-postulante/${documentoId}/archivo`, { 
      responseType: 'blob' 
    });
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

  // ========== NUEVOS MÉTODOS PARA GESTIÓN DE ESTADOS ==========

  /**
   * Actualizar estado individual de un postulante
   * PATCH /postulante/:id/estado
   */
  updateEstado(id: string, updateEstadoDto: UpdateEstadoDto): Observable<Postulante> {
    return this.http.patch<Postulante>(`${this.apiUrl}/postulante/${id}/estado`, updateEstadoDto).pipe(
      tap((postulanteActualizado) => {
        // Registrar actividad de cambio de estado
        this.estadisticasAdminService.registrarActividad({
          tipo: 'sistema',
          titulo: 'Estado de postulante actualizado',
          descripcion: `Estado de ${postulanteActualizado.nombres} ${postulanteActualizado.apellidoPaterno} cambió a: ${updateEstadoDto.estado}`,
          icono: 'update'
        });
      })
    );
  }

  /**
   * Buscar postulantes por estado (opcionalmente filtrado por formulario)
   * GET /postulante/estado/:estado?formularioId=1
   */
  findByEstado(estado: string, formularioId?: number): Observable<Postulante[]> {
    let url = `${this.apiUrl}/postulante/estado/${encodeURIComponent(estado)}`;
    if (formularioId) {
      url += `?formularioId=${formularioId}`;
    }
    return this.http.get<Postulante[]>(url);
  }

  /**
   * Actualizar estado de múltiples postulantes en lote
   * PATCH /postulante/estado/lote
   */
  updateEstadoLote(updateEstadoLoteDto: UpdateEstadoLoteDto): Observable<{ actualizados: number; postulantes: Postulante[] }> {
    return this.http.patch<{ actualizados: number; postulantes: Postulante[] }>(
      `${this.apiUrl}/postulante/estado/lote`, 
      updateEstadoLoteDto
    ).pipe(
      tap((resultado) => {
        // Registrar actividad de actualización en lote
        this.estadisticasAdminService.registrarActividad({
          tipo: 'sistema',
          titulo: 'Actualización de estados en lote',
          descripcion: `Se actualizaron ${resultado.actualizados} postulantes al estado: ${updateEstadoLoteDto.estado}`,
          icono: 'batch_prediction'
        });
      })
    );
  }

  /**
   * Obtener estadísticas de distribución de estados
   * GET /postulante/estadisticas/estados?formularioId=1
   */
  getEstadisticasEstados(formularioId?: number): Observable<EstadisticasEstados> {
    let url = `${this.apiUrl}/postulante/estadisticas/estados`;
    if (formularioId) {
      url += `?formularioId=${formularioId}`;
    }
    return this.http.get<EstadisticasEstados>(url);
  }

  /**
   * Obtener todos los postulantes agrupados por estado
   * GET /postulante/agrupados-por-estado?formularioId=1
   */
  getPostulantesAgrupadosPorEstado(formularioId?: number): Observable<PostulantePorEstado[]> {
    let url = `${this.apiUrl}/postulante/agrupados-por-estado`;
    if (formularioId) {
      url += `?formularioId=${formularioId}`;
    }
    return this.http.get<PostulantePorEstado[]>(url);
  }

  /**
   * Actualizar postulante (método actualizado para incluir estado)
   */
  updatePostulante(id: string, updatePostulanteDto: UpdatePostulanteDto): Observable<Postulante> {
    return this.http.patch<Postulante>(`${this.apiUrl}/postulantes/${id}`, updatePostulanteDto).pipe(
      tap((postulanteActualizado) => {
        if (updatePostulanteDto.estado) {
          // Registrar actividad si se cambió el estado
          this.estadisticasAdminService.registrarActividad({
            tipo: 'sistema',
            titulo: 'Postulante actualizado',
            descripcion: `Se actualizó información de ${postulanteActualizado.nombres} ${postulanteActualizado.apellidoPaterno}`,
            icono: 'edit'
          });
        }
      })
    );
  }

  /**
   * Obtener lista de estados disponibles
   */
  getEstadosDisponibles(): string[] {
    return [
      'Pendiente',
      'En Revisión',
      'Seleccionado',
      'Rechazado',
      'Finalizado',
      'Documentos Incompletos',
      'En Proceso',
      'Aprobado'
    ];
  }

  /**
   * Obtener color para cada estado (para UI)
   */
  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': '#ffa726',
      'En Revisión': '#42a5f5',
      'Seleccionado': '#66bb6a',
      'Rechazado': '#ef5350',
      'Finalizado': '#9c27b0',
      'Documentos Incompletos': '#ff7043',
      'En Proceso': '#29b6f6',
      'Aprobado': '#4caf50'
    };
    return colores[estado] || '#757575';
  }

  /**
   * Obtener icono para cada estado (para UI)
   */
  getIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'Pendiente': 'schedule',
      'En Revisión': 'rate_review',
      'Seleccionado': 'check_circle',
      'Rechazado': 'cancel',
      'Finalizado': 'done_all',
      'Documentos Incompletos': 'warning',
      'En Proceso': 'sync',
      'Aprobado': 'verified'
    };
    return iconos[estado] || 'help';
  }
} 