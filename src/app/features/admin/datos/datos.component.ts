import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { RequisitosService } from '../../../servicios/requisitos.service';
import { Requisito } from '../../../interfaces/requisito.interface';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class DatosComponent implements OnInit {
  // Control de pestañas y vistas
  tipoSeleccionado: 'requisitos' | 'categorias' | 'estados' = 'requisitos';
  mostrarFormulario: boolean = false;
  modoFormulario: 'nuevo' | 'editar' | 'ver' = 'nuevo';

  // Datos de requisitos
  requisitos: Requisito[] = [];
  requisitosFiltrados: Requisito[] = [];
  requisitoActual: Partial<Requisito> = this.inicializarRequisito();

  // Filtros
  filtroNombre: string = '';
  filtroTipo: string = '';
  filtroEstado: string = '';

  // Propiedades para paginación
  registrosPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  requisitosPaginados: Requisito[] = [];

  constructor(
    private requisitosService: RequisitosService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en una ruta de formulario
    const modo = this.route.snapshot.data['modo'];
    const tipo = this.route.snapshot.data['tipo'];
    
    if (modo && tipo === 'requisito') {
      this.modoFormulario = modo;
      this.mostrarFormulario = true;
      
      if (modo === 'editar' || modo === 'ver') {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.cargarRequisitoParaFormulario(parseInt(id, 10));
        }
      } else {
        this.requisitoActual = this.inicializarRequisito();
      }
    } else {
      this.cargarRequisitos();
    }
  }

  // Métodos de inicialización
  inicializarRequisito(): Partial<Requisito> {
    return {
      nombre: '',
      descripcion: '',
      tipo: 'documento',
      obligatorio: false,
      activo: true
    };
  }

  // Métodos de carga de datos
  cargarRequisitos(): void {
    this.requisitosService.getRequisitos().subscribe({
      next: (data) => {
        this.requisitos = data;
        this.requisitosFiltrados = [...data];
        
        // Inicializar paginación
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.actualizarRequisitosPaginados();
      },
      error: (error) => {
        console.error('Error al cargar requisitos:', error);
      }
    });
  }

  // Métodos de gestión de pestañas
  seleccionarTipo(tipo: 'requisitos' | 'categorias' | 'estados'): void {
    this.tipoSeleccionado = tipo;
    if (tipo === 'requisitos') {
      this.cargarRequisitos();
    }
    // Aquí se pueden agregar más casos para otros tipos de datos
  }

  // Métodos de filtrado
  filtrarRequisitos(): void {
    let requisitosFiltrados = [...this.requisitos];

    // Filtrar por nombre (insensible a mayúsculas/minúsculas)
    if (this.filtroNombre && this.filtroNombre.trim() !== '') {
      const nombreBusqueda = this.filtroNombre.toLowerCase().trim();
      requisitosFiltrados = requisitosFiltrados.filter(requisito => 
        requisito.nombre.toLowerCase().includes(nombreBusqueda)
      );
    }

    // Filtrar por tipo
    if (this.filtroTipo && this.filtroTipo !== '') {
      requisitosFiltrados = requisitosFiltrados.filter(requisito => 
        requisito.tipo === this.filtroTipo
      );
    }

    // Filtrar por estado
    if (this.filtroEstado && this.filtroEstado !== '') {
      const esActivo = this.filtroEstado === 'activo';
      requisitosFiltrados = requisitosFiltrados.filter(requisito => 
        requisito.activo === esActivo
      );
    }

    this.requisitosFiltrados = requisitosFiltrados;
    
    // Actualizar paginación después de filtrar
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarRequisitosPaginados();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.cargarRequisitos(); // Recarga todos los requisitos sin filtros
    
    // Resetear paginación
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarRequisitosPaginados();
  }

  /**
   * Calcula el total de páginas basado en la cantidad de registros
   */
  private calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.requisitosFiltrados.length / this.registrosPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas);
    if (this.totalPaginas === 0) {
      this.paginaActual = 1;
      this.totalPaginas = 1;
    }
  }

  /**
   * Actualiza los requisitos mostrados según la página actual
   */
  private actualizarRequisitosPaginados(): void {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.requisitosPaginados = this.requisitosFiltrados.slice(inicio, fin);
  }

  /**
   * Cambia la página actual y actualiza los requisitos mostrados
   */
  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.actualizarRequisitosPaginados();
    }
  }

  /**
   * Cambia la cantidad de registros por página y actualiza la vista
   */
  cambiarRegistrosPorPagina(): void {
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarRequisitosPaginados();
  }

  /**
   * Genera un array con los números de página que se mostrarán
   */
  obtenerPaginas(): number[] {
    const totalBotones = 5;
    const paginas: number[] = [];
    
    if (this.totalPaginas <= totalBotones) {
      // Si hay menos páginas que botones, mostrar todas las páginas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Siempre incluir la primera página
      paginas.push(1);
      
      // Calcular el rango alrededor de la página actual
      let inicio = Math.max(2, this.paginaActual - 1);
      let fin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);
      
      // Ajustar el rango si estamos cerca del inicio o final
      if (this.paginaActual <= 2) {
        fin = 4;
      } else if (this.paginaActual >= this.totalPaginas - 1) {
        inicio = this.totalPaginas - 3;
      }
      
      // Agregar puntos suspensivos después del 1 si es necesario
      if (inicio > 2) {
        paginas.push(-1); // -1 representa los puntos suspensivos
      }
      
      // Agregar las páginas del rango
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
      
      // Agregar puntos suspensivos antes de la última página si es necesario
      if (fin < this.totalPaginas - 1) {
        paginas.push(-1); // -1 representa los puntos suspensivos
      }
      
      // Siempre incluir la última página
      if (this.totalPaginas > 1) {
        paginas.push(this.totalPaginas);
      }
    }
    
    return paginas;
  }

  // Método auxiliar para cargar requisito en formulario
  cargarRequisitoParaFormulario(id: number): void {
    this.requisitosService.getRequisitoById(id).subscribe({
      next: (requisito) => {
        if (requisito) {
          this.requisitoActual = { ...requisito };
        }
      },
      error: (error) => {
        console.error('Error al cargar el requisito:', error);
        // Si hay error, volver a la lista
        this.router.navigate(['/admin/datos']);
      }
    });
  }

  // Métodos CRUD de requisitos
  crearRequisito(): void {
    this.router.navigate(['/admin/datos/requisitos/nuevo']);
  }

  verRequisito(id: number): void {
    this.router.navigate(['/admin/datos/requisitos/ver', id]);
  }

  editarRequisito(id: number): void {
    this.router.navigate(['/admin/datos/requisitos/editar', id]);
  }

  eliminarRequisito(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este requisito?')) {
      this.requisitosService.eliminarRequisito(id).subscribe({
        next: () => {
          this.cargarRequisitos();
          this.mostrarMensaje('Requisito eliminado correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al eliminar el requisito:', error);
          this.mostrarMensaje('Error al eliminar el requisito', 'error');
        }
      });
    }
  }

  // Métodos del formulario
  guardarRequisito(): void {
    if (!this.validarRequisito()) {
      return;
    }

    if (this.modoFormulario === 'nuevo') {
      const nuevoRequisito = this.requisitoActual as Omit<Requisito, 'id' | 'fechaCreacion'>;
      this.requisitosService.crearRequisito(nuevoRequisito).subscribe({
        next: () => {
          this.mostrarMensaje('Requisito creado correctamente', 'success');
          this.router.navigate(['/admin/datos']);
        },
        error: (error) => {
          console.error('Error al crear el requisito:', error);
          this.mostrarMensaje('Error al crear el requisito', 'error');
        }
      });
    } else if (this.modoFormulario === 'editar' && this.requisitoActual.id) {
      // Para actualizar, solo enviar los campos editables, excluyendo id, fechaCreacion y fechaModificacion
      const datosActualizacion = {
        nombre: this.requisitoActual.nombre,
        descripcion: this.requisitoActual.descripcion,
        tipo: this.requisitoActual.tipo,
        obligatorio: this.requisitoActual.obligatorio,
        activo: this.requisitoActual.activo
      };

      this.requisitosService.actualizarRequisito(this.requisitoActual.id, datosActualizacion).subscribe({
        next: () => {
          this.mostrarMensaje('Requisito actualizado correctamente', 'success');
          this.router.navigate(['/admin/datos']);
        },
        error: (error) => {
          console.error('Error al actualizar el requisito:', error);
          this.mostrarMensaje('Error al actualizar el requisito', 'error');
        }
      });
    }
  }

  cancelarFormulario(): void {
    // Usar Location.back() para simular el botón atrás del navegador
    this.location.back();
  }

  volverALista(): void {
    // Método para el botón volver, usando la misma funcionalidad
    this.location.back();
  }

  // Métodos de validación
  validarRequisito(): boolean {
    if (!this.requisitoActual.nombre || this.requisitoActual.nombre.trim() === '') {
      this.mostrarMensaje('El nombre del requisito es obligatorio', 'error');
      return false;
    }

    if (!this.requisitoActual.tipo) {
      this.mostrarMensaje('El tipo de requisito es obligatorio', 'error');
      return false;
    }

    return true;
  }

  // Método auxiliar para mostrar mensajes (puede ser reemplazado por un servicio de notificaciones)
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    // Implementar notificaciones aquí (toast, snackbar, etc.)
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    
    // Simulación de notificación simple
    if (tipo === 'success') {
      alert(`✅ ${mensaje}`);
    } else {
      alert(`❌ ${mensaje}`);
    }
  }
} 