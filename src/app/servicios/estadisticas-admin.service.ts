import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
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

  constructor(
    protected override http: HttpClient,
    private formulariosService: FormulariosService,
    private postulacionesService: PostulacionesService,
    private usuariosService: UsuariosService
  ) {
    super(http);
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
      postulaciones: this.postulacionesService.getPostulaciones().pipe(
        catchError(error => {
          console.warn('Error al obtener postulaciones:', error);
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
      map(({ formularios, postulaciones, usuarios }) => {
        // Validar que los datos sean arrays antes de usar métodos de array
        const formulariosArray = Array.isArray(formularios) ? formularios : [];
        const postulacionesArray = Array.isArray(postulaciones) ? postulaciones : [];
        const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
        
        const postulacionesActivas = postulacionesArray.filter((p: Postulacion) => p.estado === 'activa').length;
        const postulacionesVencidas = postulacionesArray.filter((p: Postulacion) => p.estado === 'vencida').length;
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
          totalPostulaciones: postulacionesArray.length,
          totalPostulantes, // Nuevo campo con total de postulantes
          postulacionesActivas,
          postulacionesVencidas,
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
      formularios: this.formulariosService.getFormulariosConConteo(), // Usar método con conteo
      postulaciones: this.postulacionesService.getPostulaciones(),
      usuarios: this.usuariosService.getUsuarios()
    }).pipe(
      map(({ formularios, postulaciones, usuarios }) => {
        // Validar que los datos sean arrays antes de usar métodos de array
        const formulariosArray = Array.isArray(formularios) ? formularios : [];
        const postulacionesArray = Array.isArray(postulaciones) ? postulaciones : [];
        const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
        
        // Postulaciones por mes (últimos 6 meses)
        const postulacionesPorMes = this.calcularPostulacionesPorMes(postulacionesArray);
        
        // Postulaciones por estado
        const estadosCount = postulacionesArray.reduce((acc: { [key: string]: number }, p: Postulacion) => {
          acc[p.estado] = (acc[p.estado] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        
        const postulacionesPorEstado = Object.entries(estadosCount).map(([estado, cantidad]) => ({
          estado: estado === 'activa' ? 'Activas' : 'Vencidas',
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
        })).sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad descendente

        // Tendencia de postulaciones y usuarios (últimos 7 días)
        const tendenciaPostulaciones = this.calcularTendencia(postulacionesArray, usuariosArray);

        return {
          postulacionesPorMes,
          postulacionesPorEstado,
          usuariosPorRol,
          postulantesPorFormulario, // Nuevo gráfico con postulantes por formulario
          tendenciaPostulaciones
        };
      })
    );
  }

  // Obtener actividad reciente simulada
  getActividadReciente(limite: number = 10): Observable<ActividadReciente[]> {
    // En una implementación real, esto vendría del backend
    // Por ahora simulamos datos
    const actividadSimulada: ActividadReciente[] = [
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

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(actividadSimulada.slice(0, limite));
        observer.complete();
      }, 500);
    });
  }

  // Métodos auxiliares
  private calcularPostulacionesPorMes(postulaciones: Postulacion[]): { mes: string; cantidad: number }[] {
    const meses = [];
    const ahora = new Date();
    
    // Validar que el parámetro sea un array
    const postulacionesArray = Array.isArray(postulaciones) ? postulaciones : [];
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      
      const cantidad = postulacionesArray.filter((p: Postulacion) => {
        if (!p.fechaCreacion) return false;
        const fechaPost = new Date(p.fechaCreacion);
        return fechaPost.getMonth() === fecha.getMonth() && 
               fechaPost.getFullYear() === fecha.getFullYear();
      }).length;
      
      meses.push({ mes: nombreMes, cantidad });
    }
    
    return meses;
  }

  private calcularTendencia(postulaciones: Postulacion[], usuarios: any[]): { fecha: string; postulaciones: number; usuarios: number }[] {
    const tendencia = [];
    const ahora = new Date();
    
    // Validar que los parámetros sean arrays
    const postulacionesArray = Array.isArray(postulaciones) ? postulaciones : [];
    const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
      const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      
      const postulacionesDia = postulacionesArray.filter((p: Postulacion) => {
        if (!p.fechaCreacion) return false;
        const fechaPost = new Date(p.fechaCreacion);
        return fechaPost.toDateString() === fecha.toDateString();
      }).length;
      
      const usuariosDia = usuariosArray.filter((u: any) => {
        if (!u.fechaCreacion) return false;
        const fechaUser = new Date(u.fechaCreacion);
        return fechaUser.toDateString() === fecha.toDateString();
      }).length;
      
      tendencia.push({
        fecha: fechaStr,
        postulaciones: postulacionesDia,
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