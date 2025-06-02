export interface Formulario {
    id?: number;
    cargo: string;
    fechaInicio: Date | string;
    fechaTermino: Date | string;
    estado: 'Activo' | 'Inactivo';
} 