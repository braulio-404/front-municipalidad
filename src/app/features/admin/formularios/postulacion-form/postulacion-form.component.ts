import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FormulariosService } from '../../../../servicios/formularios.service';
import { RequisitosService } from '../../../../servicios/requisitos.service';
import { Formulario } from '../../../../interfaces/formulario.interface';
import { Requisito } from '../../../../interfaces/requisito.interface';

@Component({
  selector: 'app-postulacion-form',
  templateUrl: './postulacion-form.component.html',
  styleUrls: ['./postulacion-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PostulacionFormComponent implements OnInit, OnDestroy {
  @Input() modo: 'nuevo' | 'editar' | 'ver' = 'nuevo';
  @Input() formularioId: number | null = null;
  @Output() formularioGuardado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  formularioForm!: FormGroup;
  cargando = false;
  error = '';
  
  // Para paginación y búsqueda
  requisitosCompletos: Requisito[] = [];
  requisitosFiltrados: Requisito[] = [];
  requisitosVisibles: Requisito[] = [];
  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;
  terminoBusqueda = '';
  private terminoBusquedaSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];
  
  // Mapeo dinámico de requisitos a controles del formulario
  private requisitosControlMap: { [key: number]: string } = {};
  
  // Opciones de estado para la postulación
  estadosPostulacion: { valor: 'Activo' | 'Inactivo', texto: string }[] = [
    { valor: 'Activo', texto: 'Activo' },
    { valor: 'Inactivo', texto: 'Inactivo' }
  ];

  constructor(
    private fb: FormBuilder,
    private formulariosService: FormulariosService,
    private requisitosService: RequisitosService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.configurarBusqueda();
    this.cargarRequisitos();
    
    if (this.formularioId && this.modo !== 'nuevo') {
      this.cargarDatosFormulario();
    }
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private inicializarFormulario(): void {
    this.formularioForm = this.fb.group({
      cargo: ['', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaTermino: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      requisitos: ['', [Validators.required]],
      estado: ['Activo', [Validators.required]],
      requisitosSeleccionados: this.fb.group({})
    });

    if (this.modo === 'ver') {
      this.formularioForm.disable();
    }
  }

  private configurarBusqueda(): void {
    // Configurar observable para la búsqueda con debounce
    const busquedaSub = this.terminoBusquedaSubject.pipe(
      debounceTime(300), // Esperar 300ms para evitar búsquedas excesivas
      distinctUntilChanged() // Solo procesar si el término ha cambiado
    ).subscribe(termino => {
      this.ejecutarBusqueda(termino);
    });
    
    this.subscriptions.push(busquedaSub);
  }

  private cargarRequisitos(): void {
    this.cargando = true;
    this.requisitosService.getRequisitos().subscribe({
      next: (requisitos) => {
        this.requisitosCompletos = requisitos;
        this.requisitosFiltrados = [...requisitos];
        this.configurarRequisitosFormGroup(requisitos);
        this.calcularTotalPaginas();
        this.actualizarRequisitosVisibles();
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los requisitos';
        console.error('Error al cargar requisitos:', error);
        this.cargando = false;
      }
    });
  }

  private configurarRequisitosFormGroup(requisitos: Requisito[]): void {
    const requisitosGroup = this.formularioForm.get('requisitosSeleccionados') as FormGroup;
    
    requisitos.forEach(requisito => {
      const controlName = `req_${requisito.id}`;
      this.requisitosControlMap[requisito.id] = controlName;
      requisitosGroup.addControl(controlName, this.fb.control(false));
    });

    // Suscripción a cambios en los requisitos seleccionados para reordenar
    const valueChangesSub = requisitosGroup.valueChanges.subscribe(() => {
      this.ordenarRequisitos();
      this.actualizarRequisitosVisibles();
    });
    
    this.subscriptions.push(valueChangesSub);
  }

  private calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.requisitosFiltrados.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  private ordenarRequisitos(): void {
    // Ordenar los requisitos: primero los marcados, luego los no marcados
    this.requisitosFiltrados.sort((a, b) => {
      const controlA = this.getFormControlName(a);
      const controlB = this.getFormControlName(b);
      
      const isCheckedA = this.formularioForm.get('requisitosSeleccionados')?.get(controlA)?.value || false;
      const isCheckedB = this.formularioForm.get('requisitosSeleccionados')?.get(controlB)?.value || false;
      
      if (isCheckedA && !isCheckedB) return -1;
      if (!isCheckedA && isCheckedB) return 1;
      return 0;
    });
  }

  private actualizarRequisitosVisibles(): void {
    const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
    this.requisitosVisibles = this.requisitosFiltrados.slice(
      startIndex, 
      startIndex + this.itemsPorPagina
    );
  }

  buscarRequisitos(): void {
    // Emitir el nuevo término de búsqueda al subject para el debounce
    this.terminoBusquedaSubject.next(this.terminoBusqueda);
  }

  private ejecutarBusqueda(termino: string): void {
    if (!termino.trim()) {
      this.requisitosFiltrados = [...this.requisitosCompletos];
    } else {
      this.requisitosService.buscarRequisitos(termino).subscribe(resultados => {
        this.requisitosFiltrados = resultados;
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.ordenarRequisitos();
        this.actualizarRequisitosVisibles();
      });
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarRequisitosVisibles();
    }
  }

  toggleRequisito(requisito: Requisito): void {
    if (this.modo === 'ver') return;
    
    const controlName = this.getFormControlName(requisito);
    const control = this.formularioForm.get('requisitosSeleccionados')?.get(controlName);
    
    if (control) {
      // Primero marcamos/desmarcamos el requisito
      control.setValue(!control.value);
      
      // Si estábamos filtrando, limpiamos el filtro
      if (this.terminoBusqueda.trim()) {
        // Guardar el ID del requisito que acabamos de marcar
        const requisitoId = requisito.id;
        
        // Limpiar el filtro y resetear todo
        this.terminoBusqueda = '';
        this.requisitosFiltrados = [...this.requisitosCompletos];
        
        // Ordenar para que el requisito marcado aparezca primero si corresponde
        this.ordenarRequisitos();
        
        // Resetear a la primera página
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.actualizarRequisitosVisibles();
      }
    }
  }

  isRequisitoSeleccionado(requisito: Requisito): boolean {
    const controlName = this.getFormControlName(requisito);
    return this.formularioForm.get('requisitosSeleccionados')?.get(controlName)?.value || false;
  }

  private cargarDatosFormulario(): void {
    this.cargando = true;
    // Asumimos que el servicio tiene un método para obtener un formulario por ID
    this.formulariosService.getFormularios().subscribe({
      next: (formularios) => {
        const formulario = formularios.find(f => f.id === this.formularioId);
        if (formulario) {
          this.formularioForm.patchValue({
            cargo: formulario.cargo,
            fechaInicio: this.formatearFecha(formulario.fechaInicio),
            fechaTermino: this.formatearFecha(formulario.fechaTermino),
            estado: formulario.estado,
            // Aquí añadir más campos cuando existan en el backend
          });
        } else {
          this.error = 'No se encontró la postulación solicitada';
        }
        this.cargando = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar los datos de la postulación';
        this.cargando = false;
        console.error('Error al cargar formulario:', error);
      }
    });
  }

  private formatearFecha(fecha: Date | string): string {
    if (fecha instanceof Date) {
      return fecha.toISOString().substring(0, 10);
    }
    // Asumimos que viene en formato ISO desde el backend
    return typeof fecha === 'string' ? fecha.substring(0, 10) : '';
  }

  guardarFormulario(): void {
    if (this.formularioForm.invalid) {
      this.formularioForm.markAllAsTouched();
      return;
    }

    const formularioData = this.prepararDatosFormulario();
    this.cargando = true;

    if (this.modo === 'nuevo') {
      this.formulariosService.crearFormulario(formularioData).subscribe({
        next: () => this.finalizarGuardado(),
        error: (error: any) => this.manejarError(error)
      });
    } else if (this.modo === 'editar') {
      this.formulariosService.actualizarFormulario(this.formularioId!, formularioData).subscribe({
        next: () => this.finalizarGuardado(),
        error: (error: any) => this.manejarError(error)
      });
    }
  }

  private prepararDatosFormulario(): Formulario {
    const formValues = this.formularioForm.value;
    return {
      cargo: formValues.cargo,
      fechaInicio: formValues.fechaInicio,
      fechaTermino: formValues.fechaTermino,
      estado: formValues.estado
    };
  }

  private finalizarGuardado(): void {
    this.cargando = false;
    this.formularioGuardado.emit();
  }

  private manejarError(error: any): void {
    this.cargando = false;
    this.error = 'Error al guardar la postulación';
    console.error('Error al guardar formulario:', error);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  getTitulo(): string {
    switch (this.modo) {
      case 'nuevo': return 'Creación Postulación';
      case 'editar': return 'Edición Postulación';
      case 'ver': return 'Detalle Postulación';
      default: return 'Postulación';
    }
  }
  
  getFormControlName(requisito: Requisito): string {
    return this.requisitosControlMap[requisito.id] || '';
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.requisitosFiltrados = [...this.requisitosCompletos];
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.ordenarRequisitos();
    this.actualizarRequisitosVisibles();
  }
} 