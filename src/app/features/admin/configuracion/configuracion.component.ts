import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService, ParametroConfiguracion, ConfiguracionCorreo, TestCorreoRequest, TestCorreoResponse } from '../../../servicios/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  
  // Estados de carga
  cargando = false;
  cargandoCorreo = false;
  probandoCorreo = false;
  guardandoParametro = false;

  // Datos
  parametros: ParametroConfiguracion[] = [];
  configuracionCorreo: ConfiguracionCorreo | null = null;
  categorias: string[] = ['correo', 'sistema', 'notificaciones', 'seguridad'];
  
  // Filtros y navegación
  categoriaActiva = 'correo';
  terminoBusqueda = '';
  
  // Formularios
  nuevoParametro: Omit<ParametroConfiguracion, 'id'> = {
    clave: '',
    valor: '',
    categoria: 'correo',
    tipo: 'texto',
    descripcion: ''
  };
  
  parametroEditando: ParametroConfiguracion | null = null;
  
  // Test de correo
  testCorreo: TestCorreoRequest = {
    emailDestino: '',
    asunto: 'Prueba de configuración de correo',
    mensaje: 'Este es un correo de prueba para verificar la configuración del sistema.'
  };
  
  resultadoTest: TestCorreoResponse | null = null;
  
  // UI States
  mostrarFormularioNuevo = false;
  mostrarTestCorreo = false;
  error = '';
  mensaje = '';

  constructor(private configuracionService: ConfiguracionService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    
    // Cargar parámetros
    this.configuracionService.getParametros().subscribe({
      next: (parametros) => {
        this.parametros = parametros;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar parámetros:', error);
        this.error = 'Error al cargar la configuración';
        this.cargando = false;
      }
    });
    
    // Cargar configuración de correo
    this.cargarConfiguracionCorreo();
  }

  cargarConfiguracionCorreo(): void {
    this.cargandoCorreo = true;
    
    this.configuracionService.getConfiguracionCorreo().subscribe({
      next: (config) => {
        this.configuracionCorreo = config;
        this.cargandoCorreo = false;
      },
      error: (error) => {
        console.error('Error al cargar configuración de correo:', error);
        this.cargandoCorreo = false;
      }
    });
  }

  // Gestión de categorías
  cambiarCategoria(categoria: string): void {
    this.categoriaActiva = categoria;
    this.limpiarFormularios();
  }

  get parametrosFiltrados(): ParametroConfiguracion[] {
    let filtrados = this.parametros.filter(p => p.categoria === this.categoriaActiva);
    
    if (this.terminoBusqueda) {
      filtrados = filtrados.filter(p => 
        p.clave.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    }
    
    return filtrados;
  }

  // Gestión de parámetros
  agregarParametro(): void {
    if (!this.nuevoParametro.clave || !this.nuevoParametro.valor) {
      this.error = 'Clave y valor son obligatorios';
      return;
    }
    
    this.guardandoParametro = true;
    this.error = '';
    
    this.configuracionService.crearParametro({
      ...this.nuevoParametro,
      categoria: this.categoriaActiva
    }).subscribe({
      next: (parametro) => {
        this.parametros.push(parametro);
        this.limpiarFormularioNuevo();
        this.mensaje = 'Parámetro creado exitosamente';
        this.guardandoParametro = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('Error al crear parámetro:', error);
        this.error = 'Error al crear el parámetro';
        this.guardandoParametro = false;
      }
    });
  }

  editarParametro(parametro: ParametroConfiguracion): void {
    this.parametroEditando = { ...parametro };
    this.mostrarFormularioNuevo = false;
  }

  guardarParametro(): void {
    if (!this.parametroEditando || !this.parametroEditando.id) return;
    
    this.guardandoParametro = true;
    this.error = '';
    
    this.configuracionService.actualizarParametro(this.parametroEditando.id, {
      valor: this.parametroEditando.valor,
      descripcion: this.parametroEditando.descripcion
    }).subscribe({
      next: (parametroActualizado) => {
        const index = this.parametros.findIndex(p => p.id === parametroActualizado.id);
        if (index !== -1) {
          this.parametros[index] = parametroActualizado;
        }
        this.parametroEditando = null;
        this.mensaje = 'Parámetro actualizado exitosamente';
        this.guardandoParametro = false;
        setTimeout(() => this.mensaje = '', 3000);
        
        // Si es configuración de correo, recargar
        if (parametroActualizado.categoria === 'correo') {
          this.cargarConfiguracionCorreo();
        }
      },
      error: (error) => {
        console.error('Error al actualizar parámetro:', error);
        this.error = 'Error al actualizar el parámetro';
        this.guardandoParametro = false;
      }
    });
  }

  cancelarEdicion(): void {
    this.parametroEditando = null;
  }

  eliminarParametro(parametro: ParametroConfiguracion): void {
    if (!parametro.id || !confirm('¿Estás seguro de que deseas eliminar este parámetro?')) return;
    
    this.configuracionService.eliminarParametro(parametro.id).subscribe({
      next: () => {
        this.parametros = this.parametros.filter(p => p.id !== parametro.id);
        this.mensaje = 'Parámetro eliminado exitosamente';
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        console.error('Error al eliminar parámetro:', error);
        this.error = 'Error al eliminar el parámetro';
      }
    });
  }

  // Test de correo
  probarCorreo(): void {
    if (!this.testCorreo.emailDestino) {
      this.error = 'Email de destino es obligatorio para la prueba';
      return;
    }
    
    this.probandoCorreo = true;
    this.resultadoTest = null;
    this.error = '';
    
    this.configuracionService.probarConfiguracionCorreo(this.testCorreo).subscribe({
      next: (resultado) => {
        this.resultadoTest = resultado;
        this.probandoCorreo = false;
      },
      error: (error) => {
        console.error('Error al probar correo:', error);
        this.resultadoTest = {
          success: false,
          exito: false,
          message: 'Error al realizar la prueba de correo',
          mensaje: 'Error al realizar la prueba de correo',
          detalles: error
        };
        this.probandoCorreo = false;
      }
    });
  }

  // Utilidades UI
  limpiarFormularios(): void {
    this.limpiarFormularioNuevo();
    this.parametroEditando = null;
    this.error = '';
    this.mensaje = '';
  }

  limpiarFormularioNuevo(): void {
    this.nuevoParametro = {
      clave: '',
      valor: '',
      categoria: this.categoriaActiva,
      tipo: 'texto',
      descripcion: ''
    };
    this.mostrarFormularioNuevo = false;
  }

  toggleFormularioNuevo(): void {
    this.mostrarFormularioNuevo = !this.mostrarFormularioNuevo;
    if (this.mostrarFormularioNuevo) {
      this.parametroEditando = null;
    }
  }

  toggleTestCorreo(): void {
    this.mostrarTestCorreo = !this.mostrarTestCorreo;
    this.resultadoTest = null;
  }

  getIconoCategoria(categoria: string): string {
    const iconos: {[key: string]: string} = {
      'correo': 'email',
      'sistema': 'settings',
      'notificaciones': 'notifications',
      'seguridad': 'security'
    };
    return iconos[categoria] || 'settings';
  }

  getTipoInput(tipo: string): string {
    const tipos: {[key: string]: string} = {
      'texto': 'text',
      'numero': 'number',
      'booleano': 'checkbox',
      'password': 'password',
      'email': 'email'
    };
    return tipos[tipo] || 'text';
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES');
  }

  trackByParametro(index: number, parametro: ParametroConfiguracion): any {
    return parametro.id || index;
  }
} 