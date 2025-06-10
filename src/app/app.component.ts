import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// Importar los componentes faltantes
// import { MenuComponent } from './shared/menu/menu.component';
// import { LoadingComponent } from './shared/loading/loading.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, CommonModule]
  // Cuando tengas los componentes, descomenta estas líneas:
  // imports: [RouterOutlet, CommonModule, MenuComponent, LoadingComponent]
})
export class AppComponent {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Solo ejecutar este código en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const hex = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
      if (hex) {
        const rgb = this.hexToRgb(hex);
        document.documentElement.style.setProperty('--primary-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
    }
  }

  private adjustBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
  }

  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  shouldShowMenu(): boolean {
    const currentRoute = this.router.url;
    return !currentRoute.includes('/login');
  }
}
