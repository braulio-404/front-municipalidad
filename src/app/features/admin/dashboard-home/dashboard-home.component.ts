import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormulariosService } from '../../../servicios/formularios.service';
import { PostulacionesService, Postulacion } from '../../../servicios/postulaciones.service';
import { UsuariosService } from '../../../servicios/usuarios.service';
import { EstadisticasAdminService } from '../../../servicios/estadisticas-admin.service';
import { ActividadReciente } from '../../../interfaces/estadisticas.interface';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  template: `
    <div class="dashboard-main">
      <div class="dashboard-cards">
        <!-- Tarjeta de Gestión de Formularios -->
        <div class="dashboard-card" (click)="navigateTo('formularios')">
          <div class="card-icon">
            <i class="material-icons">description</i>
          </div>
          <div class="card-info">
            <h3>Gestión de Formularios</h3>
            <p>Administre los formularios y solicitudes</p>
          </div>
        </div>
        
        <!-- Tarjeta de Gestión de Datos -->
        <div class="dashboard-card" (click)="navigateTo('datos')">
          <div class="card-icon">
            <i class="material-icons">storage</i>
          </div>
          <div class="card-info">
            <h3>Gestión de Datos</h3>
            <p>Administre los datos del sistema</p>
          </div>
        </div>
        
        <!-- Tarjeta de Descarga de Información -->
        <div class="dashboard-card" (click)="navigateTo('descargas')">
          <div class="card-icon">
            <i class="material-icons">cloud_download</i>
          </div>
          <div class="card-info">
            <h3>Descarga de Información</h3>
            <p>Descargue reportes e información</p>
          </div>
        </div>
        
        <!-- Tarjeta de Estadísticas -->
        <div class="dashboard-card" (click)="navigateTo('estadisticas')">
          <div class="card-icon">
            <i class="material-icons">bar_chart</i>
          </div>
          <div class="card-info">
            <h3>Estadísticas</h3>
            <p>Visualice estadísticas de postulaciones</p>
          </div>
        </div>
      </div>
      
      <!-- Sección de estadísticas rápidas -->
      <div class="quick-stats">
        <div class="stats-header">
          <h2>Estadísticas Rápidas</h2>
          <button class="btn-actualizar" (click)="actualizarEstadisticas()" [disabled]="cargandoEstadisticas" title="Actualizar estadísticas">
            <i class="material-icons" [class.rotating]="cargandoEstadisticas">refresh</i>
          </button>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">description</i>
            </div>
            <div class="stat-content">
              <h3>{{ totalFormularios }}</h3>
              <p>Total Formularios</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">assignment</i>
            </div>
            <div class="stat-content">
              <h3>{{ postulacionesActivas }}</h3>
              <p>Formularios Activos</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">people</i>
            </div>
            <div class="stat-content">
              <h3>{{ totalUsuarios }}</h3>
              <p>Total Usuarios</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">person_add</i>
            </div>
            <div class="stat-content">
              <h3>{{ totalPostulantes }}</h3>
              <p>Total Postulantes</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección de actividad reciente -->
      <div class="recent-activity">
        <div class="activity-header">
          <h2>Actividad Reciente</h2>
          <div class="activity-buttons">
            <button class="btn-clear" (click)="limpiarActividades()" title="Limpiar actividades (botón temporal)">
              <i class="material-icons">clear_all</i>
              Limpiar
            </button>
            <button class="btn-actualizar-actividad" (click)="actualizarActividad()" [disabled]="cargandoActividad" title="Actualizar actividad">
              <i class="material-icons" [class.rotating]="cargandoActividad">refresh</i>
            </button>
          </div>
        </div>
        <div class="activity-list" *ngIf="!cargandoActividad; else loadingTemplate">
          <div class="activity-item" *ngFor="let actividad of actividadReciente">
            <div class="activity-icon">
              <i class="material-icons">{{ actividad.icono }}</i>
            </div>
            <div class="activity-text">
              <p><strong>{{ actividad.titulo }}</strong> - {{ actividad.descripcion }}</p>
              <span class="activity-time">{{ formatearTiempo(actividad.fecha) }}</span>
            </div>
          </div>
          
          <div class="activity-item" *ngIf="actividadReciente.length === 0">
            <div class="activity-icon">
              <i class="material-icons">info</i>
            </div>
            <div class="activity-text">
              <p>No hay actividad reciente</p>
            </div>
          </div>
        </div>
        
        <ng-template #loadingTemplate>
          <div class="loading-spinner">
            <p>Cargando actividad reciente...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-main {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    // Tarjetas del dashboard
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .dashboard-card {
      background-color: var(--background-card);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: var(--transition-normal);
      border-left: 4px solid var(--primary-color);
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-xl);
        border-left-color: var(--accent-color);
      }
      
      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: var(--border-radius-lg);
        background-color: var(--primary-color-very-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-lg);
        
        i {
          font-size: 28px;
          color: var(--primary-color);
        }
      }
      
      .card-info {
        flex: 1;
        
        h3 {
          margin: 0 0 5px;
          color: var(--primary-color);
          font-size: 1.1rem;
        }
        
        p {
          margin: 0;
          color: var(--text-color-light);
          font-size: 0.9rem;
        }
      }
      
      &:hover .card-icon {
        background-color: var(--primary-color);
        
        i {
          color: white;
        }
      }
    }
    
    // Sección de estadísticas rápidas
    .quick-stats {
      background-color: var(--background-card);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      
      h2 {
        color: var(--primary-color);
        font-size: 1.3rem;
        margin: 0;
        position: relative;
        padding-bottom: var(--spacing-sm);
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--accent-color);
          border-radius: var(--border-radius-sm);
        }
      }
    }

    .btn-actualizar, .btn-actualizar-actividad {
      background: none;
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      border-radius: var(--border-radius-md);
      padding: 8px 12px;
      cursor: pointer;
      transition: var(--transition-normal);
      margin-left: 8px;
      
      &:hover:not(:disabled) {
        background-color: var(--primary-color);
        color: white;
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      i {
        font-size: 18px;
      }
    }

    .btn-clear {
      background: none;
      border: 1px solid var(--error-color);
      color: var(--error-color);
      border-radius: var(--border-radius-md);
      padding: 8px 12px;
      cursor: pointer;
      transition: var(--transition-normal);
      margin-left: 8px;
      
      &:hover:not(:disabled) {
        background-color: var(--error-color);
        color: white;
      }
      
      i {
        font-size: 18px;
      }
    }

    .activity-buttons {
      display: flex;
      align-items: center;
    }

    .rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .stat-card {
      background-color: var(--background-card);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      border-left: 4px solid var(--primary-color);
      transition: transform 0.2s;
      box-shadow: var(--shadow-sm);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: var(--border-radius-md);
        background-color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-md);
        
        i {
          font-size: 24px;
          color: white;
        }
      }
      
      .stat-content {
        flex: 1;
        
        h3 {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary-color);
          margin: 0;
          line-height: 1;
        }
        
        p {
          margin: 5px 0 0;
          color: var(--text-color-light);
          font-size: 0.9rem;
        }
      }
    }
    
    // Sección de actividad reciente
    .recent-activity {
      background-color: var(--background-card);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--spacing-xl);
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      
      h2 {
        color: var(--primary-color);
        font-size: 1.3rem;
        margin: 0;
        position: relative;
        padding-bottom: var(--spacing-sm);
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--accent-color);
          border-radius: var(--border-radius-sm);
        }
      }
    }
    
    .loading-spinner {
      text-align: center;
      padding: var(--spacing-lg);
      color: var(--text-color-light);
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    
    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      background-color: var(--primary-color-very-light);
      transition: var(--transition-normal);
      border-left: 3px solid var(--primary-color-border);
      
      &:hover {
        background-color: var(--primary-color-very-light);
        transform: translateX(5px);
        border-left-color: var(--primary-color);
      }
      
      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--border-radius-full);
        background-color: rgba(var(--primary-color-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-md);
        flex-shrink: 0;
        
        i {
          font-size: 20px;
          color: var(--primary-color);
        }
      }
      
      .activity-text {
        flex: 1;
        
        p {
          margin: 0 0 5px;
          color: var(--text-color);
          font-size: 0.95rem;
          
          strong {
            color: var(--primary-color);
            font-weight: 600;
          }
        }
        
        .activity-time {
          font-size: 0.8rem;
          color: var(--text-color-muted);
        }
      }
    }
    
    // Estilos responsivos
    @media (max-width: 992px) {
      .dashboard-cards {
        grid-template-columns: 1fr;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  totalFormularios: number = 0;
  postulacionesActivas: number = 0;
  totalUsuarios: number = 0;
  totalPostulantes: number = 0;
  cargandoActividad: boolean = false;
  cargandoEstadisticas: boolean = false;
  
  actividadReciente: ActividadReciente[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private formulariosService: FormulariosService,
    private postulacionesService: PostulacionesService,
    private usuariosService: UsuariosService,
    private estadisticasAdminService: EstadisticasAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Inicializando Dashboard Home');
    this.cargarEstadisticas();
    this.cargarActividadReciente();
    
    // Suscripción directa al BehaviorSubject para actualizaciones inmediatas
    const actividadSub = this.estadisticasAdminService.getActividadReciente(5).subscribe({
      next: (actividad) => {
        console.log('🔔 Actualización inmediata de actividad recibida:', actividad.length, 'elementos');
        const actividadAnterior = JSON.stringify(this.actividadReciente);
        this.actividadReciente = Array.isArray(actividad) ? [...actividad] : [];
        
        // Solo forzar detección si realmente cambió algo
        if (JSON.stringify(this.actividadReciente) !== actividadAnterior) {
          console.log('🔄 Contenido cambió, actualizando vista');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Error en suscripción directa de actividad:', error);
      }
    });
    
    // Configurar actualización automática cada 10 segundos para la actividad reciente (más frecuente para pruebas)
    const timerSub = timer(0, 10000).subscribe(() => {
      console.log('⏰ Timer de actualización automática ejecutándose');
      this.cargarActividadReciente();
    });
    
    this.subscriptions.push(actividadSub, timerSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    
    this.estadisticasAdminService.getEstadisticasGenerales().subscribe({
      next: (estadisticas) => {
        if (estadisticas) {
          this.totalFormularios = estadisticas.totalFormularios || 0;
          this.postulacionesActivas = estadisticas.postulacionesActivas || 0;
          this.totalUsuarios = estadisticas.totalUsuarios || 0;
          this.totalPostulantes = estadisticas.totalPostulantes || 0;
        } else {
          this.resetearEstadisticas();
        }
        this.cargandoEstadisticas = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas generales:', error);
        this.resetearEstadisticas();
        this.cargandoEstadisticas = false;
      }
    });
  }

  private resetearEstadisticas(): void {
    this.totalFormularios = 0;
    this.postulacionesActivas = 0;
    this.totalUsuarios = 0;
    this.totalPostulantes = 0;
  }

  cargarActividadReciente(): void {
    if (!this.cargandoActividad) {
      console.log('🔄 Cargando actividad reciente...');
      this.cargandoActividad = true;
      
      this.estadisticasAdminService.getActividadReciente(5).subscribe({
        next: (actividad) => {
          console.log('📨 Actividad reciente recibida:', actividad);
          const actividadAnterior = this.actividadReciente.length;
          this.actividadReciente = Array.isArray(actividad) ? [...actividad] : [];
          console.log('✅ Actividad reciente actualizada:', this.actividadReciente.length, 'elementos');
          
          // Si hay cambios, forzar detección de cambios
          if (this.actividadReciente.length !== actividadAnterior || 
              JSON.stringify(this.actividadReciente) !== JSON.stringify(actividad)) {
            console.log('🔄 Forzando detección de cambios en el template');
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          }
          
          this.cargandoActividad = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar actividad reciente:', error);
          this.actividadReciente = [];
          this.cargandoActividad = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('⚠️ Ya se está cargando la actividad reciente, omitiendo...');
    }
  }

  actualizarEstadisticas(): void {
    this.cargarEstadisticas();
  }

  actualizarActividad(): void {
    console.log('🔄 Actualización manual de actividad solicitada');
    this.cargarActividadReciente();
  }

  limpiarActividades(): void {
    console.log('🧹 Limpiando actividades...');
    
    if (confirm('¿Estás seguro de que quieres limpiar todas las actividades? Esta acción no se puede deshacer.')) {
      this.estadisticasAdminService.limpiarActividades();
      this.actividadReciente = [];
      this.cdr.detectChanges();
      console.log('✅ Actividades limpiadas correctamente');
    }
  }

  navigateTo(route: string): void {
    this.router.navigate(['admin', route]);
  }

  formatearTiempo(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) {
      return 'Hace un momento';
    } else if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else {
      return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    }
  }
} 