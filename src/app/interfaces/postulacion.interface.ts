export interface Postulacion {
    id: number;
    titulo: string;
    descripcion?: string;
    fechaInicio: Date | string;
    fechaTermino: Date | string;
    fechaCreacion?: Date | string;
    fechaActualizacion?: Date | string;
    estado: 'activa' | 'vencida';
    createdAt?: string;
    updatedAt?: string;
}