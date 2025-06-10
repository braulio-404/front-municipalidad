import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, BehaviorSubject } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { FormulariosService, FormularioConConteo } from './formularios.service';
import { PostulacionesService, Postulacion } from './postulaciones.service';
import { UsuariosService } from './usuarios.service';
import { 
  EstadisticasGenerales, 
  EstadisticasGraficos, 
  ActividadReciente 
} from '../interfaces/estadisticas.interface';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasAdminService extends BaseApiService {
  // BehaviorSubject para manejar la actividad reciente
  private actividadRecienteSubject = new BehaviorSubject<ActividadReciente[]>([]);
  private actividades: ActividadReciente[] = [];
  private readonly STORAGE_KEY = 'actividad_reciente_municipalidad';

  constructor(
    protected override http: HttpClient,
    private formulariosService: FormulariosService,
    private postulacionesService: PostulacionesService,
    private usuariosService: UsuariosService
  ) {
    super(http);
    this.inicializarActividadReciente();
  }

  // Inicializar actividad reciente con datos persistidos o por defecto
  private inicializarActividadReciente(): void {
    console.log('🔄 Inicializando sistema de actividad reciente...');
    
    // Intentar cargar desde localStorage primero
    try {
      const actividadGuardada = localStorage.getItem(this.STORAGE_KEY);
      if (actividadGuardada) {
        const actividadParseada = JSON.parse(actividadGuardada);
        // Convertir fechas de string a Date
        this.actividades = actividadParseada.map((actividad: any) => ({
          ...actividad,
          fecha: new Date(actividad.fecha)
        }));
        console.log('📂 Actividad reciente cargada desde localStorage:', this.actividades.length, 'elementos');
      } else {
        console.log('📂 No hay actividad guardada, inicializando con datos por defecto');
        this.cargarDatosPorDefecto();
      }
    } catch (error) {
      console.error('❌ Error al cargar actividad desde localStorage:', error);
      this.cargarDatosPorDefecto();
    }
    
    this.actividadRecienteSubject.next([...this.actividades]);
    console.log('✅ Sistema de actividad reciente inicializado:', this.actividades.length, 'actividades');
  }

  private cargarDatosPorDefecto(): void {
    this.actividades = [
      {
        id: '1',
        tipo: 'formulario',
        titulo: 'Nuevo formulario creado',
        descripcion: 'Se creó el formulario para Ingeniero Civil Geotécnico',
        fecha: new Date(Date.now() - 5 * 60 * 1000), // Hace 5 minutos
        icono: 'description',
        usuario: 'Admin Sistema'
      },
      {
        id: '2',
        tipo: 'usuario',
        titulo: 'Usuario registrado',
        descripcion: 'Nuevo usuario postulante registrado en el sistema',
        fecha: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
        icono: 'person_add'
      },
      {
        id: '3',
        tipo: 'postulacion',
        titulo: 'Postulación actualizada',
        descripcion: 'Se actualizó el estado de la postulación para Contador Senior',
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        icono: 'edit',
        usuario: 'Admin RH'
      }
    ];
  }

  // Guardar actividades en localStorage
  private guardarEnLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.actividades));
      console.log('💾 Actividades guardadas en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar en localStorage:', error);
    }
  }

  // Registrar nueva actividad
  registrarActividad(actividad: Omit<ActividadReciente, 'id' | 'fecha'>): void {
    console.log('📝 Registrando nueva actividad:', actividad);
    
    const nuevaActividad: ActividadReciente = {
      ...actividad,
      id: Date.now().toString(),
      fecha: new Date()
    };

    // Agregar al inicio de la lista
    this.actividades.unshift(nuevaActividad);
    
    // Mantener solo las últimas 50 actividades
    if (this.actividades.length > 50) {
      this.actividades = this.actividades.slice(0, 50);
    }

    console.log('✅ Actividad registrada correctamente. Total actividades:', this.actividades.length);
    console.log('📋 Lista actual de actividades:', this.actividades.map(a => ({ titulo: a.titulo, fecha: a.fecha })));
    
    // Guardar en localStorage
    this.guardarEnLocalStorage();
    
    // Forzar emisión inmediata con una nueva referencia del array
    this.actividadRecienteSubject.next([...this.actividades]);
    
    console.log('🔄 Emisión forzada de actividades actualizada');
  }

  // Obtener actividad reciente
  getActividadReciente(limite: number = 10): Observable<ActividadReciente[]> {
    console.log('🔍 Solicitando actividad reciente, límite:', limite);
    
    return this.actividadRecienteSubject.asObservable().pipe(
      map(actividades => {
        const resultado = actividades.slice(0, limite);
        console.log('📊 Retornando', resultado.length, 'actividades de', actividades.length, 'totales');
        return resultado;
      })
    );
  }

  // Método para obtener todas las actividades (para depuración)
  getTodasLasActividades(): ActividadReciente[] {
    return [...this.actividades];
  }

  // Método para limpiar las actividades (para pruebas)
  limpiarActividades(): void {
    console.log('🧹 Limpiando todas las actividades');
    this.actividades = [];
    this.actividadRecienteSubject.next([]);
    
    // Limpiar también localStorage
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 Actividades eliminadas de localStorage');
    } catch (error) {
      console.error('❌ Error al limpiar localStorage:', error);
    }
  }

  // Obtener formularios con conteo de postulantes para estadísticas
  getFormulariosConConteoEstadisticas(): Observable<FormularioConConteo[]> {
    return this.formulariosService.findAllConConteo();
  }

  // Obtener estadísticas generales combinando datos de diferentes servicios
  getEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return forkJoin({
      formularios: this.formulariosService.getFormulariosConConteo().pipe(
        catchError(error => {
          console.warn('Error al obtener formularios:', error);
          return of([]);
        })
      ),
      usuarios: this.usuariosService.getUsuarios().pipe(
        catchError(error => {
          console.warn('Error al obtener usuarios:', error);
          return of([]);
        })
      )
    }).pipe(
      map(({ formularios, usuarios }) => {
        // Validar que los datos sean arrays antes de usar métodos de array
        const formulariosArray = Array.isArray(formularios) ? formularios : [];
        const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
        
        // Contar formularios activos (usando 'Activo' como estado correcto)
        const formularioesActivos = formulariosArray.filter((f: any) => f.estado === 'Activo').length;
        const formularioesInactivos = formulariosArray.filter((f: any) => f.estado === 'Inactivo').length;
        const usuariosActivos = usuariosArray.filter((u: any) => u.estado === 'activo').length;
        
        // Calcular usuarios nuevos este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        
        const nuevosUsuariosEsteMes = usuariosArray.filter((u: any) => 
          u.fechaCreacion && new Date(u.fechaCreacion) >= inicioMes
        ).length;

        // Calcular total de postulantes desde los formularios con conteo
        const totalPostulantes = formulariosArray.reduce((total, formulario) => 
          total + (formulario.cantidadPostulantes || 0), 0);

        return {
          totalFormularios: formulariosArray.length,
          totalPostulaciones: formulariosArray.length, // En realidad son formularios, mantenemos por compatibilidad
          totalPostulantes,
          postulacionesActivas: formularioesActivos, // Formularios activos
          postulacionesVencidas: formularioesInactivos, // Formularios inactivos
          totalUsuarios: usuariosArray.length,
          usuariosActivos,
          nuevosUsuariosEsteMes
        };
      }),
      catchError(error => {
        console.error('Error general en estadísticas:', error);
        return of({
          totalFormularios: 0,
          totalPostulaciones: 0,
          totalPostulantes: 0,
          postulacionesActivas: 0,
          postulacionesVencidas: 0,
          totalUsuarios: 0,
          usuariosActivos: 0,
          nuevosUsuariosEsteMes: 0
        });
      })
    );
  }

  // Obtener datos para gráficos
  getEstadisticasGraficos(): Observable<EstadisticasGraficos> {
    return forkJoin({
      formularios: this.formulariosService.getFormulariosConConteo(),
      usuarios: this.usuariosService.getUsuarios()
    }).pipe(
      map(({ formularios, usuarios }) => {
        // Validar que los datos sean arrays antes de usar métodos de array
        const formulariosArray = Array.isArray(formularios) ? formularios : [];
        const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
        
        // Formularios por mes (últimos 6 meses)
        const formulariosPorMes = this.calcularFormulariosPorMes(formulariosArray);
        
        // Formularios por estado
        const estadosCount = formulariosArray.reduce((acc: { [key: string]: number }, f: any) => {
          acc[f.estado] = (acc[f.estado] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        
        const postulacionesPorEstado = Object.entries(estadosCount).map(([estado, cantidad]) => ({
          estado: estado === 'Activo' ? 'Activas' : 'Inactivas',
          cantidad
        }));

        // Usuarios por rol
        const rolesCount = usuariosArray.reduce((acc: { [key: string]: number }, u: any) => {
          acc[u.rol] = (acc[u.rol] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        
        const usuariosPorRol = Object.entries(rolesCount).map(([rol, cantidad]) => ({
          rol: this.formatearNombreRol(rol),
          cantidad
        }));

        // Postulantes por formulario
        const postulantesPorFormulario = formulariosArray.map(formulario => ({
          formulario: formulario.cargo,
          cantidad: formulario.cantidadPostulantes || 0
        })).sort((a, b) => b.cantidad - a.cantidad);

        // Tendencia de formularios y usuarios (últimos 7 días)
        const tendenciaPostulaciones = this.calcularTendencia(formulariosArray, usuariosArray);

        return {
          postulacionesPorMes: formulariosPorMes,
          postulacionesPorEstado,
          usuariosPorRol,
          postulantesPorFormulario,
          tendenciaPostulaciones
        };
      })
    );
  }

  // Métodos auxiliares
  private calcularFormulariosPorMes(formularios: any[]): { mes: string; cantidad: number }[] {
    const meses = [];
    const ahora = new Date();
    
    // Validar que el parámetro sea un array
    const formulariosArray = Array.isArray(formularios) ? formularios : [];
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      
      const cantidad = formulariosArray.filter((f: any) => {
        if (!f.fechaCreacion && !f.fechaInicio) return false;
        const fechaForm = new Date(f.fechaCreacion || f.fechaInicio);
        return fechaForm.getMonth() === fecha.getMonth() && 
               fechaForm.getFullYear() === fecha.getFullYear();
      }).length;
      
      meses.push({ mes: nombreMes, cantidad });
    }
    
    return meses;
  }

  private calcularTendencia(formularios: any[], usuarios: any[]): { fecha: string; postulaciones: number; usuarios: number }[] {
    const tendencia = [];
    const ahora = new Date();
    
    // Validar que los parámetros sean arrays
    const formulariosArray = Array.isArray(formularios) ? formularios : [];
    const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
      const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      
      const formulariosDia = formulariosArray.filter((f: any) => {
        if (!f.fechaCreacion && !f.fechaInicio) return false;
        const fechaForm = new Date(f.fechaCreacion || f.fechaInicio);
        return fechaForm.toDateString() === fecha.toDateString();
      }).length;
      
      const usuariosDia = usuariosArray.filter((u: any) => {
        if (!u.fechaCreacion) return false;
        const fechaUser = new Date(u.fechaCreacion);
        return fechaUser.toDateString() === fecha.toDateString();
      }).length;
      
      tendencia.push({
        fecha: fechaStr,
        postulaciones: formulariosDia,
        usuarios: usuariosDia
      });
    }
    
    return tendencia;
  }

  private formatearNombreRol(rol: string): string {
    const roles: { [key: string]: string } = {
      'admin': 'Administradores',
      'user': 'Usuarios',
      'postulante': 'Postulantes'
    };
    return roles[rol] || rol;
  }
} 