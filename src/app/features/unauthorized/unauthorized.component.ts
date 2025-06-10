import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  volverAlInicio(): void {
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'admin') {
      this.router.navigate(['/admin']);
    } else if (user) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Sesión cerrada exitosamente');
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      });
    }
  }
} 