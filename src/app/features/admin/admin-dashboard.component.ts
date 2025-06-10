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
    { name: 'Inicio', icon: 'home', route: 'home' },
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
    // Inicialización adicional si es necesaria
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.router.routerState.root.children[0] });
  }

  // Método para manejar navegación, incluyendo rutas externas
  navigateToOption(option: any): void {
    if (option.isExternal) {
      // Para rutas externas, navegar directamente
      this.router.navigate([option.route]);
    } else {
      // Para rutas internas del admin, navegar relativamente
      this.navigateTo(option.route);
    }
  }

  cerrarSesion(): void {
    console.log('🚪 Cerrando sesión...');
    
    // Llamar al servicio de autenticación para hacer logout
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Sesión cerrada exitosamente');
      },
      error: (error: any) => {
        console.error('❌ Error al cerrar sesión:', error);
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
} 