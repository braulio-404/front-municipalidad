import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Servicios
import { PostulantesService } from '../../../servicios/postulantes.service';
import { FormulariosService } from '../../../servicios/formularios.service';

// Interfaces
import { 
  PostulacionDetalle, 
  RequisitoSeleccionado, 
  CreatePostulanteDto, 
  PostulacionFormData,
  Postulante
} from '../../../interfaces/postulante.interface';
import { Formulario } from '../../../interfaces/formulario.interface';

@Component({
  selector: 'app-formulario-postulacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formulario-postulacion.component.html',
  styleUrls: ['./formulario-postulacion.component.scss']
})
export class FormularioPostulacionComponent implements OnInit {
  formularioPostulacion: FormGroup;
  postulacionId: number = 0;
  postulacionTitulo: string = '';
  documentosSubidos: Map<number, File> = new Map(); // Mapa de requisito.id -> archivo
  captchaValido: boolean = false;
  cargando: boolean = false;
  error: string = '';
  
  // Datos de la postulación actual
  postulacionActual: PostulacionDetalle | null = null;
  formularioActual: Formulario | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postulantesService: PostulantesService,
    private formulariosService: FormulariosService
  ) {
    this.formularioPostulacion = this.fb.group({
      rut: ['', [Validators.required, this.validarRutChileno], []],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.pattern(/^\+?[0-9]{8,12}$/)]],
      email: ['', [Validators.required, Validators.email], []]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.postulacionId = +params['id'];
      this.cargarDetallesPostulacion();
    });
  }

  cargarDetallesPostulacion() {
    this.cargando = true;
    this.error = '';
    
    // Cargar datos del formulario desde el backend
    this.formulariosService.findOne(this.postulacionId).subscribe({
      next: (formulario: Formulario) => {
        this.formularioActual = formulario;
        this.postulacionTitulo = formulario.cargo;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar formulario:', error);
        this.error = 'Error al cargar los detalles de la postulación';
        this.cargando = false;
      }
    });
  }

  // Validador personalizado para RUT chileno
  validarRutChileno(control: AbstractControl): {[key: string]: any} | null {
    const rut = control.value;
    if (!rut) return null;

    // Formato básico: 11.222.333-4 o 11222333-4
    const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
      return { rutInvalido: true };
    }

    // Limpiar puntos y guión
    const rutLimpio = rut.replace(/\./g, '').replace('-', '');
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toLowerCase();

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvCalculado = 11 - (suma % 11);
    let dvEsperado = '';
    
    if (dvCalculado === 11) dvEsperado = '0';
    else if (dvCalculado === 10) dvEsperado = 'k';
    else dvEsperado = dvCalculado.toString();

    return dv === dvEsperado ? null : { rutInvalido: true };
  }

  // Formatear RUT automáticamente
  formatearRut(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\./g, '').replace('-', '').replace(/[^0-9kK]/g, '');
    
    if (valor.length === 0) return;

    // Separar cuerpo y dígito verificador
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);

    if (cuerpo.length >= 7) {
      // Formatear con puntos: 12.345.678-9
      let rutFormateado = '';
      
      if (cuerpo.length >= 7) {
        rutFormateado = cuerpo.slice(0, -6) + '.' + cuerpo.slice(-6, -3) + '.' + cuerpo.slice(-3) + '-' + dv;
      }
      
      // Actualizar el valor del campo
      this.formularioPostulacion.get('rut')?.setValue(rutFormateado, { emitEvent: false });
    }
  }

  // Manejar entrada de RUT en tiempo real (para limpiar caracteres no válidos)
  onRutInput(event: any) {
    const input = event.target;
    let valor = input.value;
    
    // Permitir solo números, puntos, guión y K/k
    const valorLimpio = valor.replace(/[^0-9.\-kK]/g, '');
    
    if (valor !== valorLimpio) {
      input.value = valorLimpio;
      this.formularioPostulacion.get('rut')?.setValue(valorLimpio, { emitEvent: false });
    }
  }

  onFileSelected(event: any, requisitoId: number) {
    const file = event.target.files[0];
    if (file) {
      this.documentosSubidos.set(requisitoId, file);
    }
  }

  abrirSelectorDocumento(requisitoId: number) {
    const input = document.getElementById(`documento-upload-${requisitoId}`) as HTMLInputElement;
    input?.click();
  }

  getArchivoSubido(requisitoId: number): File | null {
    return this.documentosSubidos.get(requisitoId) || null;
  }

  // Validar que todos los documentos obligatorios estén subidos
  validarDocumentosObligatorios(): boolean {
    const requisitosObligatorios = this.getRequisitosSeleccionados().filter(req => req.obligatorio);
    return requisitosObligatorios.every(req => this.documentosSubidos.has(req.id));
  }

  // Obtener el nombre del archivo para mostrar
  getNombreArchivo(requisitoId: number): string {
    const archivo = this.documentosSubidos.get(requisitoId);
    return archivo ? archivo.name : '';
  }

  onCaptchaSuccess() {
    this.captchaValido = true;
  }

  enviarPostulacion() {
    if (this.formularioPostulacion.valid && this.validarDocumentosObligatorios() && this.captchaValido) {
      this.cargando = true;
      this.error = '';

      // Preparar datos según CreatePostulanteDto
      const createPostulanteDto: CreatePostulanteDto = {
        nombres: this.formularioPostulacion.get('nombres')?.value,
        apellidoPaterno: this.formularioPostulacion.get('apellidoPaterno')?.value,
        rut: this.formularioPostulacion.get('rut')?.value,
        email: this.formularioPostulacion.get('email')?.value,
        telefono: this.formularioPostulacion.get('telefono')?.value || undefined,
        formulario_id: this.postulacionId,
        documentos: []
      };

      // Agregar documentos subidos con sus nombres correctos
      const requisitosSeleccionados = this.getRequisitosSeleccionados();
      this.documentosSubidos.forEach((file, requisitoId) => {
        const requisito = requisitosSeleccionados.find(req => req.id === requisitoId);
        createPostulanteDto.documentos!.push({
          tipoDocumento: requisito ? requisito.nombre : `Documento-${requisitoId}`,
          archivo: file
        });
      });

      this.postulantesService.create(createPostulanteDto).subscribe({
        next: (postulante: Postulante) => {
          console.log('Postulación enviada exitosamente:', postulante);
          this.cargando = false;
          this.router.navigate(['/postulacion/confirmacion']);
        },
        error: (error) => {
          console.error('Error al enviar postulación:', error);
          
          // Manejar mensajes específicos del servicio
          if (error.status === 409 && error.error?.message) {
            this.error = error.error.message;
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Error al enviar la postulación. Por favor, intenta nuevamente.';
          }
          
          this.cargando = false;
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.formularioPostulacion.markAllAsTouched();
      
      if (!this.validarDocumentosObligatorios()) {
        this.error = 'Debe subir todos los documentos obligatorios';
      } else if (!this.captchaValido) {
        this.error = 'Debe completar el captcha';
      }
    }
  }

  volver() {
    this.router.navigate(['/postulacion']);
  }

  getRequisitos() {
    // Retorna los requisitos del campo "requisitos" como array dividido por comas
    if (this.formularioActual && this.formularioActual.requisitos) {
      return this.formularioActual.requisitos.split(',').map(req => req.trim());
    }
    return [];
  }

  getRequisitosSeleccionados() {
    // Retorna los requisitos seleccionados del backend
    if (this.formularioActual && this.formularioActual.requisitosSeleccionados) {
      return this.formularioActual.requisitosSeleccionados;
    }
    
    return [];
  }
} 