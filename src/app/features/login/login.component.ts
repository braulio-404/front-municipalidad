import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  mostrarError = false;
  mensajeError = '';
  mostrarPassword = false;
  logoUrl: string = 'assets/images/logoconchali.png';
  cargando = false;
  verificandoAutenticacion = true; // Nuevo estado para mostrar loading inicial

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
    // Esperar a que el servicio se inicialice antes de verificar autenticación
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
              
              if (user?.rol === 'admin') {
                this.router.navigate(['/admin/home']);
              } else {
                this.router.navigate(['/dashboard']);
              }
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