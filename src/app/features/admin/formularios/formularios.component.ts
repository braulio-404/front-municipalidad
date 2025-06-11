import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FormulariosService } from '../../../servicios/formularios.service';
import { RequisitosService } from '../../../servicios/requisitos.service';
import { EstadisticasAdminService } from '../../../servicios/estadisticas-admin.service';
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

  // Propiedades para paginación
  registrosPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  formulariosPaginados: Formulario[] = [];

  // Variables removidas - ahora se usa navegación por rutas

  constructor(
    private formulariosService: FormulariosService,
    private requisitosService: RequisitosService,
    private estadisticasAdminService: EstadisticasAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFormularios();
    this.cargarRequisitos();
  }

  cargarFormularios(): void {
    this.formulariosService.getFormularios().subscribe({
      next: (data) => {
        // Verificar y actualizar postulaciones vencidas antes de mostrar
        this.verificarYActualizarPostulacionesVencidas(data).then(() => {
          // Filtrar postulaciones que estén vencidas pero sigan activas (por si falla la actualización)
          const formulariosValidos = this.filtrarPostulacionesVencidasActivas(data);
          
          // Ordenar por ID descendente (más recientes primero)
          const formularioOrdenados = formulariosValidos.sort((a, b) => (b.id || 0) - (a.id || 0));
          this.formulariosOriginales = [...formularioOrdenados]; // Guardar copia original ordenada
          this.formularios = [...formularioOrdenados]; // Mostrar todos inicialmente ordenados
          
          // Actualizar paginación
          this.calcularTotalPaginas();
          this.actualizarFormulariosPaginados();
        });
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
    console.log('=== INICIO FILTRADO ===');
    console.log('Filtros seleccionados:', {
      cargo: this.cargoPostulacion,
      fechaInicio: this.fechaInicio,
      fechaTermino: this.fechaTermino,
      estado: this.estadoSeleccionado
    });
    console.log('Total formularios originales:', this.formulariosOriginales.length);

    let formulariosFiltrados = [...this.formulariosOriginales];

    // Filtrar por cargo de postulación
    if (this.cargoPostulacion.trim()) {
      const totalAntes = formulariosFiltrados.length;
      formulariosFiltrados = formulariosFiltrados.filter(form => 
        form.cargo?.toLowerCase().includes(this.cargoPostulacion.toLowerCase().trim())
      );
      console.log(`Filtro cargo: ${totalAntes} -> ${formulariosFiltrados.length}`);
    }

    // Aplicar filtros de fecha como rango
    if (this.fechaInicio || this.fechaTermino) {
      const totalAntes = formulariosFiltrados.length;
      
      formulariosFiltrados = formulariosFiltrados.filter(form => {
        // Verificar que el formulario tenga ambas fechas
        if (!form.fechaInicio || !form.fechaTermino) {
          console.log(`Formulario ${form.id} sin fechas completas - excluido`);
          return false;
        }
        
        // Convertir fechas del formulario sin problemas de zona horaria
        let fechaInicioForm: Date;
        let fechaTerminoForm: Date;
        
        if (typeof form.fechaInicio === 'string') {
          // Extraer solo la parte de fecha para evitar problemas de UTC
          const fechaStr = form.fechaInicio.includes('T') ? form.fechaInicio.split('T')[0] : form.fechaInicio;
          const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
          fechaInicioForm = new Date(year, month - 1, day);
        } else {
          fechaInicioForm = new Date(form.fechaInicio);
        }
        
        if (typeof form.fechaTermino === 'string') {
          // Extraer solo la parte de fecha para evitar problemas de UTC
          const fechaStr = form.fechaTermino.includes('T') ? form.fechaTermino.split('T')[0] : form.fechaTermino;
          const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
          fechaTerminoForm = new Date(year, month - 1, day);
        } else {
          fechaTerminoForm = new Date(form.fechaTermino);
        }
        
        // Normalizar fechas para comparación solo por día
        const fechaInicioFormNorm = new Date(fechaInicioForm.getFullYear(), fechaInicioForm.getMonth(), fechaInicioForm.getDate());
        const fechaTerminoFormNorm = new Date(fechaTerminoForm.getFullYear(), fechaTerminoForm.getMonth(), fechaTerminoForm.getDate());
        
        let cumple = true;
        
        // Aplicar filtro de fecha inicio si está definido
        if (this.fechaInicio) {
          const fechaInicioFiltro = new Date(this.fechaInicio);
          const fechaInicioFiltroNorm = new Date(fechaInicioFiltro.getFullYear(), fechaInicioFiltro.getMonth(), fechaInicioFiltro.getDate());
          
          // El formulario debe iniciar en o después de la fecha de inicio del filtro
          const cumpleFechaInicio = fechaInicioFormNorm >= fechaInicioFiltroNorm;
          console.log(`Formulario ${form.id}: inicio ${fechaInicioForm.toISOString().split('T')[0]} >= ${fechaInicioFiltro.toISOString().split('T')[0]} = ${cumpleFechaInicio}`);
          
          cumple = cumple && cumpleFechaInicio;
        }
        
        // Aplicar filtro de fecha término si está definido
        if (this.fechaTermino) {
          const fechaTerminoFiltro = new Date(this.fechaTermino);
          const fechaTerminoFiltroNorm = new Date(fechaTerminoFiltro.getFullYear(), fechaTerminoFiltro.getMonth(), fechaTerminoFiltro.getDate());
          
          // El formulario debe terminar en o antes de la fecha de término del filtro
          const cumpleFechaTermino = fechaTerminoFormNorm <= fechaTerminoFiltroNorm;
          console.log(`Formulario ${form.id}: término ${fechaTerminoForm.toISOString().split('T')[0]} <= ${fechaTerminoFiltro.toISOString().split('T')[0]} = ${cumpleFechaTermino}`);
          
          cumple = cumple && cumpleFechaTermino;
        }
        
        console.log(`Formulario ${form.id} (${form.cargo}): cumple filtros de fecha = ${cumple}`);
        return cumple;
      });
      
      console.log(`Filtro rango de fechas: ${totalAntes} -> ${formulariosFiltrados.length}`);
    }

    // Filtrar por estado
    if (this.estadoSeleccionado) {
      const totalAntes = formulariosFiltrados.length;
      formulariosFiltrados = formulariosFiltrados.filter(form => 
        form.estado === this.estadoSeleccionado
      );
      console.log(`Filtro estado: ${totalAntes} -> ${formulariosFiltrados.length}`);
    }

    // Ordenar los resultados filtrados por ID descendente
    this.formularios = formulariosFiltrados.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    // Actualizar paginación después de filtrar
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarFormulariosPaginados();
    
    console.log('=== RESULTADO FINAL ===');
    console.log(`Resultados encontrados: ${this.formularios.length}`);
    console.log('Formularios filtrados:', this.formularios.map(f => ({
      id: f.id,
      cargo: f.cargo,
      fechaInicio: f.fechaInicio,
      fechaTermino: f.fechaTermino,
      estado: f.estado
    })));
    console.log('=== FIN FILTRADO ===');
  }

  limpiarFiltros(): void {
    this.cargoPostulacion = '';
    this.fechaInicio = '';
    this.fechaTermino = '';
    this.estadoSeleccionado = '';
    // Restaurar formularios originales pero aplicar filtro de postulaciones vencidas activas
    const formulariosValidos = this.filtrarPostulacionesVencidasActivas(this.formulariosOriginales);
    this.formularios = [...formulariosValidos];
    
    // Resetear paginación
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarFormulariosPaginados();
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
    const formulario = this.formulariosOriginales.find(f => f.id === id);
    
    if (confirm('¿Estás seguro de que deseas eliminar esta postulación? Esta acción no se puede deshacer.')) {
      this.formulariosService.eliminarFormulario(id).subscribe({
        next: () => {
          // Registrar actividad de eliminación
          if (formulario) {
            this.estadisticasAdminService.registrarActividad({
              tipo: 'formulario',
              titulo: 'Formulario eliminado',
              descripcion: `Se eliminó el formulario para ${formulario.cargo}`,
              icono: 'delete',
              usuario: 'Admin Sistema'
            });
          }
          
          this.cargarFormularios();
        },
        error: (error) => {
          console.error('Error al eliminar formulario:', error);
          alert('Error al eliminar el formulario. Por favor, intente nuevamente.');
        }
      });
    }
  }

  formatearFechaLocal(fecha: Date | string): string {
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

  /**
   * Verifica las postulaciones que han vencido y las marca como inactivas automáticamente
   */
  private async verificarYActualizarPostulacionesVencidas(formularios: Formulario[]): Promise<void> {
    const fechaActual = new Date();
    // Normalizar fecha actual para comparación solo por día
    const fechaActualNorm = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
    
    const postulacionesVencidas = formularios.filter(form => {
      // Solo verificar postulaciones que están activas y tienen fecha término
      if (form.estado !== 'Activo' || !form.fechaTermino) {
        return false;
      }
      
      // Convertir fecha término del formulario
      let fechaTerminoForm: Date;
      if (typeof form.fechaTermino === 'string') {
        const fechaStr = form.fechaTermino.includes('T') ? form.fechaTermino.split('T')[0] : form.fechaTermino;
        const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
        fechaTerminoForm = new Date(year, month - 1, day);
      } else {
        fechaTerminoForm = new Date(form.fechaTermino);
      }
      
      // Normalizar fecha término para comparación solo por día
      const fechaTerminoNorm = new Date(fechaTerminoForm.getFullYear(), fechaTerminoForm.getMonth(), fechaTerminoForm.getDate());
      
      // La postulación ha vencido si la fecha actual es posterior a la fecha término
      return fechaActualNorm > fechaTerminoNorm;
    });
    
    // Actualizar postulaciones vencidas
    if (postulacionesVencidas.length > 0) {
      console.log(`Encontradas ${postulacionesVencidas.length} postulaciones vencidas. Actualizando a estado "Inactivo"...`);
      
      const promesasActualizacion = postulacionesVencidas.map(form => {
        if (form.id) {
          console.log(`Marcando como inactiva la postulación "${form.cargo}" (ID: ${form.id}) - Fecha término: ${form.fechaTermino}`);
          return this.formulariosService.actualizarFormulario(form.id, { estado: 'Inactivo' }).toPromise()
            .then(() => {
              // Actualizar el objeto local inmediatamente
              form.estado = 'Inactivo';
            })
            .catch(error => {
              console.error(`Error al actualizar postulación ${form.id}:`, error);
            });
        }
        return Promise.resolve();
      });
      
      try {
        await Promise.all(promesasActualizacion);
        console.log('Postulaciones vencidas actualizadas correctamente');
      } catch (error) {
        console.error('Error al actualizar algunas postulaciones vencidas:', error);
      }
    }
  }

  /**
   * Método público para verificar manualmente postulaciones vencidas
   * Útil para botones de administración o verificaciones bajo demanda
   */
  verificarPostulacionesVencidas(): void {
    this.verificarYActualizarPostulacionesVencidas(this.formulariosOriginales).then(() => {
      // Filtrar postulaciones vencidas que sigan activas antes de recargar la vista
      const formulariosValidos = this.filtrarPostulacionesVencidasActivas(this.formulariosOriginales);
      this.formularios = [...formulariosValidos];
      
      // Mostrar mensaje informativo (puedes personalizar según tu sistema de notificaciones)
      const postulacionesVencidas = formulariosValidos.filter(form => {
        if (!form.fechaTermino) return false;
        
        const fechaActual = new Date();
        const fechaActualNorm = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
        
        let fechaTerminoForm: Date;
        if (typeof form.fechaTermino === 'string') {
          const fechaStr = form.fechaTermino.includes('T') ? form.fechaTermino.split('T')[0] : form.fechaTermino;
          const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
          fechaTerminoForm = new Date(year, month - 1, day);
        } else {
          fechaTerminoForm = new Date(form.fechaTermino);
        }
        
        const fechaTerminoNorm = new Date(fechaTerminoForm.getFullYear(), fechaTerminoForm.getMonth(), fechaTerminoForm.getDate());
        return fechaActualNorm > fechaTerminoNorm && form.estado === 'Inactivo';
      });

      if (postulacionesVencidas.length > 0) {
        console.log(`Se han actualizado ${postulacionesVencidas.length} postulaciones vencidas a estado "Inactivo"`);
        // Aquí puedes agregar una notificación toast o alert si tu aplicación tiene un sistema de notificaciones
      } else {
        console.log('No se encontraron postulaciones vencidas que requieran actualización');
      }
    });
  }

  /**
   * Determina si una postulación ha vencido (fecha término anterior a la fecha actual)
   */
  esPostulacionVencida(formulario: Formulario): boolean {
    if (!formulario.fechaTermino) {
      return false;
    }

    const fechaActual = new Date();
    const fechaActualNorm = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
    
    let fechaTerminoForm: Date;
    if (typeof formulario.fechaTermino === 'string') {
      const fechaStr = formulario.fechaTermino.includes('T') ? formulario.fechaTermino.split('T')[0] : formulario.fechaTermino;
      const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
      fechaTerminoForm = new Date(year, month - 1, day);
    } else {
      fechaTerminoForm = new Date(formulario.fechaTermino);
    }
    
    const fechaTerminoNorm = new Date(fechaTerminoForm.getFullYear(), fechaTerminoForm.getMonth(), fechaTerminoForm.getDate());
    
    return fechaActualNorm > fechaTerminoNorm;
  }

  /**
   * Filtra las postulaciones que estén vencidas pero sigan marcadas como activas
   * para que no se muestren en la interfaz
   */
  private filtrarPostulacionesVencidasActivas(formularios: Formulario[]): Formulario[] {
    return formularios.filter(form => {
      // Si la postulación no está activa, se puede mostrar (ya está inactiva correctamente)
      if (form.estado !== 'Activo') {
        return true;
      }
      
      // Si está activa, verificar si ha vencido
      if (this.esPostulacionVencida(form)) {
        console.warn(`Ocultando postulación vencida que sigue activa: "${form.cargo}" (ID: ${form.id}) - Fecha término: ${form.fechaTermino}`);
        return false; // No mostrar postulaciones vencidas que sigan activas
      }
      
      return true; // Mostrar postulaciones activas que no han vencido
    });
  }

  /**
   * Calcula el total de páginas basado en la cantidad de registros
   */
  private calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.formularios.length / this.registrosPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas);
    if (this.totalPaginas === 0) {
      this.paginaActual = 1;
      this.totalPaginas = 1;
    }
  }

  /**
   * Actualiza los formularios mostrados según la página actual
   */
  private actualizarFormulariosPaginados(): void {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.formulariosPaginados = this.formularios.slice(inicio, fin);
  }

  /**
   * Cambia la página actual y actualiza los formularios mostrados
   */
  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.actualizarFormulariosPaginados();
    }
  }

  /**
   * Cambia la cantidad de registros por página y actualiza la vista
   */
  cambiarRegistrosPorPagina(): void {
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarFormulariosPaginados();
  }

  /**
   * Genera un array con los números de página que se mostrarán
   * Muestra siempre la primera y última página, y un rango alrededor de la página actual
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

  // Métodos removidos - ahora se usa navegación por rutas
} 