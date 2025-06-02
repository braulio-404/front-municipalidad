import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
      
      <!-- Sección de actividad reciente -->
      <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">
              <i class="material-icons">notification_important</i>
            </div>
            <div class="activity-text">
              <p><strong>Nueva solicitud</strong> - Se ha recibido una nueva solicitud de postulación</p>
              <span class="activity-time">Hace 5 minutos</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">
              <i class="material-icons">person_add</i>
            </div>
            <div class="activity-text">
              <p><strong>Nuevo usuario</strong> - Se ha registrado un nuevo usuario en el sistema</p>
              <span class="activity-time">Hace 30 minutos</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">
              <i class="material-icons">update</i>
            </div>
            <div class="activity-text">
              <p><strong>Actualización</strong> - Se han actualizado los datos de perfil de usuario</p>
              <span class="activity-time">Hace 1 hora</span>
            </div>
          </div>
        </div>
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
export class DashboardHomeComponent {
  constructor(private router: Router) {}
  
  navigateTo(route: string): void {
    this.router.navigate(['admin', route]);
  }
} 