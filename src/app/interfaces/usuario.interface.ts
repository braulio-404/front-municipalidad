export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: 'admin' | 'user' | 'postulante';
  estado: 'activo' | 'inactivo' | 'bloqueado';
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  ultimoAcceso?: Date;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  rol?: 'admin' | 'user' | 'postulante';
}

export interface UpdateUsuarioDto {
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: 'admin' | 'user' | 'postulante';
  estado?: 'activo' | 'inactivo' | 'bloqueado';
} 