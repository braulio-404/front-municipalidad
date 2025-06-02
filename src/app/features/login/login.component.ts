import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  iniciarSesion(): void {
    if (this.loginForm.valid) {
      // Para fines de demostración, redirigimos directamente al dashboard
      this.router.navigate(['/admin']);
      
      // Código comentado para cuando se implemente el servicio de autenticación
      /*
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          this.router.navigate(['/admin']);
        },
        (error) => {
          this.mostrarError = true;
          this.mensajeError = error.message || 'Error de autenticación';
        }
      );
      */
    } else {
      this.mostrarError = true;
      this.mensajeError = 'Por favor, complete todos los campos correctamente.';
    }
  }

  recuperarContrasena(): void {
    // Implementar la lógica para recuperar contraseña
    // Por ahora solo navegamos a una página hipotética
    // this.router.navigate(['/recuperar-contrasena']);
    console.log('Funcionalidad de recuperar contraseña');
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