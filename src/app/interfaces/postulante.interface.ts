export interface Postulante {
  id?: number;
  postulanteID?: string;
  nombres: string;
  apellidoPaterno: string;
  rut: string;
  email: string;
  telefono?: string;
  fechaRegistro?: Date | string;
  formulario_id: number;
  estado?: string;
  documentos?: DocumentoPostulante[];
  formulario?: any; // Relación con Formulario
}

export interface DocumentoPostulante {
  id?: number;
  postulanteID: string;
  tipoDocumento: string;
  nombreArchivo: string;
  rutaArchivo: string;
  tamaño?: number;
  fechaSubida?: Date | string;
  activo?: boolean;
}

export interface PostulacionDetalle {
  id: number;
  cargo: string;
  descripcion: string;
  requisitos: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  requisitosSeleccionados: RequisitoSeleccionado[];
}

export interface RequisitoSeleccionado {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  obligatorio: boolean;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface CreatePostulanteDto {
  nombres: string;
  apellidoPaterno: string;
  rut: string;
  email: string;
  telefono?: string;
  formulario_id: number;
  documentos?: Array<{
    tipoDocumento: string;
    archivo: File;
  }>;
}

export interface PostulacionFormData {
  postulante: CreatePostulanteDto;
  documentos: Array<{
    tipoDocumento: string;
    archivo: File;
  }>;
}

export interface UpdateEstadoDto {
  estado: string;
}

export interface UpdateEstadoLoteDto {
  postulantesIds: string[];
  estado: string;
}

export interface UpdatePostulanteDto {
  nombres?: string;
  apellidoPaterno?: string;
  rut?: string;
  email?: string;
  telefono?: string;
  estado?: string;
}

export interface EstadisticasEstados {
  [estado: string]: number;
}

export interface PostulantePorEstado {
  estado: string;
  postulantes: Postulante[];
  total: number;
} 