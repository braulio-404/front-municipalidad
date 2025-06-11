import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormulariosService } from '../../../servicios/formularios.service';
import { Formulario } from '../../../interfaces/formulario.interface';

// Interfaz extendida para incluir el conteo de postulantes
interface FormularioConConteo extends Formulario {
  cantidadPostulantes: number;
}

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
  postulaciones: FormularioConConteo[] = [];
  postulacionesFiltradas: FormularioConConteo[] = [];
  postulacionesPaginadas: FormularioConConteo[] = [];
  seleccionadas: { [key: number]: boolean } = {};
  terminoBusqueda: string = '';
  fechaInicio: string = '';
  fechaTermino: string = '';
  cargando: boolean = false;
  error: string = '';

  // Propiedades de paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalPaginas: number = 0;
  opcionesRegistrosPorPagina: number[] = [5, 10, 15, 20];

  constructor(
    private formulariosService: FormulariosService
  ) {}

  ngOnInit(): void {
    this.cargarPostulaciones();
  }

  cargarPostulaciones(): void {
    this.cargando = true;
    this.error = '';
    
    console.log('Cargando formularios con conteo...');
    
    // Usar el método optimizado que trae el conteo desde el backend
    this.formulariosService.getFormulariosConConteo().subscribe({
      next: (formularios) => {
        console.log('Formularios con conteo obtenidos:', formularios.length);
        console.log('Detalle de conteos:', formularios.map(f => ({
          id: f.id,
          cargo: f.cargo,
          cantidadPostulantes: f.cantidadPostulantes
        })));
        
        this.postulaciones = formularios;
        this.postulacionesFiltradas = [...formularios];
        this.calcularTotalPaginas();
        this.actualizarPostulacionesPaginadas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar formularios con conteo:', error);
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

    // Resetear la paginación cuando se aplican filtros
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarPostulacionesPaginadas();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.fechaInicio = '';
    this.fechaTermino = '';
    this.postulacionesFiltradas = this.postulaciones;
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarPostulacionesPaginadas();
  }

  // Métodos de paginación
  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.postulacionesFiltradas.length / this.registrosPorPagina);
  }

  actualizarPostulacionesPaginadas(): void {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.postulacionesPaginadas = this.postulacionesFiltradas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPostulacionesPaginadas();
    }
  }

  onRegistrosPorPaginaChange(): void {
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarPostulacionesPaginadas();
  }

  obtenerPaginas(): number[] {
    const paginas: number[] = [];
    const totalBotones = 5; // Número máximo de botones a mostrar
    
    if (this.totalPaginas <= totalBotones) {
      // Si hay menos páginas que botones, mostrar todas las páginas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      paginas.push(1);
      
      // Calcular el rango de páginas a mostrar
      let inicio = Math.max(2, this.paginaActual - 1);
      let fin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);
      
      // Ajustar el rango si estamos en los extremos
      if (this.paginaActual <= 2) {
        fin = 4;
      } else if (this.paginaActual >= this.totalPaginas - 1) {
        inicio = this.totalPaginas - 3;
      }
      
      // Agregar puntos suspensivos después de la primera página si es necesario
      if (inicio > 2) {
        paginas.push(-1); // -1 representa los puntos suspensivos
      }
      
      // Agregar las páginas del rango
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
      
      // Agregar puntos suspensivos antes de la última página si es necesario
      if (fin < this.totalPaginas - 1) {
        paginas.push(-1);
      }
      
      // Siempre mostrar la última página
      paginas.push(this.totalPaginas);
    }
    
    return paginas;
  }

  haySeleccionadas(): boolean {
    return Object.values(this.seleccionadas).some(value => value);
  }

  toggleSeleccion(postulacion: FormularioConConteo): void {
    if (!postulacion.id) return;
    this.seleccionadas[postulacion.id] = !this.seleccionadas[postulacion.id];
  }

  seleccionarTodas(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.postulacionesPaginadas.forEach(p => {
      if (p.id) {
        this.seleccionadas[p.id] = isChecked;
      }
    });
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
    
    this.formulariosService.descargarDocumentos({ ids: idsSeleccionados }).subscribe({
      next: (response: any) => {
        this.cargando = false;
        
        // Detectar el tipo de archivo desde los headers de la respuesta
        const contentType = response.headers?.get('content-type') || response.type;
        const esZip = contentType.includes('application/zip');
        
        // Determinar nombre y tipo basándose en la respuesta real
        const tipoArchivo = esZip ? 'application/zip' : 'application/pdf';
        const extension = esZip ? '.zip' : '.pdf';
        const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const nombreArchivo = esZip 
          ? `documentos_formularios_${fechaActual}.zip`
          : `documento_formulario_${fechaActual}.pdf`;
        
        // Crear blob con el tipo correcto
        const blob = new Blob([response.body || response], { type: tipoArchivo });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        console.log(`Descarga completada: ${nombreArchivo} (Tipo detectado: ${tipoArchivo})`);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al descargar documentos', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        console.error('error.error:', error.error);
        
        // Intentar extraer el mensaje de error
        let mensajeError = '';
        
        // Si error.error es un Blob (cuando el servidor devuelve JSON pero esperamos Blob)
        if (error.error instanceof Blob && error.error.type === 'application/json') {
          // Leer el Blob como texto para obtener el JSON
          error.error.text().then((text: string) => {
            try {
              const errorData = JSON.parse(text);
              console.error('Error parseado desde Blob:', errorData);
              
              if (errorData.error === "No se encontraron documentos") {
                this.error = errorData.message || "No se encontraron documentos para ningún postulante en las postulaciones solicitadas";
              } else if (errorData.message) {
                this.error = errorData.message;
              } else {
                this.error = 'Error al descargar documentos. Verifique que el servidor esté disponible.';
              }
            } catch (parseError) {
              console.error('Error al parsear JSON desde Blob:', parseError);
              this.error = 'Error al descargar documentos. Verifique que el servidor esté disponible.';
            }
          });
          return;
        }
        
        // Manejo normal de errores JSON
        if (error.error?.error === "No se encontraron documentos") {
          mensajeError = error.error.message || "No se encontraron documentos para ningún postulante en las postulaciones solicitadas";
        } else if (error.error?.message && error.error.message.includes("No se encontraron documentos")) {
          mensajeError = error.error.message;
        } else if (error.error?.message) {
          mensajeError = error.error.message;
        } else if (error.error?.error) {
          mensajeError = error.error.error;
        } else if (error.message) {
          mensajeError = error.message;
        } else {
          mensajeError = 'Error al descargar documentos. Verifique que el servidor esté disponible.';
        }
        
        this.error = mensajeError;
        setTimeout(() => this.error = '', 5000);
      }
    });
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
} 