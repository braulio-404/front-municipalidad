import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormulariosService, DescargarDocumentosPostulantesDto, EnviarAprobacionesDto, EnviarRechazosDto, CorreoRespuesta } from '../../../servicios/formularios.service';
import { PostulantesService } from '../../../servicios/postulantes.service';
import { Formulario } from '../../../interfaces/formulario.interface';
import { Postulante } from '../../../interfaces/postulante.interface';
import * as JSZip from 'jszip';

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

  // Propiedades del modal de postulantes
  mostrarModalPostulantes: boolean = false;
  postulacionSeleccionada: FormularioConConteo | null = null;
  postulantes: Postulante[] = [];
  postulantesFiltrados: Postulante[] = [];
  busquedaPostulante: string = '';
  cargandoPostulantes: boolean = false;

  // Selección de postulantes
  postulantesSeleccionados: { [key: string]: boolean } = {};
  
  // Modal de documentos
  mostrarModalDocumentos: boolean = false;
  postulanteSeleccionadoDoc: Postulante | null = null;
  documentosPostulante: any[] = [];
  archivosDescomprimidos: any[] = [];
  cargandoDescompresion: boolean = false;
  
  // Modal visor PDF
  mostrarVisorPDF: boolean = false;
  documentoActual: any = null;
  urlDocumento: SafeResourceUrl | null = null;
  cargandoPDF: boolean = false;

  // Modales de confirmación para aprobar/rechazar
  mostrarConfirmacionAprobar: boolean = false;
  mostrarConfirmacionRechazar: boolean = false;
  motivoRechazo: string = '';
  enviandoCorreos: boolean = false;

  // Modal de resultados de operaciones
  mostrarModalResultado: boolean = false;
  resultadoOperacion: {
    tipo: 'success' | 'error' | 'warning';
    titulo: string;
    mensaje: string;
    detalles?: string[];
  } | null = null;

  constructor(
    private formulariosService: FormulariosService,
    private postulantesService: PostulantesService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
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

  formatearFecha(fecha: string | Date | undefined): string {
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

  formatearFechaCompleta(fecha: string | Date | undefined): string {
    if (!fecha) return '';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    if (isNaN(fechaObj.getTime())) {
      return '';
    }
    
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return fechaObj.toLocaleDateString('es-ES', opciones);
  }

  // Métodos del modal de postulantes
  verPostulantes(postulacion: FormularioConConteo): void {
    if (!postulacion.id || (postulacion.cantidadPostulantes || 0) === 0) {
      return;
    }

    this.postulacionSeleccionada = postulacion;
    this.mostrarModalPostulantes = true;
    this.busquedaPostulante = '';
    this.cargarPostulantes(postulacion.id);
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cargarPostulantes(formularioId: number): void {
    this.cargandoPostulantes = true;
    this.postulantes = [];
    this.postulantesFiltrados = [];

    // Usar el servicio de formularios en lugar del de postulantes
    this.formulariosService.getPostulantesByFormulario(formularioId).subscribe({
      next: (postulantes) => {
        console.log('📥 Postulantes cargados desde formularios service:', postulantes);
        console.log('📊 Total postulantes recibidos:', postulantes.length);
        if (postulantes.length > 0) {
          console.log('🧩 Estructura de primer postulante:', postulantes[0]);
          
          // Debug: Mostrar todos los IDs disponibles
          postulantes.forEach((p, index) => {
            console.log(`👤 Postulante ${index}: id=${p.id}, postulanteID=${p.postulanteID}, nombre=${p.nombres} ${p.apellidoPaterno}, estado=${p.estado}`);
          });
        }
        
        this.postulantes = postulantes;
        this.postulantesFiltrados = [...postulantes];
        this.cargandoPostulantes = false;
        
        console.log('✅ Arrays actualizados - postulantes:', this.postulantes.length, 'filtrados:', this.postulantesFiltrados.length);
      },
      error: (error) => {
        console.error('Error al cargar postulantes:', error);
        this.cargandoPostulantes = false;
        // Fallback: intentar con el servicio de postulantes si el endpoint de formularios no existe aún
        console.log('Intentando con servicio de postulantes...');
        this.postulantesService.findByFormulario(formularioId).subscribe({
          next: (postulantes) => {
            console.log('Postulantes cargados desde postulantes service (fallback):', postulantes);
            this.postulantes = postulantes;
            this.postulantesFiltrados = [...postulantes];
            this.cargandoPostulantes = false;
          },
          error: (fallbackError) => {
            console.error('Error en fallback:', fallbackError);
            this.cargandoPostulantes = false;
          }
        });
      }
    });
  }

  filtrarPostulantes(): void {
    console.log('🔍 Iniciando filtrado - postulantes:', this.postulantes.length, 'busqueda:', this.busquedaPostulante);
    
    if (!this.busquedaPostulante.trim()) {
      // Crear nuevo array para forzar detección de cambios
      this.postulantesFiltrados = [...this.postulantes];
      console.log('✅ Sin búsqueda - filtrados:', this.postulantesFiltrados.length);
      return;
    }

    const busqueda = this.busquedaPostulante.toLowerCase().trim();
    // Crear nuevo array filtrado para forzar detección de cambios
    this.postulantesFiltrados = this.postulantes.filter(postulante => {
      const nombreCompleto = `${postulante.nombres} ${postulante.apellidoPaterno}`.toLowerCase();
      const rut = postulante.rut?.toLowerCase() || '';
      const email = postulante.email?.toLowerCase() || '';
      
      return nombreCompleto.includes(busqueda) || 
             rut.includes(busqueda) || 
             email.includes(busqueda);
    });
    
    console.log('✅ Con búsqueda - filtrados:', this.postulantesFiltrados.length);
  }

  limpiarBusquedaPostulante(): void {
    this.busquedaPostulante = '';
    this.filtrarPostulantes();
  }

  cerrarModal(): void {
    this.mostrarModalPostulantes = false;
    this.postulacionSeleccionada = null;
    this.postulantes = [];
    this.postulantesFiltrados = [];
    this.busquedaPostulante = '';
    this.cargandoPostulantes = false;
    this.postulantesSeleccionados = {};
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  // Métodos de selección de postulantes
  toggleSeleccionPostulante(postulante: Postulante): void {
    const id = this.getPostulanteId(postulante);
    if (id) {
      this.postulantesSeleccionados[id] = !this.postulantesSeleccionados[id];
    }
  }

  get todosSeleccionados(): boolean {
    return this.postulantesFiltrados.length > 0 && 
           this.postulantesFiltrados.every(p => {
             const id = this.getPostulanteId(p);
             return id ? this.postulantesSeleccionados[id] : false;
           });
  }

  seleccionarTodosPostulantes(): void {
    const nuevoEstado = !this.todosSeleccionados;
    this.postulantesFiltrados.forEach(postulante => {
      const id = this.getPostulanteId(postulante);
      if (id) {
        this.postulantesSeleccionados[id] = nuevoEstado;
      }
    });
  }

  hayPostulantesSeleccionados(): boolean {
    return Object.values(this.postulantesSeleccionados).some(seleccionado => seleccionado);
  }

  contarSeleccionados(): number {
    return Object.values(this.postulantesSeleccionados).filter(seleccionado => seleccionado).length;
  }

  // Nuevo método: Contar solo postulantes que pueden ser procesados (PENDIENTE o EN REVISIÓN)
  contarSeleccionadosParaProcesar(): number {
    return this.getPostulantesSeleccionadosParaProcesar().length;
  }

  // Nuevo método: Verificar si hay postulantes seleccionados que pueden ser procesados
  hayPostulantesSeleccionadosParaProcesar(): boolean {
    return this.getPostulantesSeleccionadosParaProcesar().length > 0;
  }

  // Método existente que devuelve TODOS los postulantes seleccionados (para descarga de documentos)
  getPostulantesSeleccionados(): Postulante[] {
    return this.postulantes.filter(p => {
      const id = this.getPostulanteId(p);
      return id ? this.postulantesSeleccionados[id] : false;
    });
  }

  // Nuevo método: Solo postulantes que pueden ser procesados (PENDIENTE o EN REVISIÓN)
  getPostulantesSeleccionadosParaProcesar(): Postulante[] {
    return this.postulantes.filter(p => {
      const id = this.getPostulanteId(p);
      const estaSeleccionado = id ? this.postulantesSeleccionados[id] : false;
      const puedeSerProcesado = this.puedeSerProcesado(p.estado);
      return estaSeleccionado && puedeSerProcesado;
    });
  }

  // Método helper para determinar si un postulante puede ser procesado
  private puedeSerProcesado(estado: string | undefined): boolean {
    if (!estado) return true; // Si no tiene estado, asumimos que es PENDIENTE
    const estadoNormalizado = estado.toUpperCase();
    return estadoNormalizado === 'PENDIENTE' || estadoNormalizado === 'EN REVISIÓN' || estadoNormalizado === 'EN REVISION';
  }

  // Método público para usar en el template para mostrar si un postulante puede ser procesado
  postulantePuedeSerProcesado(postulante: Postulante): boolean {
    return this.puedeSerProcesado(postulante.estado);
  }

  // Métodos para modal de documentos
  verDocumentosPostulante(postulante: Postulante): void {
    this.postulanteSeleccionadoDoc = postulante;
    this.mostrarModalDocumentos = true;
    
    // Cargar documentos del postulante desde el backend
    this.cargarDocumentosPostulante(postulante);
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  private cargarDocumentosPostulante(postulante: Postulante): void {
    // Limpiar archivos descomprimidos anteriores
    this.archivosDescomprimidos = [];
    
    // Verificar si el postulante tiene documentos preload
    if (postulante.documentos && postulante.documentos.length > 0) {
      this.documentosPostulante = postulante.documentos;
      console.log('📄 Documentos cargados desde postulante:', this.documentosPostulante);
      this.procesarDocumentosZIP();
      return;
    }

    // Si no tiene documentos preload, cargar desde la API
    const postulanteId = postulante.postulanteID || postulante.id?.toString();
    
    if (!postulanteId) {
      console.error('❌ No se puede obtener ID del postulante');
      this.documentosPostulante = [];
      return;
    }

    console.log('🔄 Cargando documentos para postulante ID:', postulanteId);
    
    this.postulantesService.getDocumentos(postulanteId).subscribe({
      next: (documentos) => {
        this.documentosPostulante = documentos || [];
        console.log('✅ Documentos cargados desde API:', this.documentosPostulante);
        this.procesarDocumentosZIP();
      },
      error: (error) => {
        console.error('❌ Error al cargar documentos:', error);
        this.documentosPostulante = [];
        
        // Mostrar mensaje de error más amigable
        if (error.status === 404) {
          console.log('ℹ️ No se encontraron documentos para este postulante');
        } else {
          alert('Error al cargar los documentos del postulante. Por favor, intente nuevamente.');
        }
      }
    });
  }

  cerrarModalDocumentos(): void {
    this.mostrarModalDocumentos = false;
    this.postulanteSeleccionadoDoc = null;
    this.documentosPostulante = [];
    
    // Limpiar URLs temporales para evitar memory leaks
    this.archivosDescomprimidos.forEach(archivo => {
      if (archivo.urlTemporal && archivo.urlTemporal.startsWith('blob:')) {
        window.URL.revokeObjectURL(archivo.urlTemporal);
      }
    });
    this.archivosDescomprimidos = [];
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  private async procesarDocumentosZIP(): Promise<void> {
    this.archivosDescomprimidos = [];
    
    for (const documento of this.documentosPostulante) {
      if (documento.tipoArchivo === 'application/zip' || documento.nombreArchivo?.endsWith('.zip')) {
        console.log('📦 Procesando archivo ZIP:', documento.nombreArchivo);
        await this.descomprimirZIP(documento);
      } else {
        // Si no es ZIP, agregarlo directamente a los archivos descomprimidos
        this.archivosDescomprimidos.push({
          ...documento,
          esZIP: false,
          archivoOriginal: documento
        });
      }
    }
    
    console.log('📁 Archivos descomprimidos total:', this.archivosDescomprimidos.length);
  }

  private async descomprimirZIP(documentoZIP: any): Promise<void> {
    try {
      this.cargandoDescompresion = true;
      const documentoId = documentoZIP.documentoPostulanteID || documentoZIP.id || documentoZIP.documentoID;
      
      if (!documentoId) {
        console.error('❌ No se puede obtener ID del documento ZIP');
        this.cargandoDescompresion = false;
        return;
      }

      console.log('🔄 Descargando ZIP para descompresión:', documentoId);

      // Descargar el archivo ZIP como blob
      this.postulantesService.getDocumentoArchivo(documentoId).subscribe({
        next: async (blob: Blob) => {
          try {
            // Descomprimir usando JSZip
            const zip = new JSZip.default();
            const contenidoZip = await zip.loadAsync(blob);
            
            console.log('📦 Archivos en el ZIP:', Object.keys(contenidoZip.files));

            // Procesar cada archivo en el ZIP
            for (const nombreArchivo in contenidoZip.files) {
              const archivo = contenidoZip.files[nombreArchivo];
              
              if (!archivo.dir) { // Solo procesar archivos, no directorios
                console.log(`📁 Extrayendo archivo: ${nombreArchivo}`);
                
                // Determinar tipo de archivo antes de extraer
                const tipoArchivo = this.determinarTipoArchivo(nombreArchivo);
                
                // Extraer como arraybuffer primero para mantener integridad
                const contenidoArrayBuffer = await archivo.async('arraybuffer');
                
                // Crear blob con el tipo MIME correcto
                const contenidoBlob = new Blob([contenidoArrayBuffer], { type: tipoArchivo });
                
                console.log(`📄 Archivo extraído - Tipo: ${tipoArchivo}, Tamaño: ${contenidoBlob.size} bytes`);
                
                // Validar el contenido del blob para archivos importantes
                const esPDFoImagen = tipoArchivo.includes('pdf') || tipoArchivo.startsWith('image/');
                if (esPDFoImagen) {
                  const esValido = await this.validarBlob(contenidoBlob, tipoArchivo);
                  if (!esValido) {
                    console.warn(`⚠️ Archivo "${nombreArchivo}" parece estar corrupto o en formato incorrecto`);
                  }
                }
                
                // Crear URL para el archivo descomprimido
                const urlArchivo = window.URL.createObjectURL(contenidoBlob);
                
                this.archivosDescomprimidos.push({
                  documentoPostulanteID: `${documentoId}_${nombreArchivo}`,
                  nombreArchivo: nombreArchivo,
                  tipoArchivo: tipoArchivo,
                  descripcion: `Archivo extraído de ${documentoZIP.nombreArchivo}`,
                  fechaSubida: documentoZIP.fechaSubida,
                  urlTemporal: urlArchivo,
                  blobData: contenidoBlob,
                  esZIP: false,
                  archivoOriginal: documentoZIP,
                  esDescomprimido: true
                });
              }
            }
            
            console.log(`✅ ZIP descomprimido: ${Object.keys(contenidoZip.files).length} archivos extraídos`);
            this.cargandoDescompresion = false;
            
          } catch (zipError) {
            console.error('❌ Error al descomprimir ZIP:', zipError);
            alert('Error al descomprimir el archivo ZIP. El archivo puede estar corrupto.');
            this.cargandoDescompresion = false;
          }
        },
        error: (error: any) => {
          console.error('❌ Error al descargar ZIP:', error);
          alert('Error al descargar el archivo ZIP para descompresión.');
          this.cargandoDescompresion = false;
        }
      });
      
    } catch (error) {
      console.error('❌ Error en procesamiento de ZIP:', error);
      this.cargandoDescompresion = false;
    }
  }

  private determinarTipoArchivo(nombreArchivo: string): string {
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'webp':
        return 'image/webp';
      case 'tiff':
      case 'tif':
        return 'image/tiff';
      case 'svg':
        return 'image/svg+xml';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ppt':
        return 'application/vnd.ms-powerpoint';
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'txt':
        return 'text/plain';
      case 'rtf':
        return 'application/rtf';
      case 'zip':
        return 'application/zip';
      case 'rar':
        return 'application/x-rar-compressed';
      case '7z':
        return 'application/x-7z-compressed';
      default:
        console.warn(`⚠️ Tipo de archivo no reconocido: ${extension}`);
        return 'application/octet-stream';
    }
  }

  getIconoTipoArchivo(tipoArchivo: string): string {
    if (tipoArchivo === 'application/pdf' || tipoArchivo.includes('pdf')) {
      return 'picture_as_pdf';
    } else if (tipoArchivo.startsWith('image/')) {
      return 'image';
    } else if (tipoArchivo.includes('word') || tipoArchivo.includes('document') || tipoArchivo.includes('msword')) {
      return 'description';
    } else if (tipoArchivo.includes('excel') || tipoArchivo.includes('spreadsheet') || tipoArchivo.includes('ms-excel')) {
      return 'table_chart';
    } else if (tipoArchivo === 'application/zip' || tipoArchivo.includes('zip')) {
      return 'folder_zip';
    } else if (tipoArchivo.includes('text') || tipoArchivo === 'text/plain') {
      return 'text_snippet';
    }
    return 'insert_drive_file';
  }

  // Métodos para visor de documentos
  abrirDocumento(documento: any): void {
    console.log('🔍 Intentando abrir documento:', documento);
    
    // Primero verificar si realmente es un PDF o imagen que se puede mostrar directamente
    const esPDFoImagen = documento.tipoArchivo?.includes('pdf') || 
                        documento.tipoArchivo?.startsWith('image/') ||
                        documento.nombreArchivo?.toLowerCase().match(/\.(pdf|jpg|jpeg|png|gif)$/i);

    if (!esPDFoImagen) {
      // Para otros tipos de archivo, ofrecer descarga directa
      const confirmDescarga = confirm(`Este archivo (${documento.nombreArchivo}) no se puede visualizar en el navegador.\n\n¿Desea descargarlo directamente?`);
      if (confirmDescarga) {
        this.descargarDocumento(documento);
      }
      return;
    }

    // Solo continuar con la visualización para PDFs e imágenes
    this.documentoActual = documento;
    this.mostrarVisorPDF = true;
    this.cargandoPDF = true;
    
    // Cargar el documento para visualización
    this.cargarDocumentoParaVisualizacion(documento);
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  private cargarDocumentoParaVisualizacion(documento: any): void {
    // Si es un archivo descomprimido, usar su URL temporal
    if (documento.esDescomprimido && documento.urlTemporal) {
      this.prepararVisualizacionSegunTipo(documento, documento.urlTemporal);
      return;
    }

    const documentoId = documento.documentoPostulanteID || documento.id || documento.documentoID;
    
    if (!documentoId) {
      console.error('❌ No se puede obtener ID del documento');
      this.cargandoPDF = false;
      alert('Error: No se puede identificar el documento');
      this.cerrarVisorPDF();
      return;
    }

    console.log('🔄 Cargando documento para visualización:', documentoId);

    // Verificar si el servicio getDocumentoArchivo existe
    if (this.postulantesService.getDocumentoArchivo) {
      // Llamar al servicio para obtener el documento como blob
      this.postulantesService.getDocumentoArchivo(documentoId).subscribe({
        next: (response: any) => {
          console.log('🔍 Respuesta del servicio:', typeof response, response);
          
          // Verificar si la respuesta es un Blob válido
          if (response instanceof Blob && response.size > 0) {
            // Verificar el tipo MIME del blob
            console.log('📄 Blob type:', response.type, 'Size:', response.size);
            
            // Si el blob no tiene tipo o es genérico, intentar detectar por el nombre
            if (!response.type || response.type === 'application/octet-stream') {
              console.warn('⚠️ Tipo MIME no especificado, detectando por extensión');
            }
            
            const url = window.URL.createObjectURL(response);
            this.prepararVisualizacionSegunTipo(documento, url);
          } else if (typeof response === 'string' || response instanceof ArrayBuffer) {
            console.error('❌ Respuesta en formato incorrecto (string/ArrayBuffer en lugar de Blob)');
            throw new Error('Formato de respuesta incorrecto');
          } else {
            console.error('❌ Blob vacío o inválido');
            throw new Error('Blob vacío o inválido');
          }
        },
        error: (error: any) => {
          console.error('❌ Error al cargar documento via servicio:', error);
          this.intentarCargarConURL(documento);
        }
      });
    } else {
      console.log('🔄 Servicio getDocumentoArchivo no disponible, usando URL directa...');
      this.intentarCargarConURL(documento);
    }
  }

  private prepararVisualizacionSegunTipo(documento: any, url: string): void {
    const tipoArchivo = documento.tipoArchivo || '';
    const nombreArchivo = documento.nombreArchivo || '';
    const esDescomprimido = documento.esDescomprimido || false;
    
    console.log('🔍 Preparando visualización para:', {
      nombreArchivo,
      tipoArchivo,
      esDescomprimido,
      blobSize: documento.blobData?.size,
      url: url.substring(0, 100) + '...'
    });
    
    try {
      // Validar que sea un tipo de archivo visualizable
      const esPDF = tipoArchivo.includes('pdf') || nombreArchivo.toLowerCase().endsWith('.pdf');
      const esImagen = tipoArchivo.startsWith('image/') || 
                     nombreArchivo.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff|tif|svg)$/i);
      
      if (!esPDF && !esImagen) {
        console.warn('⚠️ Tipo de archivo no visualizable:', tipoArchivo);
        this.cargandoPDF = false;
        alert(`Este tipo de archivo (${tipoArchivo}) no se puede visualizar en el navegador.\n\n¿Desea descargarlo directamente?`);
        this.cerrarVisorPDF();
        return;
      }
      
      // Para archivos descomprimidos, validar el blob
      if (esDescomprimido && documento.blobData) {
        console.log(`📁 Archivo descomprimido - Validando blob:`, {
          size: documento.blobData.size,
          type: documento.blobData.type,
          expectedType: tipoArchivo
        });
        
        // Verificar que el blob tenga contenido
        if (documento.blobData.size === 0) {
          console.error('❌ Blob vacío para archivo descomprimido');
          alert('Error: El archivo descomprimido está vacío.');
          this.cerrarVisorPDF();
          return;
        }
        
        // Si el tipo del blob no coincide, reconstruir el blob con el tipo correcto
        if (documento.blobData.type !== tipoArchivo) {
          console.warn('⚠️ Tipo MIME incorrecto en blob, reconstruyendo...');
          const newBlob = new Blob([documento.blobData], { type: tipoArchivo });
          documento.blobData = newBlob;
          
          // Recrear la URL temporal
          if (documento.urlTemporal) {
            window.URL.revokeObjectURL(documento.urlTemporal);
          }
          documento.urlTemporal = window.URL.createObjectURL(newBlob);
          url = documento.urlTemporal;
        }
      }
      
      // Solo manejar PDFs e imágenes ya que esos son los únicos permitidos ahora
      let finalUrl = url;
      
      if (esPDF) {
        // Para PDFs, agregar parámetros de visualización
        finalUrl = url + '#view=FitH&toolbar=1&navpanes=0&scrollbar=1';
        console.log('📄 Configurando visualización de PDF');
      } else if (esImagen) {
        console.log('🖼️ Configurando visualización de imagen');
      }
      
      this.urlDocumento = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      this.cargandoPDF = false;
      console.log('✅ Documento cargado para visualización:', nombreArchivo);
      
    } catch (error) {
      console.error('❌ Error al preparar visualización:', error);
      this.cargandoPDF = false;
      alert('Error al preparar la visualización del documento. Intente descargarlo directamente.');
      this.cerrarVisorPDF();
    }
  }

  private intentarCargarConURL(documento: any): void {
    try {
      const documentUrl = this.createDocumentUrl(documento);
      // Convertir SafeResourceUrl a string para usarlo en prepararVisualizacionSegunTipo
      const urlString = documentUrl.toString().replace('unsafe:', '');
      this.prepararVisualizacionSegunTipo(documento, urlString);
      console.log('✅ Usando URL directa como fallback');
    } catch (urlError) {
      console.error('❌ Error también con URL directa:', urlError);
      this.cargandoPDF = false;
      alert('Error al cargar el documento. El archivo podría no estar disponible.');
      this.cerrarVisorPDF();
    }
  }

  private createDocumentUrl(documento: any): SafeResourceUrl {
    console.log('🔍 Creando URL para documento:', documento);
    
    // Obtener el ID del documento de diferentes propiedades posibles
    const documentoId = documento.documentoPostulanteID || documento.id || documento.documentoID;
    
    // Verificar si el documento tiene la información necesaria
    if (!documento || (!documento.rutaArchivo && !documentoId && !documento.nombreArchivo)) {
      throw new Error('Documento inválido: falta información de ruta, ID o nombre de archivo');
    }
    
    const baseUrl = this.getBaseApiUrl();
    
    // Opción 1: Si tienes la ruta directa del archivo
    if (documento.rutaArchivo) {
      const documentUrl = `${baseUrl}/uploads/${documento.rutaArchivo}`;
      console.log('📄 URL del documento por ruta:', documentUrl);
      return this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
    }
    
    // Opción 2: Si tienes un ID del documento (documentoPostulanteID)
    if (documentoId) {
      const documentUrl = `${baseUrl}/documento-postulante/${documentoId}/archivo`;
      console.log('📄 URL del documento por ID:', documentUrl);
      return this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
    }
    
    // Opción 3: Construir URL basada en nombre de archivo (si tienes estructura de uploads)
    if (documento.nombreArchivo) {
      const documentUrl = `${baseUrl}/uploads/documentos/${documento.nombreArchivo}`;
      console.log('📄 URL del documento por nombre:', documentUrl);
      return this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
    }
    
    // Opción 4: URL de prueba para desarrollo
    const testPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    console.warn('⚠️ Usando PDF de prueba - implementar lógica real');
    return this.sanitizer.bypassSecurityTrustResourceUrl(testPdfUrl);
  }

  private getBaseApiUrl(): string {
    // Obtener la URL base de la API desde el servicio
    return this.formulariosService['apiUrl'] || 'http://localhost:3000/api';
  }

  cerrarVisorPDF(): void {
    this.mostrarVisorPDF = false;
    this.documentoActual = null;
    
    // Limpiar URL del blob para evitar memory leaks
    if (this.urlDocumento) {
      const urlString = this.urlDocumento.toString();
      if (urlString.startsWith('blob:')) {
        window.URL.revokeObjectURL(urlString);
      }
    }
    
    this.urlDocumento = null;
    this.cargandoPDF = false;
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  descargarDocumento(documento: any): void {
    console.log('📥 Descargando documento:', documento.nombreArchivo);

    // Si es un archivo descomprimido, usar su blob data
    if (documento.esDescomprimido && documento.blobData) {
      const link = document.createElement('a');
      link.href = documento.urlTemporal;
      link.download = documento.nombreArchivo;
      link.click();
      console.log('✅ Archivo descomprimido descargado exitosamente');
      return;
    }

    const documentoId = documento.documentoPostulanteID || documento.id || documento.documentoID;
    
    if (!documentoId) {
      alert('Error: No se puede identificar el documento para descarga');
      return;
    }

    // Usar el servicio para descargar el documento
    this.postulantesService.getDocumentoArchivo(documentoId).subscribe({
      next: (blob: Blob) => {
        // Crear y descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.nombreArchivo || `documento_${documentoId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('✅ Documento descargado exitosamente');
      },
      error: (error: any) => {
        console.error('❌ Error al descargar documento:', error);
        alert('Error al descargar el documento. Por favor, intente nuevamente.');
      }
    });
  }

  async descargarTodosDocumentos(): Promise<void> {
    const totalDocumentos = this.getTotalDocumentosParaDescarga();
    
    if (totalDocumentos === 0) {
      alert('No hay documentos para descargar');
      return;
    }

    console.log('📥 Creando ZIP con todos los documentos de:', this.postulanteSeleccionadoDoc?.nombres);
    
    // Decidir qué documentos incluir en el ZIP basado en si hay archivos descomprimidos
    let todosLosDocumentos: any[] = [];
    
    if (this.archivosDescomprimidos.length > 0) {
      // Si hay archivos descomprimidos, incluir esos en el ZIP
      todosLosDocumentos = [...this.archivosDescomprimidos];
      console.log('📦 Creando ZIP con archivos descomprimidos únicamente');
    } else {
      // Si no hay archivos descomprimidos, incluir los documentos originales
      todosLosDocumentos = [...this.documentosPostulante];
      console.log('📦 Creando ZIP con documentos originales');
    }

    try {
      // Crear el ZIP usando JSZip
      const zip = new JSZip.default();
      let archivosAgregados = 0;
      const totalArchivos = todosLosDocumentos.length;

      console.log(`📦 Iniciando creación de ZIP con ${totalArchivos} documentos`);

      // Agregar cada documento al ZIP
      for (const documento of todosLosDocumentos) {
        try {
          console.log(`📄 Procesando documento ${archivosAgregados + 1}/${totalArchivos}: ${documento.nombreArchivo}`);
          
          let contenidoArchivo: Blob;
          
          // Si es un archivo descomprimido, usar su blob data
          if (documento.esDescomprimido && documento.blobData) {
            contenidoArchivo = documento.blobData;
            console.log(`✅ Usando blob data para: ${documento.nombreArchivo}`);
          } else {
            // Para documentos originales, descargar el contenido
            const documentoId = documento.documentoPostulanteID || documento.id || documento.documentoID;
            
            if (!documentoId) {
              console.error(`❌ No se puede identificar el documento: ${documento.nombreArchivo}`);
              continue;
            }

            // Descargar el documento como blob
            contenidoArchivo = await new Promise<Blob>((resolve, reject) => {
              this.postulantesService.getDocumentoArchivo(documentoId).subscribe({
                next: (blob: Blob) => resolve(blob),
                error: (error: any) => {
                  console.error(`❌ Error al descargar documento ${documento.nombreArchivo}:`, error);
                  reject(error);
                }
              });
            });
          }

          // Agregar archivo al ZIP con un nombre único
          const nombreArchivo = documento.nombreArchivo || `documento_${archivosAgregados + 1}.pdf`;
          zip.file(nombreArchivo, contenidoArchivo);
          archivosAgregados++;
          console.log(`✅ Archivo agregado al ZIP: ${nombreArchivo}`);
          
        } catch (error) {
          console.error(`❌ Error al procesar documento ${documento.nombreArchivo}:`, error);
          // Continuar con el siguiente archivo
        }
      }

      if (archivosAgregados === 0) {
        alert('No se pudieron procesar los documentos para crear el ZIP');
        return;
      }

      console.log(`📦 Generando archivo ZIP con ${archivosAgregados} documentos...`);

      // Generar el ZIP
      const contenidoZip = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // Crear nombre del archivo ZIP
      const nombrePostulante = `${this.postulanteSeleccionadoDoc?.nombres || 'Postulante'}_${this.postulanteSeleccionadoDoc?.apellidoPaterno || ''}`.replace(/\s+/g, '_');
      const fechaActual = new Date().toISOString().split('T')[0];
      const nombreZip = `Documentos_${nombrePostulante}_${fechaActual}.zip`;

      // Descargar el ZIP
      const url = window.URL.createObjectURL(contenidoZip);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreZip;
      link.click();
      window.URL.revokeObjectURL(url);

      console.log(`🎉 ZIP creado y descargado exitosamente: ${nombreZip}`);
      
    } catch (error) {
      console.error('❌ Error al crear el archivo ZIP:', error);
      alert('Error al crear el archivo ZIP. Por favor, intente nuevamente.');
    }
  }

  // Método para descargar documentos seleccionados
  descargarDocumentosSeleccionados(): void {
    const postulantesSeleccionados = this.getPostulantesSeleccionados();
    
    console.log('🔍 Debug - Postulantes seleccionados:', postulantesSeleccionados);
    console.log('🔍 Debug - Estado de selección:', this.postulantesSeleccionados);
    
    if (postulantesSeleccionados.length === 0) {
      alert('No hay postulantes seleccionados');
      return;
    }

    if (!this.postulacionSeleccionada?.id) {
      alert('Error: No se puede identificar la postulación');
      return;
    }

    // Obtener IDs de los postulantes seleccionados - manejar UUIDs
    const idsSeleccionados = postulantesSeleccionados
      .map(p => {
        // Intentar diferentes propiedades de ID que puedan existir
        const id = p.id || p.postulanteID || (p as any).postulante_id;
        console.log('🔍 Debug - Postulante completo:', p);
        console.log('🔍 Debug - ID encontrado:', id, 'tipo:', typeof id);
        
        // Manejar diferentes tipos de ID
        if (id === undefined || id === null) return null;
        
        // Si ya es un número, usarlo directamente
        if (typeof id === 'number') return id;
        
        // Si es string, puede ser UUID o número
        if (typeof id === 'string') {
          // Si parece ser un UUID (contiene guiones), usarlo como string
          if (id.includes('-')) {
            return id;
          }
          // Si no, intentar convertir a número
          const numId = parseInt(id, 10);
          return isNaN(numId) ? id : numId; // Si no se puede convertir, usar como string
        }
        
        return null;
      })
      .filter((id): id is string | number => id !== null);
    
    console.log('📤 Enviando IDs seleccionados:', idsSeleccionados);
    console.log('📊 Total de postulantes seleccionados:', postulantesSeleccionados.length);
    console.log('📊 Total de IDs válidos:', idsSeleccionados.length);
    
    // Validación adicional
    if (idsSeleccionados.length === 0) {
      alert('Error: No se pudieron obtener los IDs de los postulantes seleccionados');
      return;
    }
    
    if (idsSeleccionados.length !== postulantesSeleccionados.length) {
      console.warn('⚠️ Advertencia: Algunos IDs no se pudieron procesar correctamente');
    }
    
    // Usar el nuevo endpoint específico para postulantes seleccionados
    const dto: DescargarDocumentosPostulantesDto = {
      formularioId: this.postulacionSeleccionada.id!,
      postulanteIds: idsSeleccionados
    };
    
    console.log('📦 DTO final a enviar:', dto);
    
    this.formulariosService.descargarDocumentosPostulantes(dto).subscribe({
      next: (response) => {
        console.log('Descarga de documentos seleccionados exitosa:', response);
        
        // Crear y descargar el archivo ZIP
        const blob = new Blob([response], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Documentos_Seleccionados_${this.postulacionSeleccionada?.cargo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar documentos seleccionados:', error);
        let mensajeError = 'Error al descargar documentos de postulantes seleccionados';
        
        if (error.error?.message) {
          mensajeError = error.error.message;
        }
        
        alert(mensajeError);
      }
    });
  }

      // Método mejorado para exportar a Excel profesional
  async exportarExcelPostulantes(): Promise<void> {
    if (this.postulantesFiltrados.length === 0) {
      return;
    }

    // Obtener fecha actual para el reporte
    const fechaReporte = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Preparar datos con formato mejorado para Excel
    const datosExcel = this.postulantesFiltrados.map((postulante, index) => ({
      'N°': index + 1,
      'Nombre Completo': `${postulante.nombres} ${postulante.apellidoPaterno}`.trim(),
      'RUT': postulante.rut,
      'Email': postulante.email,
      'Teléfono': postulante.telefono || 'No especificado',
      'Fecha de Postulación': this.formatearFecha(postulante.fechaRegistro),
      'Hora de Postulación': this.formatearHora(postulante.fechaRegistro),
      'Documentos Adjuntos': postulante.documentos?.length || 0,
      'Estado de Selección': this.postulantesSeleccionados[postulante.postulanteID?.toString() || ''] ? 'Seleccionado' : 'No seleccionado'
    }));

    // Crear header con información del reporte
    let xlsContent = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #1976D2, #42A5F5); color: white; padding: 20px; text-align: center; }
          .logo { font-size: 24px; margin-bottom: 10px; }
          .title { font-size: 20px; font-weight: bold; margin: 10px 0; }
          .info { background: #F5F5F5; padding: 15px; margin: 10px 0; }
          .info-item { margin: 5px 0; font-weight: bold; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background: #424242; color: white; padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; }
          td { padding: 8px; border: 1px solid #ddd; text-align: left; }
          .selected { background: #E8F5E8 !important; }
          .number { text-align: center; font-weight: bold; }
          .estado-seleccionado { color: #2E7D32; font-weight: bold; }
          .estado-no-seleccionado { color: #757575; font-weight: bold; }
          tr:nth-child(even) { background: #F8F9FA; }
          .stats { background: #E3F2FD; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .stats h3 { color: #1976D2; margin-top: 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏛️ MUNICIPALIDAD</div>
          <div class="title">REPORTE DE POSTULANTES</div>
        </div>
        
        <div class="info">
          <div class="info-item">Cargo: ${this.postulacionSeleccionada?.cargo || 'No especificado'}</div>
          <div class="info-item">Período: ${this.formatearFecha(this.postulacionSeleccionada?.fechaInicio)} - ${this.formatearFecha(this.postulacionSeleccionada?.fechaTermino)}</div>
          <div class="info-item">Total de Postulantes: ${this.postulantesFiltrados.length}</div>
          <div class="info-item">Postulantes Seleccionados: ${this.contarSeleccionados()}</div>
          <div class="info-item">Fecha del Reporte: ${fechaReporte}</div>
        </div>

        <table>
          <thead>
            <tr>`;

    // Agregar headers
    const headers = Object.keys(datosExcel[0]);
    headers.forEach(header => {
      xlsContent += `<th>${header}</th>`;
    });
    xlsContent += `</tr></thead><tbody>`;

    // Agregar datos
    datosExcel.forEach((fila, index) => {
      const postulante = this.postulantesFiltrados[index];
      const estaSeleccionado = postulante && this.postulantesSeleccionados[postulante.postulanteID?.toString() || ''];
      const rowClass = estaSeleccionado ? 'selected' : '';
      
      xlsContent += `<tr class="${rowClass}">`;
      headers.forEach((header, colIndex) => {
        const valor = fila[header as keyof typeof fila];
        let cellClass = '';
        
        if (header === 'N°') {
          cellClass = 'number';
        } else if (header === 'Estado de Selección') {
          cellClass = estaSeleccionado ? 'estado-seleccionado' : 'estado-no-seleccionado';
        }
        
        xlsContent += `<td class="${cellClass}">${valor}</td>`;
      });
      xlsContent += `</tr>`;
    });

    // Agregar estadísticas
    xlsContent += `</tbody></table>

        <div class="stats">
          <h3>📊 ESTADÍSTICAS DEL PROCESO</h3>
          <p><strong>Postulantes con documentos:</strong> ${this.postulantesFiltrados.filter(p => (p.documentos?.length || 0) > 0).length}</p>
          <p><strong>Postulantes sin documentos:</strong> ${this.postulantesFiltrados.filter(p => (p.documentos?.length || 0) === 0).length}</p>
          <p><strong>Promedio de documentos por postulante:</strong> ${Math.round((this.postulantesFiltrados.reduce((sum, p) => sum + (p.documentos?.length || 0), 0) / this.postulantesFiltrados.length) * 100) / 100}</p>
          <p><strong>Porcentaje de seleccionados:</strong> ${Math.round((this.contarSeleccionados() / this.postulantesFiltrados.length) * 100)}%</p>
        </div>

        <div class="footer">
          <p>Reporte generado automáticamente por el Sistema Municipal</p>
          <p>Fecha y hora: ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </body>
      </html>`;

    // Crear y descargar archivo
    const blob = new Blob([xlsContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Postulantes_${this.postulacionSeleccionada?.cargo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);

    console.log(`Excel profesional generado sin dependencias externas`);
  }

  // Método auxiliar para formatear hora
  private formatearHora(fecha: string | Date | undefined): string {
    if (!fecha) return '';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    if (isNaN(fechaObj.getTime())) {
      return '';
    }
    
    return fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método auxiliar para formatear tamaño de archivo
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Métodos para aprobar y rechazar postulaciones
  confirmarAprobarPostulaciones(): void {
    if (!this.hayPostulantesSeleccionadosParaProcesar()) {
      return;
    }
    
    this.mostrarConfirmacionAprobar = true;
  }

  confirmarRechazarPostulaciones(): void {
    if (!this.hayPostulantesSeleccionadosParaProcesar()) {
      return;
    }
    
    this.mostrarConfirmacionRechazar = true;
    this.motivoRechazo = ''; // Limpiar motivo anterior
  }

  cerrarConfirmaciones(): void {
    this.mostrarConfirmacionAprobar = false;
    this.mostrarConfirmacionRechazar = false;
    this.motivoRechazo = '';
    this.enviandoCorreos = false;
  }

  // Métodos para modal de resultados
  mostrarResultado(tipo: 'success' | 'error' | 'warning', titulo: string, mensaje: string, detalles?: string[]): void {
    this.resultadoOperacion = {
      tipo,
      titulo,
      mensaje,
      detalles
    };
    this.mostrarModalResultado = true;
  }

  cerrarModalResultado(): void {
    this.mostrarModalResultado = false;
    this.resultadoOperacion = null;
  }

  enviarAprobaciones(): void {
    if (!this.hayPostulantesSeleccionadosParaProcesar() || this.enviandoCorreos || !this.postulacionSeleccionada) {
      return;
    }

    this.enviandoCorreos = true;
    const postulantesSeleccionados = this.getPostulantesSeleccionadosParaProcesar();
    
    // Obtener IDs como strings usando función unificada
    const idsPostulantesString = postulantesSeleccionados
      .map(p => this.getPostulanteId(p))
      .filter((id): id is string => id !== null);

    // Obtener IDs para el servicio de correos (manteniendo lógica original para compatibilidad)
    const idsPostulantes = postulantesSeleccionados
      .map(p => {
        const id = this.getPostulanteId(p);
        if (!id) return null;
        
        // Si es un UUID (contiene guiones), usarlo como string
        if (id.includes('-')) {
          return id;
        }
        
        // Si no, intentar convertir a número
        const numId = parseInt(id, 10);
        return isNaN(numId) ? id : numId;
      })
      .filter((id): id is string | number => id !== null);

    console.log('📤 Procesando aprobaciones para IDs String:', idsPostulantesString);
    console.log('📤 Procesando aprobaciones para IDs Correos:', idsPostulantes);

    // PASO 1: Actualizar estado de los postulantes a "Seleccionado"
    const updateEstadoDto = {
      postulantesIds: idsPostulantesString,
      estado: 'Seleccionado'
    };

    this.postulantesService.updateEstadoLote(updateEstadoDto).subscribe({
      next: (resultadoEstado) => {
        console.log('✅ Estados actualizados:', resultadoEstado);
        
        // Actualizar los estados en la vista local inmediatamente
        postulantesSeleccionados.forEach(postulante => {
          const index = this.postulantes.findIndex(p => this.sonElMismoPostulante(p, postulante));
          if (index !== -1) {
            const estadoAnterior = this.postulantes[index].estado;
            // Crear nuevo objeto para forzar detección de cambios
            this.postulantes[index] = { ...this.postulantes[index], estado: 'Seleccionado' };
            console.log(`🔄 Estado actualizado - ${postulante.nombres} ${postulante.apellidoPaterno}: ${estadoAnterior} → Seleccionado`);
          }
        });
        
        // Forzar actualización completa de la vista
        this.forzarActualizacionVista();
        console.log('✅ Vista actualizada - Seleccionados:', postulantesSeleccionados.length);

        // PASO 2: Enviar correos de selección
        const enviarAprobacionesDto: EnviarAprobacionesDto = {
          formularioId: this.postulacionSeleccionada!.id!,
          postulanteIds: idsPostulantes
        };

        this.formulariosService.enviarAprobaciones(enviarAprobacionesDto).subscribe({
          next: (respuesta: CorreoRespuesta) => {
            // Crear mensaje de éxito detallado
            const nombresPostulantes = postulantesSeleccionados
              .map(p => `${p.nombres} ${p.apellidoPaterno}`);
            
            const detalles = [
              `Estados actualizados: ${(resultadoEstado as any).affected || postulantesSeleccionados.length} postulantes marcados como "Seleccionado"`,
              `Correos enviados: ${respuesta.enviados}`,
              ...(respuesta.fallidos > 0 ? [`Correos fallidos: ${respuesta.fallidos}`] : []),
              '',
              'Postulantes procesados:',
              ...nombresPostulantes,
              '',
              'Cada postulante ha recibido:',
              '• Actualización de estado a "Seleccionado"',
              '• Confirmación de selección por correo',
              '• Pasos a seguir en el proceso',
              '• Información de contacto',
              '• Fechas importantes'
            ];
            
            this.mostrarResultado('success', 'Proceso de Selección Completado', 
              `Se seleccionaron ${(resultadoEstado as any).affected || postulantesSeleccionados.length} postulantes y se enviaron ${respuesta.enviados} correos exitosamente.`, detalles);
            
            // Limpiar selecciones y cerrar modales
            this.postulantesSeleccionados = {};
            this.cerrarConfirmaciones();
            this.enviandoCorreos = false;
            
            // Actualización adicional para asegurar que la vista se refleje
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 100);
          },
          error: (error) => {
            console.error('Error al enviar correos de selección:', error);
            
            const detallesError = [
              `Estados actualizados correctamente: ${(resultadoEstado as any).affected || postulantesSeleccionados.length} postulantes`,
              'Sin embargo, hubo un error al enviar los correos de notificación.',
              '',
              'Error en correos:',
              error.error?.message || 'Error desconocido al enviar correos',
              '',
              'Los postulantes han sido seleccionados pero no recibieron notificación por correo.',
              'Puede notificarles manualmente o intentar reenviar desde el sistema.'
            ];
            
            this.mostrarResultado('warning', 'Selección Completada con Advertencias', 
              'Los postulantes fueron seleccionados pero no se pudieron enviar las notificaciones por correo.', detallesError);
            
            this.postulantesSeleccionados = {};
            this.cerrarConfirmaciones();
            this.enviandoCorreos = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al actualizar estados:', error);
        
        const detallesError = [
          error.error?.message || 'Error desconocido al actualizar estados',
          '',
          'No se procesó ninguna selección.',
          'Posibles soluciones:',
          '• Verifique su conexión a internet',
          '• Intente nuevamente en unos momentos',
          '• Contacte al administrador del sistema si el problema persiste'
        ];
        
        this.mostrarResultado('error', 'Error al Procesar Selecciones', 
          'No se pudieron actualizar los estados de los postulantes.', detallesError);
        this.enviandoCorreos = false;
      }
    });
  }

  enviarRechazos(): void {
    if (!this.hayPostulantesSeleccionadosParaProcesar() || this.enviandoCorreos || !this.postulacionSeleccionada) {
      return;
    }

    this.enviandoCorreos = true;
    const postulantesSeleccionados = this.getPostulantesSeleccionadosParaProcesar();
    
    // Obtener IDs como strings usando función unificada
    const idsPostulantesString = postulantesSeleccionados
      .map(p => this.getPostulanteId(p))
      .filter((id): id is string => id !== null);

    // Obtener IDs para el servicio de correos (manteniendo lógica original para compatibilidad)
    const idsPostulantes = postulantesSeleccionados
      .map(p => {
        const id = this.getPostulanteId(p);
        if (!id) return null;
        
        // Si es un UUID (contiene guiones), usarlo como string
        if (id.includes('-')) {
          return id;
        }
        
        // Si no, intentar convertir a número
        const numId = parseInt(id, 10);
        return isNaN(numId) ? id : numId;
      })
      .filter((id): id is string | number => id !== null);

    console.log('📤 Procesando rechazos para IDs String:', idsPostulantesString);
    console.log('📤 Procesando rechazos para IDs Correos:', idsPostulantes);

    // PASO 1: Actualizar estado de los postulantes a "No Seleccionado"
    const updateEstadoDto = {
      postulantesIds: idsPostulantesString,
      estado: 'No Seleccionado'
    };

    this.postulantesService.updateEstadoLote(updateEstadoDto).subscribe({
      next: (resultadoEstado) => {
        console.log('✅ Estados actualizados:', resultadoEstado);
        
        // Actualizar los estados en la vista local inmediatamente
        postulantesSeleccionados.forEach(postulante => {
          const index = this.postulantes.findIndex(p => this.sonElMismoPostulante(p, postulante));
          if (index !== -1) {
            const estadoAnterior = this.postulantes[index].estado;
            // Crear nuevo objeto para forzar detección de cambios
            this.postulantes[index] = { ...this.postulantes[index], estado: 'No Seleccionado' };
            console.log(`🔄 Estado actualizado - ${postulante.nombres} ${postulante.apellidoPaterno}: ${estadoAnterior} → No Seleccionado`);
          }
        });
        
        // Forzar actualización completa de la vista
        this.forzarActualizacionVista();
        console.log('✅ Vista actualizada - No Seleccionados:', postulantesSeleccionados.length);

        // PASO 2: Enviar correos de no selección
        const enviarRechazosDto: EnviarRechazosDto = {
          formularioId: this.postulacionSeleccionada!.id!,
          postulanteIds: idsPostulantes,
          motivo: this.motivoRechazo.trim() || undefined
        };

        this.formulariosService.enviarRechazos(enviarRechazosDto).subscribe({
          next: (respuesta: CorreoRespuesta) => {
            // Crear mensaje de éxito detallado
            const nombresPostulantes = postulantesSeleccionados
              .map(p => `${p.nombres} ${p.apellidoPaterno}`);
            
            const motivoTexto = this.motivoRechazo 
              ? `• Motivo especificado: "${this.motivoRechazo}"` 
              : '• Sin motivo específico';
            
            const detalles = [
              `Estados actualizados: ${(resultadoEstado as any).affected || postulantesSeleccionados.length} postulantes marcados como "No Seleccionado"`,
              `Correos enviados: ${respuesta.enviados}`,
              ...(respuesta.fallidos > 0 ? [`Correos fallidos: ${respuesta.fallidos}`] : []),
              '',
              'Postulantes procesados:',
              ...nombresPostulantes,
              '',
              'Cada postulante ha recibido:',
              '• Actualización de estado a "No Seleccionado"',
              '• Notificación de no selección por correo',
              motivoTexto,
              '• Agradecimiento por su participación',
              '• Información sobre futuros procesos'
            ];
            
            this.mostrarResultado('success', 'Proceso de No Selección Completado', 
              `Se marcaron como no seleccionados ${(resultadoEstado as any).affected || postulantesSeleccionados.length} postulantes y se enviaron ${respuesta.enviados} correos exitosamente.`, detalles);
            
            // Limpiar selecciones y cerrar modales
            this.postulantesSeleccionados = {};
            this.cerrarConfirmaciones();
            this.motivoRechazo = ''; // Limpiar motivo
            this.enviandoCorreos = false;
            
            // Actualización adicional para asegurar que la vista se refleje
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 100);
          },
          error: (error) => {
            console.error('Error al enviar correos de no selección:', error);
            
            const detallesError = [
              `Estados actualizados correctamente: ${(resultadoEstado as any).affected || postulantesSeleccionados.length} postulantes`,
              'Sin embargo, hubo un error al enviar los correos de notificación.',
              '',
              'Error en correos:',
              error.error?.message || 'Error desconocido al enviar correos',
              '',
              'Los postulantes han sido marcados como no seleccionados pero no recibieron notificación por correo.',
              'Puede notificarles manualmente o intentar reenviar desde el sistema.'
            ];
            
            this.mostrarResultado('warning', 'No Selección Completada con Advertencias', 
              'Los postulantes fueron marcados como no seleccionados pero no se pudieron enviar las notificaciones por correo.', detallesError);
            
            this.postulantesSeleccionados = {};
            this.cerrarConfirmaciones();
            this.motivoRechazo = '';
            this.enviandoCorreos = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al actualizar estados:', error);
        
        const detallesError = [
          error.error?.message || 'Error desconocido al actualizar estados',
          '',
          'No se procesó ninguna no selección.',
          'Posibles soluciones:',
          '• Verifique su conexión a internet',
          '• Intente nuevamente en unos momentos',
          '• Contacte al administrador del sistema si el problema persiste'
        ];
        
        this.mostrarResultado('error', 'Error al Procesar No Selecciones', 
          'No se pudieron actualizar los estados de los postulantes.', detallesError);
        this.enviandoCorreos = false;
      }
    });
  }

  // Método para obtener el logo de la empresa actual
  private async getLogoEmpresa(): Promise<string | null> {
    try {
      // Primero intentar obtener el logo desde la configuración actual del tema
      const response = await fetch('/assets/config/current-theme.json');
      const config = await response.json();
      
      // Si existe un logo configurado, usarlo
      if (config.logo) {
        const logoResponse = await fetch(`/assets/images/${config.logo}`);
        const blob = await logoResponse.blob();
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
      
      // Si no hay logo configurado, usar uno por defecto
      const defaultLogoResponse = await fetch('/assets/images/logo-ejemplo.png');
      const blob = await defaultLogoResponse.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.warn('No se pudo cargar el logo de la empresa:', error);
      return null;
    }
  }

  // Métodos auxiliares para filtros de archivos
  getArchivosDescomprimidosPorDocumento(documento: any): any[] {
    return this.archivosDescomprimidos.filter(a => a.archivoOriginal === documento);
  }

  getArchivosIndividuales(): any[] {
    return this.archivosDescomprimidos.filter(a => !a.esDescomprimido);
  }

  // Método para contar correctamente los documentos que se van a descargar
  getTotalDocumentosParaDescarga(): number {
    if (this.archivosDescomprimidos.length > 0) {
      // Si hay archivos descomprimidos, solo contar esos (no los ZIP originales)
      return this.archivosDescomprimidos.length;
    } else {
      // Si no hay archivos descomprimidos, contar los documentos originales
      return this.documentosPostulante.length;
    }
  }

  // Métodos de manejo de errores del iframe
  manejarErrorVisualizacion(): void {
    console.error('❌ Error en iframe de visualización');
    this.cargandoPDF = false;
    this.urlDocumento = null;
    alert('Error al cargar el documento en el visor. Intente descargarlo directamente.');
  }

  verificarCargaDocumento(): void {
    console.log('✅ Documento cargado en iframe exitosamente');
    this.cargandoPDF = false;
  }

  // Método auxiliar para debug
  debugPostulante(postulante: Postulante): string {
    return JSON.stringify(postulante, null, 2);
  }

  // Método para validar si un blob contiene datos válidos
  private async validarBlob(blob: Blob, tipoEsperado: string): Promise<boolean> {
    try {
      // Leer una pequeña parte del blob para verificar su contenido
      const arrayBuffer = await blob.slice(0, 1024).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      if (tipoEsperado.includes('pdf')) {
        // Un PDF debe comenzar con %PDF
        const signature = String.fromCharCode(...uint8Array.slice(0, 4));
        const isValidPDF = signature === '%PDF';
        console.log(`🔍 Validación PDF - Signature: "${signature}", Valid: ${isValidPDF}`);
        return isValidPDF;
      } else if (tipoEsperado.startsWith('image/')) {
        // Validar firmas de imagen comunes
        const first4Bytes = Array.from(uint8Array.slice(0, 4));
        const first8Bytes = Array.from(uint8Array.slice(0, 8));
        
        // JPEG: FF D8 FF
        if (first4Bytes[0] === 0xFF && first4Bytes[1] === 0xD8 && first4Bytes[2] === 0xFF) {
          console.log('🔍 Validación: JPEG válido');
          return true;
        }
        
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (first8Bytes[0] === 0x89 && first8Bytes[1] === 0x50 && 
            first8Bytes[2] === 0x4E && first8Bytes[3] === 0x47) {
          console.log('🔍 Validación: PNG válido');
          return true;
        }
        
        // GIF: GIF87a o GIF89a
        const gifSignature = String.fromCharCode(...uint8Array.slice(0, 6));
        if (gifSignature === 'GIF87a' || gifSignature === 'GIF89a') {
          console.log('🔍 Validación: GIF válido');
          return true;
        }
        
        console.log('🔍 Validación imagen - Primeros bytes:', first8Bytes.map(b => '0x' + b.toString(16)).join(' '));
      }
      
      return true; // Por defecto asumir válido para otros tipos
    } catch (error) {
      console.error('❌ Error al validar blob:', error);
      return false;
    }
  }

  // Métodos para manejo de estados
  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'seleccionado':
        return 'estado-seleccionado';
      case 'no seleccionado':
        return 'estado-no-seleccionado';
      case 'en revisión':
        return 'estado-en-revision';
      case 'retirado':
        return 'estado-retirado';
      case 'pendiente':
      default:
        return 'estado-pendiente';
    }
  }

  // Función para obtener el ID correcto del postulante
  private getPostulanteId(postulante: Postulante): string | null {
    // Prioridad: postulanteID > id > null
    const id = postulante.postulanteID || postulante.id?.toString();
    console.log(`🔍 getPostulanteId para ${postulante.nombres}: postulanteID=${postulante.postulanteID}, id=${postulante.id}, resultado=${id}`);
    return id || null;
  }

  // Función pública para usar en el template (sin logs para mejor performance)
  getPostulanteIdForTemplate(postulante: Postulante): string {
    return postulante.postulanteID || postulante.id?.toString() || '';
  }

  // Función para comparar si dos postulantes son el mismo
  private sonElMismoPostulante(p1: Postulante, p2: Postulante): boolean {
    const id1 = this.getPostulanteId(p1);
    const id2 = this.getPostulanteId(p2);
    return id1 !== null && id2 !== null && id1 === id2;
  }

  // Función trackBy para optimizar renderizado de ngFor (simplificada para evitar problemas de contexto)
  trackByPostulante = (index: number, postulante: Postulante): any => {
    return postulante.postulanteID || postulante.id || index;
  }

  // Método para forzar actualización completa de la vista
  private forzarActualizacionVista(): void {
    // Crear nuevo array para forzar detección de cambios
    this.postulantes = [...this.postulantes];
    this.filtrarPostulantes();
    this.cdr.detectChanges();
    
    // Actualización adicional con delay
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }

  // Marcar un postulante individual como "En Revisión"
  marcarEnRevision(postulante: Postulante): void {
    const id = this.getPostulanteId(postulante);
    if (!id) {
      console.error('No se pudo obtener el ID del postulante');
      return;
    }

    const updateEstadoDto = {
      postulantesIds: [id],
      estado: 'En Revisión'
    };
    
    console.log(`📤 Marcando como En Revisión - ID: ${id} para ${postulante.nombres}`);

    this.postulantesService.updateEstadoLote(updateEstadoDto).subscribe({
      next: (resultado) => {
        // Actualizar el estado local inmediatamente
        const index = this.postulantes.findIndex(p => this.sonElMismoPostulante(p, postulante));
        if (index !== -1) {
          const estadoAnterior = this.postulantes[index].estado;
          // Crear nuevo objeto para forzar detección de cambios
          this.postulantes[index] = { ...this.postulantes[index], estado: 'En Revisión' };
          console.log(`🔄 Estado actualizado - ${postulante.nombres} ${postulante.apellidoPaterno}: ${estadoAnterior} → En Revisión`);
          
          // Forzar actualización completa de la vista
          this.forzarActualizacionVista();
          console.log('✅ Vista actualizada - En Revisión');
        }
        
        console.log(`✅ Postulante ${postulante.nombres} ${postulante.apellidoPaterno} marcado como "En Revisión"`);
      },
      error: (error) => {
        console.error('Error al marcar postulante en revisión:', error);
        alert('Error al actualizar el estado del postulante. Intente nuevamente.');
      }
    });
  }
} 