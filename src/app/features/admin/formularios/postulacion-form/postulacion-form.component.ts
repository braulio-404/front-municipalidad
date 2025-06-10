import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { FormulariosService } from '../../../../servicios/formularios.service';
import { RequisitosService } from '../../../../servicios/requisitos.service';
import { EstadisticasAdminService } from '../../../../servicios/estadisticas-admin.service';
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
  modo: 'nuevo' | 'editar' | 'ver' = 'nuevo';
  formularioId: number | null = null;

  formularioForm!: FormGroup;
  cargando = false;
  error = '';
  mensajeInfo = '';
  
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
    private requisitosService: RequisitosService,
    private estadisticasAdminService: EstadisticasAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Obtener modo y ID desde la ruta
    this.modo = this.route.snapshot.data['modo'] || 'nuevo';
    const id = this.route.snapshot.paramMap.get('id');
    this.formularioId = id ? parseInt(id, 10) : null;

    this.inicializarFormulario();
    this.configurarBusqueda();
    this.cargarRequisitos();
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

    // Configurar listener para cambios en el estado
    this.configurarCambiosEstado();

    if (this.modo === 'ver') {
      this.formularioForm.disable();
    }
  }

  /**
   * Configura el listener para detectar cambios en el estado de la postulación
   * y validar las fechas cuando se selecciona "Activo"
   */
  private configurarCambiosEstado(): void {
    const estadoControl = this.formularioForm.get('estado');
    const fechaTerminoControl = this.formularioForm.get('fechaTermino');
    
    if (estadoControl && fechaTerminoControl) {
      // Listener para limpiar errores cuando se cambian las fechas o estado
      const estadoChangesSub = estadoControl.valueChanges.subscribe(() => {
        this.limpiarErroresFecha();
      });
      
      const fechaChangesSub = fechaTerminoControl.valueChanges.subscribe(() => {
        this.limpiarErroresFecha();
      });
      
      this.subscriptions.push(estadoChangesSub, fechaChangesSub);
    }
  }

  /**
   * Limpia los errores de validación de fecha cuando el usuario modifica los campos
   */
  private limpiarErroresFecha(): void {
    // Solo limpiar el error específico de fecha de término, mantener otros errores
    if (this.error && this.error.includes('fecha de término')) {
      this.error = '';
    }
    this.mensajeInfo = '';
  }

  /**
   * Valida que la fecha de término sea válida para el estado "Activo"
   * Retorna true si es válida, false si hay error
   */
  private validarFechaTerminoParaEstadoActivo(): boolean {
    const estadoControl = this.formularioForm.get('estado');
    const fechaTerminoControl = this.formularioForm.get('fechaTermino');
    
    if (!estadoControl || !fechaTerminoControl) return true;
    
    // Solo validar si el estado es "Activo"
    if (estadoControl.value !== 'Activo') return true;
    
    const fechaTermino = fechaTerminoControl.value;
    if (!fechaTermino) return true; // La validación required se encarga de esto
    
    const fechaTerminoDate = new Date(fechaTermino);
    const fechaActual = new Date();
    
    // Resetear horas para comparar solo fechas
    fechaActual.setHours(0, 0, 0, 0);
    fechaTerminoDate.setHours(0, 0, 0, 0);
    
    // Si la fecha de término es menor a hoy, es inválida
    if (fechaTerminoDate < fechaActual) {
      this.error = 'No se puede activar una postulación con fecha de término anterior a hoy. Por favor, seleccione una fecha de término futura.';
      return false;
    }
    
    return true;
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
    
    if (this.modo === 'nuevo') {
      // Para formularios nuevos: mostrar solo requisitos activos de la DB
      this.requisitosService.getRequisitosActivos().subscribe({
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
    } else {
      // Para formularios existentes (ver/editar): cargar datos del formulario y todos los requisitos
      this.cargarDatosFormulario();
    }
  }

  private configurarRequisitosFormGroup(requisitos: Requisito[]): void {
    const requisitosGroup = this.formularioForm.get('requisitosSeleccionados') as FormGroup;
    
    requisitos.forEach(requisito => {
      const controlName = `req_${requisito.id}`;
      this.requisitosControlMap[requisito.id] = controlName;
      
      // Solo agregar el control si no existe
      if (!requisitosGroup.get(controlName)) {
        requisitosGroup.addControl(controlName, this.fb.control(false));
      }
    });

    // Configurar suscripción solo una vez
    this.configurarSuscripcionCambios();
  }

  private configurarSuscripcionCambios(): void {
    // Solo configurar si no hay suscripciones previas del form
    const existeSuscripcionForm = this.subscriptions.some(sub => sub.constructor.name === 'FormValueChangesSub');
    
    if (!existeSuscripcionForm) {
      const requisitosGroup = this.formularioForm.get('requisitosSeleccionados') as FormGroup;
      const valueChangesSub = requisitosGroup.valueChanges.subscribe(() => {
        this.ordenarRequisitos();
        this.actualizarRequisitosVisibles();
      });
      
      this.subscriptions.push(valueChangesSub);
    }
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
      this.paginaActual = 1;
      this.calcularTotalPaginas();
      this.ordenarRequisitos();
      this.actualizarRequisitosVisibles();
    } else {
      // Búsqueda local con coincidencia parcial (like) y en lowercase para todos los modos
      const terminoLower = termino.toLowerCase();
      this.requisitosFiltrados = this.requisitosCompletos.filter(req =>
        req.nombre.toLowerCase().includes(terminoLower) ||
        (req.descripcion && req.descripcion.toLowerCase().includes(terminoLower))
      );
      
      this.paginaActual = 1;
      this.calcularTotalPaginas();
      this.ordenarRequisitos();
      this.actualizarRequisitosVisibles();
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
            descripcion: formulario.descripcion || '',
            requisitos: formulario.requisitos || '',
            fechaInicio: this.formatearFecha(formulario.fechaInicio),
            fechaTermino: this.formatearFecha(formulario.fechaTermino),
            estado: formulario.estado
          });
          
          // Si está en modo 'ver', cargar solo los requisitos seleccionados
          // Si está en modo 'editar', cargar todos los requisitos disponibles
          if (this.modo === 'ver') {
            this.cargarRequisitosSeleccionados(formulario.requisitosSeleccionados || []);
          } else {
            this.cargarTodosLosRequisitosConSeleccionados(formulario.requisitosSeleccionados || []);
          }
        } else {
          this.error = 'No se encontró la postulación solicitada';
          this.cargando = false;
        }
      },
      error: (error: any) => {
        this.error = 'Error al cargar los datos de la postulación';
        this.cargando = false;
        console.error('Error al cargar formulario:', error);
      }
    });
  }

  private cargarTodosLosRequisitosConSeleccionados(requisitosData: any[]): void {
    // Obtener todos los requisitos disponibles en la DB
    const requisitosObservable = this.modo === 'ver' 
      ? this.requisitosService.getRequisitos() // En modo ver, mostrar todos (activos e inactivos)
      : this.requisitosService.getRequisitosActivos(); // En modo editar, solo los activos

    requisitosObservable.subscribe({
      next: (todosLosRequisitos) => {
        this.requisitosCompletos = todosLosRequisitos;
        this.requisitosFiltrados = [...todosLosRequisitos];
        this.configurarRequisitosFormGroup(todosLosRequisitos);
        
        // Marcar los requisitos que ya están seleccionados
        this.marcarRequisitosSeleccionados(requisitosData);
        
        this.calcularTotalPaginas();
        this.ordenarRequisitos();
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

  private marcarRequisitosSeleccionados(requisitosData: any[]): void {
    if (!requisitosData || requisitosData.length === 0) {
      return;
    }

    // Extraer los IDs de los requisitos seleccionados
    let idsSeleccionados: number[] = [];
    
    if (requisitosData.length > 0 && typeof requisitosData[0] === 'object' && requisitosData[0].hasOwnProperty('id')) {
      // Los datos vienen como objetos completos, extraer los IDs
      idsSeleccionados = requisitosData.map((req: any) => req.id);
    } else {
      // Los datos son solo IDs
      idsSeleccionados = requisitosData
        .map(id => typeof id === 'number' ? id : parseInt(id))
        .filter(id => !isNaN(id));
    }

    // Marcar los controles correspondientes como seleccionados
    const requisitosGroup = this.formularioForm.get('requisitosSeleccionados') as FormGroup;
    idsSeleccionados.forEach(requisitoId => {
      const controlName = this.requisitosControlMap[requisitoId];
      if (controlName && requisitosGroup.get(controlName)) {
        requisitosGroup.get(controlName)?.setValue(true);
      }
    });
  }

  private remarcarRequisitosSeleccionados(): void {
    // Obtener los requisitos que ya estaban marcados antes de la búsqueda
    const requisitosGroup = this.formularioForm.get('requisitosSeleccionados') as FormGroup;
    const controlesExistentes = Object.keys(requisitosGroup.controls);
    
    // Mantener el estado de los requisitos que ya estaban marcados
    const estadosActuales: { [key: string]: boolean } = {};
    controlesExistentes.forEach(controlName => {
      const control = requisitosGroup.get(controlName);
      if (control) {
        estadosActuales[controlName] = control.value;
      }
    });

    // Restaurar los estados después de la nueva configuración
    setTimeout(() => {
      Object.keys(estadosActuales).forEach(controlName => {
        const control = requisitosGroup.get(controlName);
        if (control && estadosActuales[controlName]) {
          control.setValue(true);
        }
      });
    });
  }

  private cargarRequisitosSeleccionados(requisitosData: any[]): void {
    if (!requisitosData || requisitosData.length === 0) {
      // Si no hay requisitos seleccionados, mostrar lista vacía
      this.requisitosCompletos = [];
      this.requisitosFiltrados = [];
      this.configurarRequisitosFormGroup([]);
      this.calcularTotalPaginas();
      this.actualizarRequisitosVisibles();
      this.cargando = false;
      return;
    }

    // Determinar si son objetos completos o solo IDs
    let requisitosSeleccionados: Requisito[] = [];
    
    if (requisitosData.length > 0 && typeof requisitosData[0] === 'object' && requisitosData[0].hasOwnProperty('nombre')) {
      // Los datos ya vienen como objetos completos desde el servicio
      requisitosSeleccionados = requisitosData as Requisito[];
      this.procesarRequisitosSeleccionados(requisitosSeleccionados);
    } else {
      // Los datos son solo IDs, necesitamos obtener los objetos completos
      const idsNumericos = requisitosData
        .map(id => typeof id === 'number' ? id : parseInt(id))
        .filter(id => !isNaN(id));

      if (idsNumericos.length === 0) {
        this.requisitosCompletos = [];
        this.requisitosFiltrados = [];
        this.configurarRequisitosFormGroup([]);
        this.calcularTotalPaginas();
        this.actualizarRequisitosVisibles();
        this.cargando = false;
        return;
      }

      // Obtener todos los requisitos para filtrar los seleccionados
      this.requisitosService.getRequisitos().subscribe({
        next: (todosLosRequisitos) => {
          // Filtrar solo los requisitos que están en la lista de seleccionados
          requisitosSeleccionados = todosLosRequisitos.filter(req => 
            idsNumericos.includes(req.id)
          );
          this.procesarRequisitosSeleccionados(requisitosSeleccionados);
        },
        error: (error) => {
          this.error = 'Error al cargar los requisitos seleccionados';
          console.error('Error al cargar requisitos seleccionados:', error);
          this.cargando = false;
        }
      });
    }
  }

  private procesarRequisitosSeleccionados(requisitosSeleccionados: Requisito[]): void {
    this.requisitosCompletos = requisitosSeleccionados;
    this.requisitosFiltrados = [...requisitosSeleccionados];
    this.configurarRequisitosFormGroup(requisitosSeleccionados);
    
    // Marcar todos como seleccionados
    const requisitosGroup = this.formularioForm.get('requisitosSeleccionados') as FormGroup;
    requisitosSeleccionados.forEach((requisito) => {
      const controlName = this.requisitosControlMap[requisito.id];
      if (controlName && requisitosGroup.get(controlName)) {
        requisitosGroup.get(controlName)?.setValue(true);
      }
    });

    this.calcularTotalPaginas();
    this.ordenarRequisitos();
    this.actualizarRequisitosVisibles();
    this.cargando = false;
  }

  private formatearFecha(fecha: Date | string): string {
    try {
      if (!fecha) return '';
      
      if (fecha instanceof Date) {
        // Formatear fecha object a YYYY-MM-DD sin conversión de zona horaria
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const day = fecha.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      if (typeof fecha === 'string') {
        // Si viene en formato ISO, extraer solo la parte de la fecha (YYYY-MM-DD)
        return fecha.includes('T') ? fecha.split('T')[0] : fecha;
      }
      
      return '';
    } catch (error) {
      console.error('Error al formatear fecha:', error, fecha);
      return '';
    }
  }

  guardarFormulario(): void {
    if (this.formularioForm.invalid) {
      this.formularioForm.markAllAsTouched();
      return;
    }

    // Limpiar mensajes antes de guardar
    this.mensajeInfo = '';
    this.error = '';

    // Validar fecha de término para estado "Activo"
    if (!this.validarFechaTerminoParaEstadoActivo()) {
      return; // No continuar si la validación falla
    }

    const formularioData = this.prepararDatosFormulario();
    this.cargando = true;

    console.log('💾 Guardando formulario en modo:', this.modo);
    console.log('📋 Datos del formulario:', formularioData);

    if (this.modo === 'nuevo') {
      this.formulariosService.crearFormulario(formularioData).subscribe({
        next: (formularioCreado) => {
          console.log('✅ Formulario creado exitosamente:', formularioCreado);
          
          // Registrar actividad de creación de formulario
          console.log('📝 Registrando actividad de creación de formulario...');
          this.estadisticasAdminService.registrarActividad({
            tipo: 'formulario',
            titulo: 'Nuevo formulario creado',
            descripcion: `Se creó el formulario para ${formularioCreado.cargo}`,
            icono: 'description',
            usuario: 'Admin Sistema'
          });
          console.log('✅ Actividad registrada correctamente');
          
          this.finalizarGuardado();
        },
        error: (error: any) => {
          console.error('❌ Error al crear formulario:', error);
          this.manejarError(error);
        }
      });
    } else if (this.modo === 'editar') {
      this.formulariosService.actualizarFormulario(this.formularioId!, formularioData).subscribe({
        next: (formularioActualizado) => {
          console.log('✅ Formulario actualizado exitosamente:', formularioActualizado);
          
          // Registrar actividad de actualización de formulario
          console.log('📝 Registrando actividad de actualización de formulario...');
          this.estadisticasAdminService.registrarActividad({
            tipo: 'formulario',
            titulo: 'Formulario actualizado',
            descripcion: `Se actualizó el formulario para ${formularioActualizado.cargo}`,
            icono: 'edit',
            usuario: 'Admin Sistema'
          });
          console.log('✅ Actividad registrada correctamente');
          
          this.finalizarGuardado();
        },
        error: (error: any) => {
          console.error('❌ Error al actualizar formulario:', error);
          this.manejarError(error);
        }
      });
    }
  }

  private prepararDatosFormulario(): any {
    const formValues = this.formularioForm.value;
    
    // Obtener requisitos seleccionados
    const requisitosSeleccionados: number[] = [];
    const requisitosGroup = formValues.requisitosSeleccionados;
    if (requisitosGroup) {
      Object.keys(requisitosGroup).forEach(controlName => {
        if (requisitosGroup[controlName]) {
          // Extraer el ID del requisito del nombre del control (req_123 -> 123)
          const requisitoId = parseInt(controlName.replace('req_', ''));
          if (!isNaN(requisitoId)) {
            requisitosSeleccionados.push(requisitoId);
          }
        }
      });
    }
    
    return {
      cargo: formValues.cargo,
      descripcion: formValues.descripcion,
      requisitos: formValues.requisitos,
      fechaInicio: formValues.fechaInicio, // Ya está en formato string
      fechaTermino: formValues.fechaTermino, // Ya está en formato string
      estado: formValues.estado,
      requisitosSeleccionados: requisitosSeleccionados
    };
  }

  private finalizarGuardado(): void {
    this.cargando = false;
    // Navegar de vuelta a la lista de formularios
    this.router.navigate(['/admin/formularios']);
  }

  private manejarError(error: any): void {
    this.cargando = false;
    this.error = 'Error al guardar la postulación';
    this.mensajeInfo = ''; // Limpiar mensaje informativo en caso de error
    console.error('Error al guardar formulario:', error);
  }

  onCancelar(): void {
    // Limpiar mensajes antes de salir
    this.mensajeInfo = '';
    this.error = '';
    // Usar Location.back() para simular el botón atrás del navegador
    this.location.back();
  }

  onVolver(): void {
    // Método para el botón volver, usando la misma funcionalidad
    this.location.back();
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