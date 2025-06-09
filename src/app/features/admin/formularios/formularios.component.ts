import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FormulariosService } from '../../../servicios/formularios.service';
import { RequisitosService } from '../../../servicios/requisitos.service';
import { Formulario } from '../../../interfaces/formulario.interface';
import { Requisito } from '../../../interfaces/requisito.interface';
import { RequisitoSeleccionado } from '../../../interfaces/postulante.interface';
@Component({
  selector: 'app-formularios',
  templateUrl: './formularios.component.html',
  styleUrls: ['./formularios.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FormulariosComponent implements OnInit {
  formularios: Formulario[] = [];
  formulariosOriginales: Formulario[] = []; // Array original sin filtrar
  cargoPostulacion: string = '';
  fechaInicio: string = ''; // Cambiar a string para el input date
  fechaTermino: string = ''; // Cambiar a string para el input date
  estadoSeleccionado: string = '';
  
  estadosDisponibles: string[] = ['Activo', 'Inactivo'];
  
  // Cache para requisitos para evitar llamadas repetidas
  requisitosCache: { [id: number]: Requisito } = {};

  // Variables removidas - ahora se usa navegación por rutas

  constructor(
    private formulariosService: FormulariosService,
    private requisitosService: RequisitosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFormularios();
    this.cargarRequisitos();
  }

  cargarFormularios(): void {
    this.formulariosService.getFormularios().subscribe({
      next: (data) => {
        // Ordenar por ID descendente (más recientes primero)
        const formularioOrdenados = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.formulariosOriginales = [...formularioOrdenados]; // Guardar copia original ordenada
        this.formularios = [...formularioOrdenados]; // Mostrar todos inicialmente ordenados
      },
      error: (error) => {
        console.error('Error al cargar formularios:', error);
      }
    });
  }

  cargarRequisitos(): void {
    this.requisitosService.getRequisitos().subscribe({
      next: (requisitos) => {
        // Crear cache de requisitos por ID para fácil acceso
        requisitos.forEach(req => {
          this.requisitosCache[req.id] = req;
        });
      },
      error: (error) => {
        console.error('Error al cargar requisitos:', error);
      }
    });
  }

  obtenerNombresRequisitos(requisitos: number[] | RequisitoSeleccionado[]): string {
    if (!requisitos || requisitos.length === 0) {
      return 'Sin requisitos';
    }
    
    // Si es un array de números (IDs)
    if (typeof requisitos[0] === 'number') {
      const nombres = (requisitos as number[])
        .map(id => this.requisitosCache[id]?.nombre || `Requisito ${id}`)
        .join(', ');
      return nombres || 'Sin requisitos';
    }
    
    // Si es un array de objetos RequisitoSeleccionado
    const nombres = (requisitos as RequisitoSeleccionado[])
      .map(req => req.nombre || `Requisito ${req.id}`)
      .join(', ');
    
    return nombres || 'Sin requisitos';
  }

  filtrarFormularios(): void {
    let formulariosFiltrados = [...this.formulariosOriginales];

    // Filtrar por cargo de postulación
    if (this.cargoPostulacion.trim()) {
      formulariosFiltrados = formulariosFiltrados.filter(form => 
        form.cargo?.toLowerCase().includes(this.cargoPostulacion.toLowerCase().trim())
      );
    }

    // Filtrar por fecha de inicio
    if (this.fechaInicio) {
      const fechaInicioFiltro = new Date(this.fechaInicio);
      formulariosFiltrados = formulariosFiltrados.filter(form => {
        if (!form.fechaInicio) return false;
        const fechaForm = new Date(form.fechaInicio);
        return fechaForm >= fechaInicioFiltro;
      });
    }

    // Filtrar por fecha de término
    if (this.fechaTermino) {
      const fechaTerminoFiltro = new Date(this.fechaTermino);
      formulariosFiltrados = formulariosFiltrados.filter(form => {
        if (!form.fechaTermino) return false;
        const fechaForm = new Date(form.fechaTermino);
        return fechaForm <= fechaTerminoFiltro;
      });
    }

    // Filtrar por estado
    if (this.estadoSeleccionado) {
      formulariosFiltrados = formulariosFiltrados.filter(form => 
        form.estado === this.estadoSeleccionado
      );
    }

    // Ordenar los resultados filtrados por ID descendente
    this.formularios = formulariosFiltrados.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    console.log('Filtros aplicados:', {
      cargo: this.cargoPostulacion,
      fechaInicio: this.fechaInicio,
      fechaTermino: this.fechaTermino,
      estado: this.estadoSeleccionado,
      resultados: formulariosFiltrados.length
    });
  }

  limpiarFiltros(): void {
    this.cargoPostulacion = '';
    this.fechaInicio = '';
    this.fechaTermino = '';
    this.estadoSeleccionado = '';
    // Restaurar formularios originales (ya están ordenados por ID descendente)
    this.formularios = [...this.formulariosOriginales];
  }

  crearFormulario(): void {
    this.router.navigate(['/admin/formularios/nuevo']);
  }

  verDetalleFormulario(id: number): void {
    this.router.navigate(['/admin/formularios/ver', id]);
  }

  editarFormulario(id: number): void {
    this.router.navigate(['/admin/formularios/editar', id]);
  }

  eliminarFormulario(id: number): void {
    if (confirm('¿Está seguro que desea eliminar esta postulación?')) {
      this.formulariosService.eliminarFormulario(id).subscribe({
        next: () => {
          this.cargarFormularios();
        },
        error: (error) => {
          console.error('Error al eliminar el formulario:', error);
        }
      });
    }
  }

  // Métodos removidos - ahora se usa navegación por rutas
} 