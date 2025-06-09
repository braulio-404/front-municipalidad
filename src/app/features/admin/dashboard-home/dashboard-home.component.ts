import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormulariosService } from '../../../servicios/formularios.service';
import { PostulacionesService, Postulacion } from '../../../servicios/postulaciones.service';
import { UsuariosService } from '../../../servicios/usuarios.service';
import { EstadisticasAdminService } from '../../../servicios/estadisticas-admin.service';
import { ActividadReciente } from '../../../interfaces/estadisticas.interface';

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
        <h2>Estadísticas Rápidas</h2>
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
              <p>Postulaciones Activas</p>
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
        <h2>Actividad Reciente</h2>
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
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      padding: 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      border-left: 4px solid #9c27b0;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        border-left-color: #34b748;
      }
      
      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background-color: #f8f1ff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        
        i {
          font-size: 28px;
          color: #9c27b0;
        }
      }
      
      .card-info {
        flex: 1;
        
        h3 {
          margin: 0 0 5px;
          color: #9c27b0;
          font-size: 1.1rem;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
      }
      
      &:hover .card-icon {
        background-color: #9c27b0;
        
        i {
          color: white;
        }
      }
    }
    
    // Sección de estadísticas rápidas
    .quick-stats {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      padding: 25px;
      margin-bottom: 30px;
      
      h2 {
        color: #9c27b0;
        font-size: 1.3rem;
        margin: 0 0 20px;
        position: relative;
        padding-bottom: 10px;
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: #34b748;
          border-radius: 3px;
        }
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .stat-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      border-left: 4px solid #9c27b0;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        background-color: #9c27b0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        
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
          color: #9c27b0;
          margin: 0;
          line-height: 1;
        }
        
        p {
          margin: 5px 0 0;
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
    
    // Sección de actividad reciente
    .recent-activity {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      padding: 25px;
      
      h2 {
        color: #9c27b0;
        font-size: 1.3rem;
        margin: 0 0 20px;
        position: relative;
        padding-bottom: 10px;
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: #34b748;
          border-radius: 3px;
        }
      }
    }
    
    .loading-spinner {
      text-align: center;
      padding: 20px;
      color: #666;
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      border-radius: 8px;
      background-color: #f8f1ff;
      transition: all 0.3s;
      
      &:hover {
        background-color: #f8f1ff;
        transform: translateX(5px);
      }
      
      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(#9c27b0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        flex-shrink: 0;
        
        i {
          font-size: 20px;
          color: #9c27b0;
        }
      }
      
      .activity-text {
        flex: 1;
        
        p {
          margin: 0 0 5px;
          color: #444;
          font-size: 0.95rem;
          
          strong {
            color: #9c27b0;
            font-weight: 600;
          }
        }
        
        .activity-time {
          font-size: 0.8rem;
          color: #777;
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
export class DashboardHomeComponent implements OnInit {
  totalFormularios: number = 0;
  postulacionesActivas: number = 0;
  totalUsuarios: number = 0;
  totalPostulantes: number = 0; // Nuevo campo para mostrar total de postulantes
  cargandoActividad: boolean = true;
  
  actividadReciente: ActividadReciente[] = [];

  constructor(
    private router: Router,
    private formulariosService: FormulariosService,
    private postulacionesService: PostulacionesService,
    private usuariosService: UsuariosService,
    private estadisticasAdminService: EstadisticasAdminService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarActividadReciente();
  }

  cargarEstadisticas(): void {
    // Usar el servicio de estadísticas optimizado para obtener todos los datos
    this.estadisticasAdminService.getEstadisticasGenerales().subscribe({
      next: (estadisticas) => {
        // Validar que estadisticas no sea null o undefined
        if (estadisticas) {
          this.totalFormularios = estadisticas.totalFormularios || 0;
          this.postulacionesActivas = estadisticas.postulacionesActivas || 0;
          this.totalUsuarios = estadisticas.totalUsuarios || 0;
          this.totalPostulantes = estadisticas.totalPostulantes || 0;
        } else {
          this.resetearEstadisticas();
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas generales:', error);
        this.resetearEstadisticas();
      }
    });
  }

  private resetearEstadisticas(): void {
    // Valores por defecto en caso de error
    this.totalFormularios = 0;
    this.postulacionesActivas = 0;
    this.totalUsuarios = 0;
    this.totalPostulantes = 0;
  }

  cargarActividadReciente(): void {
    this.cargandoActividad = true;
    
    this.estadisticasAdminService.getActividadReciente(3).subscribe({
      next: (actividad) => {
        // Validar que actividad sea un array
        this.actividadReciente = Array.isArray(actividad) ? actividad : [];
        this.cargandoActividad = false;
      },
      error: (error) => {
        console.error('Error al cargar actividad reciente:', error);
        this.actividadReciente = [];
        this.cargandoActividad = false;
      }
    });
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