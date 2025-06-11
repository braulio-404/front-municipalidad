import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../servicios/theme.service';
import { AuthService } from '../../servicios/auth.service';
import { RoleService } from '../../servicios/role.service';
import { availableThemes } from '../../config/theme.config';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="theme-selector">
      <h3>🎨 Configuración de Tema</h3>
      
      <!-- Verificación de permisos -->
      <div class="permission-check" *ngIf="!isAdminUser()">
        <div class="no-permission">
          <i class="fas fa-lock"></i>
          <h4>Acceso Restringido</h4>
          <p>Solo los administradores pueden cambiar la configuración de temas.</p>
          <p><strong>Tu rol actual:</strong> {{getCurrentRole() || 'No definido'}}</p>
        </div>
      </div>

      <!-- Contenido del selector (solo para admins) -->
      <div *ngIf="isAdminUser()">
        <!-- Layout principal en dos columnas -->
        <div class="theme-content">
          <!-- Columna izquierda -->
          <div class="left-column">
            <!-- Información actual del tema -->
            <div class="current-info">
              <div class="logo-preview">
                <img 
                  [src]="currentLogoPath" 
                  [alt]="currentMunicipalityFullName" 
                  class="current-logo"
                  (error)="onImageError($event)"
                  (load)="onImageLoad($event)">
                <div *ngIf="imageLoadError" class="logo-error">
                  <i class="fas fa-building"></i>
                  <small>Logo no disponible</small>
                </div>
              </div>
              <div class="info-text">
                <p><strong>Municipalidad:</strong> {{currentMunicipalityFullName}}</p>
                <p><strong>Nombre Corto:</strong> {{currentMunicipalityName}}</p>
                <p><strong>Email:</strong> {{currentMunicipalityEmail}}</p>
              </div>
            </div>
            
            <!-- Selector de tema -->
            <div class="selector-container">
              <label for="theme-select">Seleccionar Tema:</label>
              <select 
                id="theme-select" 
                [(ngModel)]="selectedTheme" 
                (change)="onThemeChange()"
                class="form-select theme-select">
                <option value="conchali">🏛️ Conchalí - Morado y Verde</option>
                <option value="concepcion">🏢 Concepción - Azul y Verde</option>
              </select>
            </div>

            <!-- Vista previa de colores -->
            <div class="preview-colors">
              <h4>Vista Previa de Colores:</h4>
              <div class="color-grid">
                <div class="color-item">
                  <div class="color-swatch primary"></div>
                  <span>Primario</span>
                </div>
                <div class="color-item">
                  <div class="color-swatch accent"></div>
                  <span>Acento</span>
                </div>
                <div class="color-item">
                  <div class="color-swatch success"></div>
                  <span>Éxito</span>
                </div>
                <div class="color-item">
                  <div class="color-swatch error"></div>
                  <span>Error</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="right-column">
            <!-- Aviso para administradores -->
            <div class="admin-notice">
              <h4>⚡ Información Importante para Administradores</h4>
              <div class="notice-content">
                <p><strong>🔐 Solo Administradores:</strong> Solo usuarios con rol "admin" pueden ver y cambiar temas.</p>
                <p><strong>🌐 Efecto Global:</strong> Los cambios de tema se aplicarán a todos los usuarios de la aplicación.</p>
                <p><strong>💾 Persistencia:</strong> La configuración se guarda automáticamente para toda la organización.</p>
              </div>
            </div>

            <!-- Elementos de demostración -->
            <div class="demo-elements">
              <h4>Elementos de Demostración:</h4>
              <button class="btn btn-primary">Botón Primario</button>
              <button class="btn btn-secondary">Botón Secundario</button>
              <button class="btn btn-success">Botón Éxito</button>
              
              <div class="demo-card card card-primary">
                <div class="card-header">
                  <div class="card-icon">
                    <i class="fas fa-palette"></i>
                  </div>
                  <h5 class="card-title">Tarjeta de Demo</h5>
                </div>
                <div class="card-content">
                  <p>Esta tarjeta muestra cómo se ven los colores del tema actual.</p>
                </div>
                <div class="card-actions">
                  <button class="btn btn-sm btn-primary">Acción</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cambios aplicados (ancho completo) -->
        <div class="change-preview" *ngIf="selectedTheme !== 'conchali'">
          <h4>🔄 Cambios Aplicados:</h4>
          <div class="changes-grid">
            <div class="change-item">
              <span class="change-label">Logo:</span>
              <span class="change-value">{{imageLoadError ? '⚠️ No disponible' : '✅ Actualizado'}}</span>
            </div>
            <div class="change-item">
              <span class="change-label">Nombre:</span>
              <span class="change-value">{{currentMunicipalityName}}</span>
            </div>
            <div class="change-item">
              <span class="change-label">Colores:</span>
              <span class="change-value">✅ Actualizados</span>
            </div>
            <div class="change-item">
              <span class="change-label">Email:</span>
              <span class="change-value">{{currentMunicipalityEmail}}</span>
            </div>
          </div>
        </div>

        <!-- Instrucciones (ancho completo) -->
        <div class="instructions">
          <h4>📝 Instrucciones para Personalizar:</h4>
          <ol>
            <li>Edita el archivo <code>src/app/config/theme.config.ts</code></li>
            <li>Agrega nuevos temas al objeto <code>availableThemes</code></li>
            <li>Cambia los colores, logo y nombre de municipalidad</li>
            <li>¡Los cambios se aplicarán automáticamente en toda la aplicación!</li>
          </ol>
          
          <div class="note" *ngIf="imageLoadError">
            <p><strong>Nota:</strong> Para que el logo se muestre correctamente, asegúrate de que el archivo de imagen existe en la ruta especificada en la configuración.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-selector {
      max-width: 900px;
      width: 90vw;
      margin: 2rem auto;
      padding: 2rem;
      background: var(--background-card);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(var(--primary-color-rgb), 0.1);
      max-height: 90vh;
      overflow-y: auto;
    }

    .theme-selector h3 {
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 1.5rem;
    }

    .permission-check {
      margin-bottom: 2rem;
    }

    .no-permission {
      background: var(--error-color);
      color: white;
      padding: 2rem;
      border-radius: var(--border-radius-md);
      text-align: center;
      box-shadow: var(--shadow-md);
    }

    .no-permission i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .no-permission h4 {
      color: white;
      margin-bottom: 1rem;
    }

    .no-permission p {
      margin: 0.5rem 0;
      opacity: 0.9;
    }

    .theme-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .left-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .right-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .current-info {
      background: var(--primary-color-very-light);
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      border-left: 4px solid var(--primary-color);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-preview {
      flex-shrink: 0;
      position: relative;
    }

    .current-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: var(--border-radius-md);
      background: white;
      padding: 0.5rem;
      box-shadow: var(--shadow-sm);
      display: block;
    }

    .logo-error {
      width: 80px;
      height: 80px;
      background: var(--gray-100);
      border-radius: var(--border-radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--gray-600);
      text-align: center;
      position: absolute;
      top: 0;
      left: 0;
    }

    .logo-error i {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .logo-error small {
      font-size: 10px;
    }

    .info-text {
      flex: 1;
    }

    .current-info p {
      margin: 0.5rem 0;
      color: var(--text-color);
      font-size: 0.9rem;
    }

    .selector-container {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
    }

    .selector-container label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: var(--primary-color);
      font-size: 1rem;
    }

    .admin-notice {
      background: linear-gradient(135deg, var(--info-color), var(--primary-color));
      color: white;
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
    }

    .admin-notice h4 {
      color: white;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .notice-content p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .notice-content strong {
      font-weight: 600;
    }

    .theme-select {
      width: 100% !important;
      padding: 0.75rem 1rem !important;
      border: 2px solid var(--gray-300) !important;
      border-radius: var(--border-radius-md) !important;
      background: var(--background-card) !important;
      color: var(--text-color) !important;
      font-size: 1rem !important;
      transition: all 0.3s ease !important;
      appearance: none !important;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
      background-position: right 0.5rem center !important;
      background-repeat: no-repeat !important;
      background-size: 1.5em 1.5em !important;
      padding-right: 2.5rem !important;
    }

    .theme-select:focus {
      outline: none !important;
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1) !important;
    }

    .theme-select option {
      background: var(--background-card) !important;
      color: var(--text-color) !important;
      padding: 0.5rem !important;
    }

    .preview-colors {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
    }

    .preview-colors h4 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .color-item {
      text-align: center;
    }

    .color-swatch {
      width: 50px;
      height: 50px;
      border-radius: var(--border-radius-full);
      margin: 0 auto 0.5rem;
      border: 3px solid var(--background-card);
      box-shadow: var(--shadow-md);
    }

    .color-swatch.primary { background: var(--primary-color); }
    .color-swatch.accent { background: var(--accent-color); }
    .color-swatch.success { background: var(--success-color); }
    .color-swatch.error { background: var(--error-color); }

    .demo-elements {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
    }

    .demo-elements h4 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .demo-elements button {
      margin: 0.5rem 0.5rem 0.5rem 0;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-md);
      border: none;
      font-size: 0.9rem;
    }

    .demo-card {
      margin-top: 1rem;
      max-width: 100%;
      background: var(--background-card);
      border-radius: var(--border-radius-md);
      padding: 1rem;
      border: 1px solid var(--gray-200);
    }

    .change-preview {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, var(--success-color), #22c55e);
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      color: white;
    }

    .change-preview h4 {
      color: white;
      margin-bottom: 1rem;
    }

    .changes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .change-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.75rem;
      border-radius: var(--border-radius-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .change-label {
      font-weight: 600;
      opacity: 0.9;
    }

    .change-value {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .instructions {
      grid-column: 1 / -1;
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
    }

    .instructions h4 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .instructions ol {
      margin-left: 1.5rem;
      column-count: 2;
      column-gap: 2rem;
    }

    .instructions li {
      margin-bottom: 0.5rem;
      color: var(--text-color);
      break-inside: avoid;
    }

    .instructions code {
      background: var(--primary-color-very-light);
      padding: 0.2rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-family: 'Courier New', monospace;
      color: var(--primary-color);
      font-size: 0.85rem;
    }

    .note {
      background: var(--warning-color);
      color: white;
      padding: 1rem;
      border-radius: var(--border-radius-md);
      margin-top: 1rem;
    }

    .note p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .theme-selector {
        width: 95vw;
        padding: 1rem;
        margin: 1rem auto;
      }

      .theme-content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .current-info {
        flex-direction: column;
        text-align: center;
      }

      .color-grid {
        grid-template-columns: repeat(4, 1fr);
      }

      .instructions ol {
        column-count: 1;
      }

      .changes-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .theme-selector {
        width: 98vw;
        padding: 0.75rem;
      }

      .theme-selector h3 {
        font-size: 1.2rem;
      }
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  selectedTheme: string = 'conchali';
  currentMunicipalityName: string = '';
  currentMunicipalityFullName: string = '';
  currentMunicipalityEmail: string = '';
  currentLogoPath: string = '';
  imageLoadError: boolean = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    // Forzar recarga del tema antes de obtener el nombre actual
    this.themeService.reloadTheme();
    
    // Pequeño delay para asegurar que se haya cargado
    setTimeout(() => {
      // Obtener el tema actual desde el servicio
      this.selectedTheme = this.themeService.getCurrentThemeName();
      this.updateCurrentInfo();
    }, 100);
    
    // Suscribirse a cambios de tema
    this.themeService.currentTheme$.subscribe(() => {
      // Actualizar el tema seleccionado cuando cambie el tema
      this.selectedTheme = this.themeService.getCurrentThemeName();
      this.updateCurrentInfo();
    });
  }

  async onThemeChange() {
    // Verificar permisos antes de permitir el cambio
    if (!this.roleService.isAdmin()) {
      // Revertir la selección al tema actual
      this.selectedTheme = this.themeService.getCurrentThemeName();
      return;
    }

    this.imageLoadError = false; // Reset error state
    
    // Obtener información del usuario admin para el log
    const currentUser = this.authService.getCurrentUser();
    const adminUser = currentUser?.nombre || currentUser?.email || 'admin';
    
    // Mostrar indicador de carga mientras se aplica el tema
    console.log('🎨 Iniciando cambio de tema a:', this.selectedTheme);
    
    try {
      await this.themeService.setTheme(this.selectedTheme, adminUser);
      console.log('✅ Tema aplicado exitosamente');
    } catch (error) {
      console.error('❌ Error al cambiar tema:', error);
      // Revertir selección en caso de error
      this.selectedTheme = this.themeService.getCurrentThemeName();
    }
    // updateCurrentInfo se llamará automáticamente por la suscripción
  }

  onImageError(event: any) {
    this.imageLoadError = true;
    event.target.style.display = 'none';
  }

  onImageLoad(event: any) {
    this.imageLoadError = false;
    event.target.style.display = 'block';
  }

  isAdminUser(): boolean {
    return this.roleService.isAdmin();
  }

  getCurrentRole(): string | null {
    return this.roleService.getCurrentRole();
  }

  private updateCurrentInfo() {
    const info = this.themeService.getMunicipalityInfo();
    this.currentMunicipalityName = info.name;
    this.currentMunicipalityFullName = info.fullName;
    this.currentMunicipalityEmail = info.email;
    this.currentLogoPath = info.logoPath;
  }
} 