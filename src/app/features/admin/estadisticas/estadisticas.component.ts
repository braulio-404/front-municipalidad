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
  fechaInicio: string = '';
  fechaTermino: string = '';
  cargando: boolean = false;
  error: string = '';
  
  // Variables para los gráficos
  graficoEdad: Chart | null = null; // Gráfico de postulantes por cargo
  graficoProfesionales: Chart | null = null; // Gráfico de postulantes por mes
  
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
      
      // Función auxiliar para convertir fecha a objeto Date normalizado
      const convertirFecha = (fecha: string | Date): Date => {
        if (typeof fecha === 'string') {
          const fechaStr = fecha.includes('T') ? fecha.split('T')[0] : fecha;
          const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
          return new Date(year, month - 1, day);
        } else {
          const fechaObj = new Date(fecha);
          return new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());
        }
      };
      
      // Filtrar por fecha de inicio (si está definida)
      let cumpleFechaInicio = true;
      if (this.fechaInicio && p.fechaInicio) {
        const fechaInicioForm = convertirFecha(p.fechaInicio);
        const fechaInicioFiltro = convertirFecha(this.fechaInicio);
        // La postulación debe iniciar en o después de la fecha del filtro
        cumpleFechaInicio = fechaInicioForm >= fechaInicioFiltro;
      }
      
      // Filtrar por fecha de término (si está definida)
      let cumpleFechaTermino = true;
      if (this.fechaTermino && p.fechaTermino) {
        const fechaTerminoForm = convertirFecha(p.fechaTermino);
        const fechaTerminoFiltro = convertirFecha(this.fechaTermino);
        // La postulación debe terminar en o antes de la fecha del filtro
        cumpleFechaTermino = fechaTerminoForm <= fechaTerminoFiltro;
      }
      
      return coincideTermino && cumpleFechaInicio && cumpleFechaTermino;
    });
    
    // Actualizar gráficos después de filtrar
    this.actualizarGraficos();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.fechaInicio = '';
    this.fechaTermino = '';
    this.postulacionesFiltradas = [...this.postulaciones];
    this.actualizarGraficos();
  }

  formatearFecha(fecha: string | Date): string {
    try {
      if (!fecha) return '';
      
      let fechaObj: Date;
      
      if (typeof fecha === 'string') {
        // Si viene en formato ISO, extraer solo la parte de la fecha (YYYY-MM-DD)
        const fechaStr = fecha.includes('T') ? fecha.split('T')[0] : fecha;
        const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
        // Crear fecha en zona horaria local para evitar problemas de UTC
        fechaObj = new Date(year, month - 1, day);
      } else {
        fechaObj = new Date(fecha);
      }
      
      // Formatear como dd/MM/yyyy
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaObj.getFullYear();
      
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error, fecha);
      return '';
    }
  }

  obtenerDatosPorCargo(): {cargo: string, cantidad: number}[] {
    const datosPorCargo: {[key: string]: number} = {};
    
    this.postulacionesFiltradas.forEach(postulacion => {
      if (datosPorCargo[postulacion.cargo]) {
        datosPorCargo[postulacion.cargo] += postulacion.cantidadPostulantes;
      } else {
        datosPorCargo[postulacion.cargo] = postulacion.cantidadPostulantes;
      }
    });
    
    return Object.entries(datosPorCargo).map(([cargo, cantidad]) => ({
      cargo,
      cantidad
    }));
  }

  obtenerDatosPorMes(): {mes: string, cantidad: number}[] {
    const datosPorMes: {[key: string]: number} = {};
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    this.postulacionesFiltradas.forEach(postulacion => {
      const fecha = new Date(postulacion.fechaInicio);
      const mesNumero = fecha.getMonth();
      const mesNombre = meses[mesNumero];
      
      if (datosPorMes[mesNombre]) {
        datosPorMes[mesNombre] += postulacion.cantidadPostulantes;
      } else {
        datosPorMes[mesNombre] = postulacion.cantidadPostulantes;
      }
    });
    
    // Filtrar solo los meses que tienen datos
    return Object.entries(datosPorMes)
      .filter(([mes, cantidad]) => cantidad > 0)
      .map(([mes, cantidad]) => ({
        mes,
        cantidad
      }));
  }
  
  inicializarGraficos(): void {
    this.inicializarGraficoEdad();
    this.inicializarGraficoProfesionales();
  }
  
  inicializarGraficoEdad(): void {
    const ctx = document.getElementById('graficoEdad') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Obtener datos reales de postulantes por cargo
    const datosPorCargo = this.obtenerDatosPorCargo();
    
    const datos = {
      labels: datosPorCargo.map(item => item.cargo),
      datasets: [
        {
          label: 'Postulantes por cargo',
          data: datosPorCargo.map(item => item.cantidad),
          backgroundColor: 'rgba(102, 46, 143, 0.6)',
          borderColor: '#662e8f',
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
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} postulantes`;
              }
            }
          }
        }
      }
    });
  }
  
  inicializarGraficoProfesionales(): void {
    const ctx = document.getElementById('graficoProfesionales') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Obtener datos reales de postulantes por mes
    const datosPorMes = this.obtenerDatosPorMes();
    
    const datos = {
      labels: datosPorMes.map((item: {mes: string, cantidad: number}) => item.mes),
      datasets: [
        {
          label: 'Postulantes por mes',
          data: datosPorMes.map((item: {mes: string, cantidad: number}) => item.cantidad),
          backgroundColor: [
            'rgba(102, 46, 143, 0.6)',
            'rgba(138, 75, 170, 0.6)',
            'rgba(52, 183, 72, 0.6)',
            'rgba(255, 193, 7, 0.6)',
            'rgba(220, 53, 69, 0.6)',
            'rgba(32, 201, 151, 0.6)'
          ],
          borderColor: [
            '#662e8f',
            '#8a4baa',
            '#34b748',
            '#ffc107',
            '#dc3545',
            '#20c997'
          ],
          borderWidth: 1
        }
      ]
    };
    
    this.graficoProfesionales = new Chart(ctx, {
      type: 'doughnut',
      data: datos,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.label}: ${context.parsed} postulantes`;
              }
            }
          }
        }
      }
    });
  }
  
  actualizarGraficos(): void {
    // Solo actualizamos gráficos en el navegador
    if (!this.isBrowser) return;
    
    // Actualizar gráfico de postulantes por cargo
    if (this.graficoEdad) {
      const datosPorCargo = this.obtenerDatosPorCargo();
      this.graficoEdad.data.labels = datosPorCargo.map(item => item.cargo);
      this.graficoEdad.data.datasets[0].data = datosPorCargo.map(item => item.cantidad);
      this.graficoEdad.update();
    }
    
    // Actualizar gráfico de postulantes por mes
    if (this.graficoProfesionales) {
      const datosPorMes = this.obtenerDatosPorMes();
      this.graficoProfesionales.data.labels = datosPorMes.map(item => item.mes);
      this.graficoProfesionales.data.datasets[0].data = datosPorMes.map(item => item.cantidad);
      this.graficoProfesionales.update();
    }
  }
} 