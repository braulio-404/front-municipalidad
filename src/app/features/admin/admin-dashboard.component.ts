import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  logoUrl: string = 'assets/images/logoconchali.png';
  nombreUsuario: string = 'Administrador';
  
  // Opciones de menú para el panel lateral
  menuOptions = [
    { name: 'Gestión de Formularios', icon: 'description', route: 'formularios' },
    { name: 'Gestión de Datos', icon: 'storage', route: 'datos' },
    { name: 'Descarga de Información', icon: 'cloud_download', route: 'descargas' },
    { name: 'Estadísticas de Postulaciones', icon: 'bar_chart', route: 'estadisticas' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener información del usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.nombreUsuario = currentUser.nombre || 'Administrador';
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.router.routerState.root.children[0] });
  }

  cerrarSesion(): void {
    // Mostrar confirmación antes de cerrar sesión
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      // Llamar al método logout del AuthService que hace toda la limpieza de seguridad
      this.authService.logout().subscribe({
        next: () => {
          console.log('Sesión cerrada exitosamente');
          // El AuthService se encarga de redirigir al login
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
          // Aunque haya error, el AuthService limpia la sesión local
        }
      });
    }
  }
} 