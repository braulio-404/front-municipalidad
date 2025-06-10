import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Formulario } from '../../interfaces/formulario.interface';
import { FormulariosService } from '../../servicios/formularios.service';

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

  // Variables para paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 0;
  
  // Opciones para elementos por página
  opcionesElementosPorPagina: number[] = [5, 10, 20, 30];

  constructor(private formulariosService: FormulariosService) {}

  ngOnInit() {
    this.cargarPostulaciones();
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
        
        // En caso de error, usar datos ficticios como fallback
        this.cargarDatosFicticios();
      }
    });
  }

  private cargarDatosFicticios() {
    // Datos de respaldo en caso de error del backend
    this.postulacionesOriginales = [
      {
        id: 1,
        cargo: 'Desarrollador Full Stack',
        descripcion: 'Buscamos un desarrollador full stack con experiencia en Angular, Node.js y bases de datos. Responsable del desarrollo y mantenimiento de aplicaciones web modernas.',
        fechaCreacion: new Date('2024-01-20'),
        fechaInicio: new Date('2024-01-20'),
        fechaTermino: new Date('2024-02-20'),
        estado: 'Activo'
      },
      {
        id: 2,
        cargo: 'Diseñador UX/UI',
        descripcion: 'Requerimos un diseñador UX/UI con experiencia en diseño de interfaces web y móviles. Conocimientos en Figma, Adobe XD y prototipado.',
        fechaCreacion: new Date('2024-01-18'),
        fechaInicio: new Date('2024-01-18'),
        fechaTermino: new Date('2024-02-18'),
        estado: 'Activo'
      },
      {
        id: 3,
        cargo: 'Ingeniero Civil Geotécnico',
        descripcion: 'Buscamos un Jefe del Departamento de Geotécnica con amplia experiencia para liderar, coordinar y supervisar proyectos geotécnicos de gran envergadura.',
        fechaCreacion: new Date('2024-01-15'),
        fechaInicio: new Date('2024-01-15'),
        fechaTermino: new Date('2024-02-15'),
        estado: 'Activo'
      },
      {
        id: 4,
        cargo: 'Analista de Sistemas',
        descripcion: 'Se requiere analista de sistemas con experiencia en gestión de bases de datos y análisis de requerimientos.',
        fechaCreacion: new Date('2024-01-12'),
        fechaInicio: new Date('2024-01-12'),
        fechaTermino: new Date('2024-02-12'),
        estado: 'Activo'
      },
      {
        id: 5,
        cargo: 'Contador Público',
        descripcion: 'Contador público titulado para área de finanzas municipales. Experiencia mínima 3 años en sector público.',
        fechaCreacion: new Date('2024-01-10'),
        fechaInicio: new Date('2024-01-10'),
        fechaTermino: new Date('2024-02-10'),
        estado: 'Activo'
      },
      {
        id: 6,
        cargo: 'Asistente Social',
        descripcion: 'Asistente social para programas comunitarios y atención ciudadana. Experiencia en trabajo con familias.',
        fechaCreacion: new Date('2024-01-08'),
        fechaInicio: new Date('2024-01-08'),
        fechaTermino: new Date('2024-02-08'),
        estado: 'Activo'
      },
      {
        id: 7,
        cargo: 'Técnico en Informática',
        descripcion: 'Técnico en informática para soporte técnico y mantención de equipos municipales.',
        fechaCreacion: new Date('2024-01-05'),
        fechaInicio: new Date('2024-01-05'),
        fechaTermino: new Date('2024-02-05'),
        estado: 'Activo'
      },
      {
        id: 8,
        cargo: 'Secretaria Ejecutiva',
        descripcion: 'Secretaria ejecutiva bilingüe para apoyo administrativo en alcaldía. Manejo de agenda y correspondencia.',
        fechaCreacion: new Date('2024-01-03'),
        fechaInicio: new Date('2024-01-03'),
        fechaTermino: new Date('2024-02-03'),
        estado: 'Activo'
      },
      {
        id: 9,
        cargo: 'Inspector Municipal',
        descripcion: 'Inspector municipal para fiscalización y control de normativas locales. Conocimiento en ordenanzas municipales.',
        fechaCreacion: new Date('2023-12-28'),
        fechaInicio: new Date('2023-12-28'),
        fechaTermino: new Date('2024-01-28'),
        estado: 'Inactivo'
      },
      {
        id: 10,
        cargo: 'Coordinador de Proyectos',
        descripcion: 'Coordinador de proyectos sociales y comunitarios. Experiencia en gestión de equipos y seguimiento de programas.',
        fechaCreacion: new Date('2024-01-01'),
        fechaInicio: new Date('2024-01-01'),
        fechaTermino: new Date('2024-02-01'),
        estado: 'Activo'
      },
      {
        id: 11,
        cargo: 'Psicólogo Clínico',
        descripcion: 'Psicólogo clínico para atención en programas de salud mental comunitaria. Especialización en terapia familiar.',
        fechaCreacion: new Date('2023-12-30'),
        fechaInicio: new Date('2023-12-30'),
        fechaTermino: new Date('2024-01-30'),
        estado: 'Activo'
      },
      {
        id: 12,
        cargo: 'Conductor Municipal',
        descripcion: 'Conductor para vehículos municipales. Licencia clase B al día y experiencia mínima 2 años.',
        fechaCreacion: new Date('2023-12-25'),
        fechaInicio: new Date('2023-12-25'),
        fechaTermino: new Date('2024-01-25'),
        estado: 'Inactivo'
      }
    ];
    
    this.postulaciones = [...this.postulacionesOriginales];
    this.aplicarFiltros();
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