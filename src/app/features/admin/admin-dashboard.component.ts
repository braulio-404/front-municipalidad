import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.router.routerState.root.children[0] });
  }

  cerrarSesion(): void {
    // Aquí se implementará la lógica para cerrar sesión
    this.router.navigate(['/login']);
  }
} 