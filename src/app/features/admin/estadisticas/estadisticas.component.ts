import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormulariosService } from '../../../servicios/formularios.service';
import { PostulacionesService } from '../../../servicios/postulaciones.service';
import { UsuariosService } from '../../../servicios/usuarios.service';
import { EstadisticasAdminService } from '../../../servicios/estadisticas-admin.service';
import { Formulario } from '../../../interfaces/formulario.interface';
import { EstadisticaPostulacion } from '../../../interfaces/estadisticas.interface';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

// Registramos todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class EstadisticasComponent implements OnInit {
  postulaciones: EstadisticaPostulacion[] = [];
  postulacionesFiltradas: EstadisticaPostulacion[] = [];
  terminoBusqueda: string = '';
  fechaInicio: Date | null = null;
  fechaTermino: Date | null = null;
  cargando: boolean = false;
  error: string = '';
  
  // Variables para los gráficos
  graficoEdad: Chart | null = null;
  graficoProfesionales: Chart | null = null;
  
  // Propiedad para verificar si estamos en el navegador
  isBrowser: boolean = false;
  
  // Inyectamos PLATFORM_ID para verificar si estamos en el navegador
  private platformId = inject(PLATFORM_ID);

  constructor(
    private formulariosService: FormulariosService,
    private postulacionesService: PostulacionesService,
    private usuariosService: UsuariosService,
    private estadisticasAdminService: EstadisticasAdminService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.cargarPostulaciones();
  }

  cargarPostulaciones(): void {
    this.cargando = true;
    // Usar el nuevo método con conteo real de postulantes
    this.estadisticasAdminService.getFormulariosConConteoEstadisticas().subscribe({
      next: (data) => {
        // Convertir formularios con conteo a EstadisticaPostulacion
        this.postulaciones = data.map(p => ({
          ...p,
          cantidadPostulantes: p.cantidadPostulantes // Usar el conteo real
        }));
        this.postulacionesFiltradas = [...this.postulaciones];
        this.cargando = false;
        
        // Solo inicializamos gráficos en el navegador
        if (this.isBrowser) {
          setTimeout(() => {
            this.inicializarGraficos();
          }, 500);
        }
      },
      error: (error) => {
        console.error('Error al cargar formularios con conteo', error);
        this.error = 'Error al cargar datos de estadísticas';
        this.cargando = false;
      }
    });
  }

  filtrarPostulaciones(): void {
    this.postulacionesFiltradas = this.postulaciones.filter(p => {
      // Filtrar por término de búsqueda
      const coincideTermino = !this.terminoBusqueda || 
        p.cargo.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      // Filtrar por fecha de inicio
      const fechaInicioPostulacion = new Date(p.fechaInicio);
      const coincideFechaInicio = !this.fechaInicio || 
        fechaInicioPostulacion >= this.fechaInicio;
      
      // Filtrar por fecha de término
      const fechaTerminoPostulacion = new Date(p.fechaTermino);
      const coincideFechaTermino = !this.fechaTermino || 
        fechaTerminoPostulacion <= this.fechaTermino;
      
      return coincideTermino && coincideFechaInicio && coincideFechaTermino;
    });
    
    // Actualizar gráficos después de filtrar
    this.actualizarGraficos();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.fechaInicio = null;
    this.fechaTermino = null;
    this.postulacionesFiltradas = [...this.postulaciones];
    this.actualizarGraficos();
  }

  formatearFecha(fecha: string | Date): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES');
  }
  
  inicializarGraficos(): void {
    this.inicializarGraficoEdad();
    this.inicializarGraficoProfesionales();
  }
  
  inicializarGraficoEdad(): void {
    const ctx = document.getElementById('graficoEdad') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Simulamos datos por edad
    const datos = {
      labels: ['20-30', '31-40', '41-50'],
      datasets: [
        {
          label: 'Postulantes por rango de edad',
          data: [
            Math.floor(Math.random() * 30) + 10,
            Math.floor(Math.random() * 40) + 15,
            Math.floor(Math.random() * 25) + 5
          ],
          backgroundColor: [
            'rgba(102, 46, 143, 0.6)',
            'rgba(138, 75, 170, 0.6)',
            'rgba(52, 183, 72, 0.6)'
          ],
          borderColor: [
            '#662e8f',
            '#8a4baa',
            '#34b748'
          ],
          borderWidth: 1
        }
      ]
    };
    
    this.graficoEdad = new Chart(ctx, {
      type: 'bar',
      data: datos,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  inicializarGraficoProfesionales(): void {
    const ctx = document.getElementById('graficoProfesionales') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Simulamos datos de profesionales vs militares
    const datos = {
      labels: ['Profesionales', 'Militares'],
      datasets: [
        {
          data: [60, 40],
          backgroundColor: [
            'rgba(102, 46, 143, 0.6)',
            'rgba(52, 183, 72, 0.6)'
          ],
          borderColor: [
            '#662e8f',
            '#34b748'
          ],
          borderWidth: 1
        }
      ]
    };
    
    this.graficoProfesionales = new Chart(ctx, {
      type: 'pie',
      data: datos,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
  
  actualizarGraficos(): void {
    // Solo actualizamos gráficos en el navegador
    if (!this.isBrowser) return;
    
    // Para una aplicación real, aquí actualizaríamos los datos de los gráficos 
    // basados en las postulaciones filtradas
    if (this.graficoEdad) {
      // Actualizar datos del gráfico de edad
      this.graficoEdad.data.datasets[0].data = [
        Math.floor(Math.random() * 30) + 10,
        Math.floor(Math.random() * 40) + 15,
        Math.floor(Math.random() * 25) + 5
      ];
      this.graficoEdad.update();
    }
    
    if (this.graficoProfesionales) {
      // Actualizar datos del gráfico circular
      this.graficoProfesionales.data.datasets[0].data = [
        Math.floor(Math.random() * 40) + 40,
        Math.floor(Math.random() * 40) + 20
      ];
      this.graficoProfesionales.update();
    }
  }
} 