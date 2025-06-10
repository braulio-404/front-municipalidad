export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroBase {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface FiltroFormularios extends FiltroBase {
  estado?: 'Activo' | 'Inactivo';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface FiltroPostulaciones extends FiltroBase {
  titulo?: string;
  estado?: 'activa' | 'vencida';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface FiltroRequisitos extends FiltroBase {
  nombre?: string;
  tipo?: 'documento' | 'certificado' | 'titulo' | 'experiencia' | 'otro';
  activo?: boolean;
}

export interface FiltroUsuarios extends FiltroBase {
  rol?: 'admin' | 'user' | 'postulante';
  estado?: 'activo' | 'inactivo' | 'bloqueado';
  fechaRegistroDesde?: Date;
  fechaRegistroHasta?: Date;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
} 