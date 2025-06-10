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
  filtroOrden: string = 'recientes';
  filtroNombre: string = '';
  cargando: boolean = false;
  error: string | null = null;

  constructor(private formulariosService: FormulariosService) {}

  ngOnInit() {
    this.cargarPostulaciones();
  }

  get postulacionesActivas() {
    return this.postulaciones.filter(p => p.estado === 'Activo');
  }

  get tienePostulacionesActivas() {
    return this.postulacionesActivas.length > 0;
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
        descripcion: 'Buscamos un Jefe del Departamento de Geotécnica con amplia experiencia para liderar, coordinar y supervisar proyectos geotécnicos de gran envergadura. Esta posición es clave para asegurar la calidad técnica, la innovación y el cumplimiento de estándares en todas las etapas del proyecto.',
        fechaCreacion: new Date('2024-01-15'),
        fechaInicio: new Date('2024-01-15'),
        fechaTermino: new Date('2024-02-15'),
        estado: 'Inactivo'
      }
    ];
    
    this.postulaciones = [...this.postulacionesOriginales];
    this.aplicarFiltros();
  }

  filtrarPorOrden(orden: string) {
    this.filtroOrden = orden;
    this.aplicarFiltros();
  }

  buscarPorNombre() {
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
    this.postulaciones = [...postulacionesActivas, ...postulacionesInactivas];
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