import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormulariosService } from '../../../servicios/formularios.service';
import { Formulario } from '../../../interfaces/formulario.interface';

@Component({
  selector: 'app-descargas',
  templateUrl: './descargas.component.html',
  styleUrls: ['./descargas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DescargasComponent implements OnInit {
  postulaciones: Formulario[] = [];
  postulacionesFiltradas: Formulario[] = [];
  seleccionadas: { [key: number]: boolean } = {};
  terminoBusqueda: string = '';
  fechaInicio: Date | null = null;
  fechaTermino: Date | null = null;
  cargando: boolean = false;
  error: string = '';

  constructor(
    private formulariosService: FormulariosService
  ) {}

  ngOnInit(): void {
    this.cargarPostulaciones();
  }

  cargarPostulaciones(): void {
    this.cargando = true;
    this.formulariosService.getFormularios().subscribe({
      next: (data) => {
        this.postulaciones = data;
        this.postulacionesFiltradas = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar postulaciones', error);
        this.error = 'Error al cargar postulaciones';
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
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.fechaInicio = null;
    this.fechaTermino = null;
    this.postulacionesFiltradas = this.postulaciones;
  }

  toggleSeleccion(postulacion: Formulario): void {
    if (!postulacion.id) return;
    this.seleccionadas[postulacion.id] = !this.seleccionadas[postulacion.id];
  }

  seleccionarTodas(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.postulacionesFiltradas.forEach(p => {
      if (p.id) {
        this.seleccionadas[p.id] = isChecked;
      }
    });
  }

  haySeleccionadas(): boolean {
    return Object.values(this.seleccionadas).some(value => value);
  }

  obtenerIdsSeleccionados(): number[] {
    return Object.entries(this.seleccionadas)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => parseInt(id));
  }

  descargarDocumentos(): void {
    const idsSeleccionados = this.obtenerIdsSeleccionados();
    
    if (idsSeleccionados.length === 0) {
      this.error = 'Por favor, seleccione al menos una postulación';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.cargando = true;
    this.error = '';
    
    this.formulariosService.descargarDocumentos(idsSeleccionados).subscribe({
      next: (blob) => {
        this.cargando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documentos_postulaciones.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al descargar documentos', error);
        this.error = 'Error al descargar documentos';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  formatearFecha(fecha: string | Date): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES');
  }
} 