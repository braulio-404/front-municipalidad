import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { ThemeService } from '../../servicios/theme.service';
import { RoleService } from '../../servicios/role.service';
import { ThemeSelectorComponent } from '../../components/theme-selector/theme-selector.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeSelectorComponent]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  showThemeSelector: boolean = false;
  currentUser: any = null;
  logoUrl: string = 'assets/images/logoconchali.png'; // fallback
  municipalityName: string = 'CONCHALÍ'; // fallback
  municipalityFullName: string = 'Municipalidad de Conchalí'; // fallback
  nombreUsuario: string = 'Usuario';
  isUserAdminStatus: boolean = false;
  
  private themeSubscription: Subscription = new Subscription();

  constructor(
    public router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadThemeData();
    this.subscribeToThemeChanges();
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  private loadUserData(): void {
    // Esperar a que AuthService esté inicializado
    if (this.authService.isInitialized()) {
      this.currentUser = this.authService.getCurrentUser();
      this.checkAdminStatus();
    } else {
      // Esperar un poco y volver a intentar
      setTimeout(() => {
        this.loadUserData();
      }, 100);
    }
  }

  private loadThemeData(): void {
    // Cargar información del tema actual INMEDIATAMENTE
    const municipalityInfo = this.themeService.getMunicipalityInfo();
    this.logoUrl = municipalityInfo.logoPath;
    this.municipalityName = municipalityInfo.name;
    this.municipalityFullName = municipalityInfo.fullName;
    
    // Precargar el logo en segundo plano (no bloquea la UI)
    this.preloadLogoBackground(this.logoUrl);
    
    console.log('🎨 Tema cargado INMEDIATAMENTE en dashboard:', {
      logo: this.logoUrl,
      name: this.municipalityName,
      fullName: this.municipalityFullName
    });
  }

  /**
   * Precarga el logo en segundo plano sin bloquear la UI
   */
  private preloadLogoBackground(logoPath: string): void {
    // Usar setTimeout para no bloquear el hilo principal
    setTimeout(() => {
      const img = new Image();
      img.onload = () => console.log('✅ Logo dashboard precargado en segundo plano:', logoPath);
      img.onerror = () => console.warn('⚠️ Error precargando logo dashboard:', logoPath);
      img.src = logoPath;
    }, 0);
  }

  private subscribeToThemeChanges(): void {
    // Suscribirse a cambios de tema para actualizar logo y nombre INMEDIATAMENTE
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      console.log('🔄 Actualizando dashboard INMEDIATAMENTE con nuevo tema:', {
        from: { logo: this.logoUrl, name: this.municipalityName },
        to: { logo: theme.municipality.logoPath, name: theme.municipality.name }
      });
      
      // Actualizar INMEDIATAMENTE sin esperar precarga
      this.logoUrl = theme.municipality.logoPath;
      this.municipalityName = theme.municipality.name;
      this.municipalityFullName = theme.municipality.fullName;
      
      // Precargar el nuevo logo en segundo plano (no bloquea)
      this.preloadLogoBackground(theme.municipality.logoPath);
      
      console.log('✅ Dashboard actualizado INMEDIATAMENTE');
    });
  }

  private checkAdminStatus(): void {
    this.isUserAdminStatus = this.isUserAdmin();
  }

  isUserAdmin(): boolean {
    // Método 1: Verificar con RoleService
    if (this.roleService.isAdmin()) {
      return true;
    }
    
    // Método 2: Verificar con AuthService
    if (this.authService.isAdmin()) {
      return true;
    }
    
    // Método 3: Verificar usuario actual en el componente
    if (this.currentUser && this.currentUser.rol === 'admin') {
      return true;
    }
    
    // Método 4: Verificar directamente desde AuthService
    const user = this.authService.getCurrentUser();
    if (user && user.rol === 'admin') {
      return true;
    }
    
    return false;
  }

  toggleThemeSelector(): void {
    // Verificar nuevamente que es admin antes de mostrar
    if (this.isUserAdmin()) {
      this.showThemeSelector = !this.showThemeSelector;
    } else {
      console.warn('Solo los administradores pueden cambiar temas');
    }
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Sesión cerrada exitosamente');
          // El AuthService ya redirige al login
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
          // Redirigir al login incluso si hay error
          this.router.navigate(['/login']);
        }
      });
    }
  }

  // Método para navegar a rutas específicas con debug
  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }
} 