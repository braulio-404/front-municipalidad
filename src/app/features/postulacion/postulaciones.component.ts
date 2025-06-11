import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Formulario } from '../../interfaces/formulario.interface';
import { FormulariosService } from '../../servicios/formularios.service';
import { ThemeService } from '../../servicios/theme.service';

@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './postulaciones.component.html',
  styleUrls: ['./postulaciones.component.scss']
})
export class PostulacionesComponent implements OnInit {
  postulaciones: Formulario[] = [];
  postulacionesOriginales: Formulario[] = [];
  postulacionesFiltradas: Formulario[] = [];
  filtroOrden: string = 'recientes';
  filtroNombre: string = '';
  cargando: boolean = false;
  error: string | null = null;
  municipalityEmail: string = 'rrhh@conchali.cl'; // fallback

  // Variables para paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 0;
  
  // Opciones para elementos por página
  opcionesElementosPorPagina: number[] = [5, 10, 20, 30];

  constructor(
    private formulariosService: FormulariosService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadThemeData();
    this.cargarPostulaciones();
  }

  private loadThemeData(): void {
    try {
      this.municipalityEmail = this.themeService.getMunicipalityEmail();
    } catch (error) {
      console.warn('Error loading theme data, using fallbacks:', error);
      // El valor fallback ya está definido arriba
    }
  }

  get postulacionesActivas() {
    return this.postulacionesFiltradas.filter(p => p.estado === 'Activo');
  }

  get tienePostulacionesActivas() {
    return this.postulacionesActivas.length > 0;
  }

  // Getter para las postulaciones que se muestran en la página actual
  get postulacionesEnPaginaActual() {
    return this.postulaciones;
  }

  cargarPostulaciones() {
    this.cargando = true;
    this.error = null;
    
    // Llama a GET /api/formularios
    // Asegúrate de que tu backend tenga: @Controller('api/formularios') 
    // o un prefijo global /api configurado
    this.formulariosService.findAll().subscribe({
      next: (formularios: Formulario[]) => {
        // Convertir fechas de string a Date si es necesario
        this.postulacionesOriginales = formularios.map(p => ({
          ...p,
          fechaCreacion: new Date(p.fechaInicio), // Usar fechaInicio como fechaCreacion si no existe
          fechaInicio: new Date(p.fechaInicio),
          fechaTermino: new Date(p.fechaTermino)
        }));
        
        this.postulaciones = [...this.postulacionesOriginales];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar formularios:', error);
        this.error = 'Error al cargar las postulaciones. Por favor, intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    // Comenzar con todas las postulaciones originales
    let postulacionesFiltradas = [...this.postulacionesOriginales];
    
    // Aplicar filtro por nombre si hay texto de búsqueda
    if (this.filtroNombre.trim()) {
      postulacionesFiltradas = postulacionesFiltradas.filter(p => 
        p.cargo.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(this.filtroNombre.toLowerCase()))
      );
    }
    
    // Separar activas y inactivas
    const postulacionesActivas = postulacionesFiltradas.filter(p => p.estado === 'Activo');
    const postulacionesInactivas = postulacionesFiltradas.filter(p => p.estado === 'Inactivo');
    
    // Aplicar ordenamiento a ambos grupos según el criterio seleccionado
    if (this.filtroOrden === 'recientes') {
      postulacionesActivas.sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : new Date(a.fechaInicio).getTime();
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : new Date(b.fechaInicio).getTime();
        return fechaB - fechaA;
      });
      postulacionesInactivas.sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : new Date(a.fechaInicio).getTime();
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : new Date(b.fechaInicio).getTime();
        return fechaB - fechaA;
      });
    } else if (this.filtroOrden === 'alfabetico') {
      postulacionesActivas.sort((a, b) => a.cargo.localeCompare(b.cargo));
      postulacionesInactivas.sort((a, b) => a.cargo.localeCompare(b.cargo));
    }
    
    // Combinar: activas primero, luego inactivas
    this.postulacionesFiltradas = [...postulacionesActivas, ...postulacionesInactivas];
    
    // Actualizar paginación
    this.actualizarPaginacion();
  }

  // Métodos de paginación
  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.postulacionesFiltradas.length / this.elementosPorPagina);
    
    // Si la página actual es mayor al total de páginas, ir a la primera
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = 1;
    }
    
    // Si no hay páginas (sin resultados), asegurar que esté en página 1
    if (this.totalPaginas === 0) {
      this.paginaActual = 1;
    }
    
    this.actualizarPostulacionesVisibles();
  }

  actualizarPostulacionesVisibles() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.postulaciones = this.postulacionesFiltradas.slice(inicio, fin);
    
    console.log('Paginación actualizada:', {
      paginaActual: this.paginaActual,
      elementosPorPagina: this.elementosPorPagina,
      totalFiltradas: this.postulacionesFiltradas.length,
      totalPaginas: this.totalPaginas,
      inicio, fin,
      postulacionesVisibles: this.postulaciones.length,
      tieneActivas: this.tienePostulacionesActivas
    });
  }

  // Navegación de páginas
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPostulacionesVisibles();
    }
  }

  paginaAnterior() {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente() {
    this.irAPagina(this.paginaActual + 1);
  }

  get tienePaginaAnterior(): boolean {
    return this.paginaActual > 1;
  }

  // Getter para verificar si hay página siguiente
  get tienePaginaSiguiente(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  // Getter para obtener array de números de página para mostrar
  get numerosPagina(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    
    if (this.totalPaginas <= maxPaginasVisibles) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas alrededor de la actual
      let inicio = Math.max(1, this.paginaActual - 2);
      let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
      
      // Ajustar si estamos cerca del final
      if (fin === this.totalPaginas) {
        inicio = Math.max(1, fin - maxPaginasVisibles + 1);
      }
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    }
    
    return paginas;
  }

  // Reiniciar paginación cuando se aplican filtros
  buscarPorNombre() {
    this.paginaActual = 1; // Resetear a primera página al buscar
    this.aplicarFiltros();
  }

  filtrarPorOrden(orden: string) {
    this.filtroOrden = orden;
    this.paginaActual = 1; // Resetear a primera página al cambiar orden
    this.aplicarFiltros();
  }

  // Cambiar cantidad de elementos por página
  cambiarElementosPorPagina(nuevaCantidad: number) {
    this.elementosPorPagina = nuevaCantidad;
    this.paginaActual = 1; // Resetear a primera página al cambiar cantidad
    this.actualizarPaginacion();
  }

  postular(postulacionId: number | undefined) {
    if (postulacionId) {
      // Navegación al formulario de postulación
      console.log('Navegando a postulación:', postulacionId);
    }
  }

  // Método para recargar postulaciones manualmente
  recargarPostulaciones() {
    this.cargarPostulaciones();
  }
} 