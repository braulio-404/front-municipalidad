import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { ThemeService } from '../../servicios/theme.service';
import { LoginDto } from '../../interfaces/auth.interface';
import { catchError, filter, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  mostrarError = false;
  mensajeError = '';
  mostrarPassword = false;
  logoUrl: string = 'assets/images/logoconchali.png'; // fallback
  municipalityName: string = 'CONCHALÍ'; // fallback
  municipalityFullName: string = 'Municipalidad de Conchalí'; // fallback
  backgroundImageUrl: string = ''; // Para la imagen de fondo del tema
  cargando = false;
  verificandoAutenticacion = true; // Nuevo estado para mostrar loading inicial
  
  // Estados de carga de imágenes
  logoLoading = true;
  logoError = false;
  
  private themeSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // 1. Suscribirse a cambios de tema INMEDIATAMENTE
    this.subscribeToThemeChanges();
    
    // 2. Cargar tema inicial
    this.loadThemeData();
    
    // 3. Configurar actualización automática del fondo
    setTimeout(() => {
      this.updateBackgroundImage();
    }, 100);
    
    // 4. Esperar a que el servicio se inicialice antes de verificar autenticación
    this.authService.initialized$.pipe(
      filter(initialized => initialized),
      take(1)
    ).subscribe(() => {
      this.verificandoAutenticacion = false;
      
      // Verificar si ya está autenticado
      const isAuthenticated = this.authService.isAuthenticated();
      const user = this.authService.getCurrentUser();
      
      if (isAuthenticated && user) {
        // Cualquier usuario autenticado va a admin
        this.router.navigate(['/admin']);
      }
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  private loadThemeData(): void {
    try {
      // Cargar datos inmediatamente sin esperar
      const municipalityInfo = this.themeService.getMunicipalityInfo();
      this.logoUrl = municipalityInfo.logoPath;
      this.municipalityName = municipalityInfo.name;
      this.municipalityFullName = municipalityInfo.fullName;
      this.backgroundImageUrl = municipalityInfo.backgroundImagePath || '';
      
      // Estados iniciales optimistas
      this.logoLoading = false;
      this.logoError = false;
      
      // Precargar en segundo plano (no bloquear)
      this.preloadLogo(this.logoUrl).catch(() => {
        console.warn('⚠️ Error en precarga inicial, pero logo visible');
      });
      
      console.log('🎨 Tema cargado instantáneamente en login:', {
        logo: this.logoUrl,
        name: this.municipalityName,
        fullName: this.municipalityFullName,
        background: this.backgroundImageUrl
      });
    } catch (error) {
      console.warn('Error loading theme data, using fallbacks:', error);
      this.logoLoading = false;
      this.logoError = true;
    }
  }

  private subscribeToThemeChanges(): void {
    console.log('🔗 Suscribiéndose a cambios de tema en login...');
    
    // Suscribirse a cambios de tema con manejo optimizado
    this.themeSubscription = this.themeService.currentTheme$.subscribe({
      next: (theme) => {
        console.log('📨 Tema recibido en login:', theme?.municipality?.name || 'undefined');
        
        // Solo procesar si realmente tenemos un tema válido
        if (!theme || !theme.municipality) {
          console.warn('⚠️ Tema inválido recibido en login');
          return;
        }
        
        // Detectar si algo cambió
        const newLogoUrl = theme.municipality.logoPath;
        const newName = theme.municipality.name;
        const logoChanged = newLogoUrl !== this.logoUrl;
        const nameChanged = newName !== this.municipalityName;
        
        if (logoChanged || nameChanged) {
          console.log('🔄 ACTUALIZANDO LOGIN INMEDIATAMENTE - Cambios detectados:', {
            logoChanged,
            nameChanged,
            from: { logo: this.logoUrl, name: this.municipalityName },
            to: { logo: newLogoUrl, name: newName }
          });
          
          // ACTUALIZAR INMEDIATAMENTE - Sin esperas
          this.logoUrl = newLogoUrl;
          this.municipalityName = newName;
          this.municipalityFullName = theme.municipality.fullName;
          this.backgroundImageUrl = theme.municipality.backgroundImagePath || '';
          
          // Resetear estados de carga
          this.logoLoading = false;
          this.logoError = false;
          
          // Actualizar imagen de fondo
          this.updateBackgroundImage();
          
          // Forzar detección de cambios
          setTimeout(() => {
            console.log('✅ LOGIN ACTUALIZADO - FORZANDO DETECCIÓN');
          }, 0);
          
          // Precargar nuevo logo en segundo plano
          if (logoChanged) {
            this.preloadLogoBackground(newLogoUrl);
          }
          
          console.log('✅ Login actualizado INMEDIATAMENTE:', {
            logo: this.logoUrl,
            name: this.municipalityName,
            fullName: this.municipalityFullName,
            background: this.backgroundImageUrl,
            currentTheme: this.themeService.getCurrentThemeName(),
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('📝 Sin cambios en login - tema ya actualizado');
        }
      },
      error: (error) => {
        console.error('❌ Error en suscripción de tema en login:', error);
      }
    });
    
    console.log('✅ Suscripción a temas establecida en login');
  }

  /**
   * Precarga el logo en segundo plano
   */
  private preloadLogoBackground(logoPath: string): void {
    setTimeout(() => {
      const img = new Image();
      img.onload = () => console.log('✅ Logo precargado en segundo plano:', logoPath);
      img.onerror = () => console.warn('⚠️ Error precargando logo en segundo plano:', logoPath);
      img.src = logoPath;
    }, 0);
  }

  /**
   * Precarga el logo del tema
   */
  private async preloadLogo(logoPath: string): Promise<void> {
    console.log('📥 Iniciando precarga de logo:', logoPath);
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.logoLoading = false;
        this.logoError = false;
        console.log('✅ Logo precargado exitosamente:', logoPath);
        console.log('📊 Estado final - Loading:', this.logoLoading, 'Error:', this.logoError);
        resolve();
      };
      
      img.onerror = (error) => {
        this.logoLoading = false;
        this.logoError = true;
        console.warn('❌ Error al cargar logo:', logoPath, error);
        console.log('📊 Estado final - Loading:', this.logoLoading, 'Error:', this.logoError);
        resolve();
      };
      
      console.log('🔄 Iniciando carga de imagen:', logoPath);
      img.src = logoPath;
    });
  }

  /**
   * Maneja el evento de carga exitosa del logo
   */
  onLogoLoad(): void {
    this.logoLoading = false;
    this.logoError = false;
  }

  /**
   * Maneja el evento de error al cargar el logo
   */
  onLogoError(): void {
    this.logoLoading = false;
    this.logoError = true;
  }

  private updateBackgroundImage(): void {
    // Ya no necesitamos JavaScript personalizado - el CSS usa variables que cambian automáticamente
    const themeName = this.themeService.getCurrentThemeName();
    console.log('🎨 Tema actualizado en login:', themeName, '- El fondo se actualiza automáticamente via CSS');
  }

  iniciarSesion(): void {
    if (this.loginForm.valid) {
      this.cargando = true;
      this.mostrarError = false;

      const loginData: LoginDto = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(loginData)
        .pipe(
          catchError(error => {
            console.error('Error en login:', error);
            this.mostrarError = true;
            this.mensajeError = error.message || 'Error de autenticación. Verifica tus credenciales.';
            this.cargando = false;
            return of(null);
          })
        )
        .subscribe(response => {
          this.cargando = false;
          
          if (response) {
            // Pequeña pausa para asegurar que el usuario se guardó correctamente
            setTimeout(() => {
              const user = this.authService.getCurrentUser();
              
              // Todos los usuarios autenticados van a admin
              this.router.navigate(['/admin']);
            }, 100);
          }
        });
    } else {
      this.mostrarError = true;
      this.mensajeError = 'Por favor, complete todos los campos correctamente.';
    }
  }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  recuperarContrasena(): void {
    // Implementar la lógica para recuperar contraseña
    const email = this.loginForm.get('email')?.value;
    if (email && this.isValidEmail(email)) {
      this.authService.resetPassword(email).subscribe({
        next: () => {
          alert('Se ha enviado un correo para restablecer tu contraseña.');
        },
        error: (error) => {
          this.mostrarError = true;
          this.mensajeError = 'Error al solicitar restablecimiento de contraseña.';
        }
      });
    } else {
      this.mostrarError = true;
      this.mensajeError = 'Por favor, ingresa un email válido antes de solicitar recuperar contraseña.';
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 