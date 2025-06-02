import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FormulariosService } from '../../../servicios/formularios.service';
import { Formulario } from '../../../interfaces/formulario.interface';
import { PostulacionFormComponent } from './postulacion-form/postulacion-form.component';

@Component({
  selector: 'app-formularios',
  templateUrl: './formularios.component.html',
  styleUrls: ['./formularios.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PostulacionFormComponent
  ]
})
export class FormulariosComponent implements OnInit {
  formularios: Formulario[] = [];
  cargoPostulacion: string = '';
  fechaInicio: Date | null = null;
  fechaTermino: Date | null = null;
  estadoSeleccionado: string = '';
  
  estadosDisponibles: string[] = ['Activo', 'Inactivo', 'Todos'];

  // Variables para gestionar el formulario de postulación
  mostrarFormulario: boolean = false;
  modoFormulario: 'nuevo' | 'editar' | 'ver' = 'nuevo';
  formularioSeleccionadoId: number | null = null;

  constructor(
    private formulariosService: FormulariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFormularios();
  }

  cargarFormularios(): void {
    this.formulariosService.getFormularios().subscribe({
      next: (data) => {
        this.formularios = data;
      },
      error: (error) => {
        console.error('Error al cargar formularios:', error);
      }
    });
  }

  filtrarFormularios(): void {
    // Aquí implementar la lógica de filtrado cuando se conecte con el backend
    console.log('Filtrando con:', {
      cargo: this.cargoPostulacion,
      fechaInicio: this.fechaInicio,
      fechaTermino: this.fechaTermino,
      estado: this.estadoSeleccionado
    });
  }

  crearFormulario(): void {
    this.modoFormulario = 'nuevo';
    this.formularioSeleccionadoId = null;
    this.mostrarFormulario = true;
  }

  verDetalleFormulario(id: number): void {
    this.modoFormulario = 'ver';
    this.formularioSeleccionadoId = id;
    this.mostrarFormulario = true;
  }

  editarFormulario(id: number): void {
    this.modoFormulario = 'editar';
    this.formularioSeleccionadoId = id;
    this.mostrarFormulario = true;
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

  onFormularioGuardado(): void {
    this.mostrarFormulario = false;
    this.cargarFormularios();
  }

  onCancelarFormulario(): void {
    this.mostrarFormulario = false;
  }
} 