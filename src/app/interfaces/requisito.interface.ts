export interface Requisito {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'documento' | 'certificado' | 'titulo' | 'experiencia' | 'otro';
  obligatorio: boolean;
  activo: boolean;
  fechaCreacion: Date;
  fechaModificacion?: Date;
} 