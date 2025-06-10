import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import { LoginDto } from '../../interfaces/auth.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  mostrarError = false;
  mensajeError = '';
  mostrarPassword = false;
  logoUrl: string = 'assets/images/logoconchali.png';
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  iniciarSesion(): void {
    if (this.loginForm.valid) {
      this.cargando = true;
      this.mostrarError = false;

      const loginData: LoginDto = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('Iniciando login con:', loginData.email);

      this.authService.login(loginData)
        .pipe(
          catchError(error => {
            console.error('Error en login:', error);
            this.mostrarError = true;
            
            // Manejar específicamente el error 401 (credenciales incorrectas)
            if (error.status === 401) {
              this.mensajeError = 'Email o contraseña incorrecta';
            } else {
              // Para otros errores, mostrar mensaje genérico sin detalles técnicos
              this.mensajeError = 'Error de conexión. Intenta nuevamente.';
            }
            
            this.cargando = false;
            return of(null);
          })
        )
        .subscribe(response => {
          console.log('Respuesta del login:', response);
          this.cargando = false;
          
          if (response) {
            console.log('Login exitoso, verificando usuario...');
            // Pequeña pausa para asegurar que el usuario se guardó correctamente
            setTimeout(() => {
              const user = this.authService.getCurrentUser();
              console.log('Usuario actual:', user);
              
              if (user?.rol === 'admin') {
                console.log('Redirigiendo a admin...');
                this.router.navigate(['/admin']);
              } else {
                console.log('Redirigiendo a dashboard...');
                this.router.navigate(['/dashboard']);
              }
            }, 100);
          } else {
            console.log('No se recibió respuesta válida');
          }
        });
    } else {
      this.mostrarError = true;
      this.mensajeError = 'Por favor, complete todos los campos correctamente.';
    }
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
  
  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  registrarse(): void {
    // Navegar a la página de registro cuando se implemente
    // this.router.navigate(['/registro']);
    console.log('Navegando a página de registro');
  }

  loginConRedSocial(redSocial: string): void {
    // Implementar la lógica para iniciar sesión con redes sociales
    console.log(`Iniciando sesión con ${redSocial}`);
  }
} 