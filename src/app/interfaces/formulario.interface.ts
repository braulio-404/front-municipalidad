import { RequisitoSeleccionado } from './postulante.interface';

export interface Formulario {
    id?: number;
    cargo: string;
    descripcion?: string;
    requisitos?: string;
    fechaInicio: Date | string;
    fechaTermino: Date | string;
    estado?: 'Activo' | 'Inactivo';
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
    requisitosSeleccionados?: RequisitoSeleccionado[];
    cantidadPostulantes?: number;
} 