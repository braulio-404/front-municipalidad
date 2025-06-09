export interface EstadisticasGenerales {
  totalFormularios: number;
  totalPostulaciones: number;
  totalPostulantes: number;
  postulacionesActivas: number;
  postulacionesVencidas: number;
  totalUsuarios: number;
  usuariosActivos: number;
  nuevosUsuariosEsteMes: number;
}

export interface EstadisticasGraficos {
  postulacionesPorMes: { mes: string; cantidad: number }[];
  postulacionesPorEstado: { estado: string; cantidad: number }[];
  usuariosPorRol: { rol: string; cantidad: number }[];
  postulantesPorFormulario: { formulario: string; cantidad: number }[];
  tendenciaPostulaciones: { fecha: string; postulaciones: number; usuarios: number }[];
}

export interface ActividadReciente {
  id: string;
  tipo: 'formulario' | 'postulacion' | 'usuario' | 'sistema';
  titulo: string;
  descripcion: string;
  fecha: Date;
  icono: string;
  usuario?: string;
}

export interface EstadisticaPostulacion {
  id?: number;
  cargo: string;
  fechaInicio: Date | string;
  fechaTermino: Date | string;
  estado?: 'Activo' | 'Inactivo';
  cantidadPostulantes: number;
}

export interface DatoGrafico {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface MetricasTiempo {
  fecha: string;
  valor: number;
}

export interface ResumenMetricas {
  totalPostulaciones: number;
  postulacionesEsteMes: number;
  promedioPostulantesPorOferta: number;
  tasaCrecimiento: number;
} 