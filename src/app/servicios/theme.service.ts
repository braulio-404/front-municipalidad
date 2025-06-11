import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { ThemeConfig, getCurrentTheme, availableThemes } from '../config/theme.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<ThemeConfig>(getCurrentTheme());
  public currentTheme$ = this.currentThemeSubject.asObservable();
  private currentThemeName = 'conchali';
  private apiUrl = 'http://localhost:3001/api/theme';
  private eventSource: EventSource | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000;
  private syncInProgress = false;
  
  // Cache de imágenes precargadas
  private imageCache = new Map<string, boolean>();
  private preloadPromises = new Map<string, Promise<void>>();

  constructor(private http: HttpClient) {
    // Inicializar tema desde localStorage como fallback inmediato
    this.currentThemeName = localStorage.getItem('globalSelectedTheme') || 'conchali';
    
    this.loadInitialTheme();
    this.initServerSync();
    this.preloadAllThemeImages(); // Precargar todas las imágenes al iniciar
  }

  /**
   * 🚀 NUEVA FUNCIONALIDAD: Inicializa la sincronización en tiempo real con el servidor
   */
  private initServerSync(): void {
    if (typeof window !== 'undefined' && EventSource) {
      try {
        this.eventSource = new EventSource(`${this.apiUrl}/stream`);
        
        this.eventSource.onopen = () => {
          console.log('🔗 Conectado al servidor de sincronización');
        };
        
        this.eventSource.onmessage = (event) => {
          if (this.syncInProgress) return; // Evitar bucles
          
          try {
            const config = JSON.parse(event.data);
            console.log('📡 Recibido cambio de tema desde servidor:', config);
            
            const { selectedTheme, lastUpdated } = config;
            const localUpdate = localStorage.getItem('themeLastUpdate');
            
            // Solo actualizar si es más reciente que nuestro local
            if (!localUpdate || lastUpdated > localUpdate) {
              console.log('🔄 Aplicando tema desde servidor:', selectedTheme);
              this.applyThemeFromServer(selectedTheme, lastUpdated);
            }
          } catch (error) {
            console.error('Error procesando mensaje del servidor:', error);
          }
        };
        
        this.eventSource.onerror = (error) => {
          console.warn('❌ Error en conexión SSE, reintentando...', error);
          this.reconnectToServer();
        };
        
      } catch (error) {
        console.warn('⚠️ Server-Sent Events no disponible, usando polling');
        this.fallbackToPolling();
      }
    }
  }

  /**
   * Reconecta al servidor después de un error
   */
  private reconnectToServer(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    // Reintentar conexión después de 5 segundos
    timer(5000).subscribe(() => {
      console.log('🔄 Reintentando conexión al servidor...');
      this.initServerSync();
    });
  }

  /**
   * Fallback a polling si SSE no está disponible
   */
  private fallbackToPolling(): void {
    timer(0, 10000).subscribe(() => { // Polling cada 10 segundos
      this.checkServerForUpdates();
    });
  }

  /**
   * Verifica el servidor por actualizaciones (método de polling)
   */
  private checkServerForUpdates(): void {
    if (this.syncInProgress) return;
    
    this.http.get<{selectedTheme: string, lastUpdated: string}>(`${this.apiUrl}/current`).subscribe({
      next: (config) => {
        const localUpdate = localStorage.getItem('themeLastUpdate');
        
        if (!localUpdate || config.lastUpdated > localUpdate) {
          console.log('📡 Nuevo tema detectado via polling:', config.selectedTheme);
          this.applyThemeFromServer(config.selectedTheme, config.lastUpdated);
        }
      },
      error: (error) => {
        // Silencioso para no spam en consola
      }
    });
  }

  /**
   * Aplica un tema recibido desde el servidor
   */
  private applyThemeFromServer(themeName: string, timestamp: string): void {
    console.log('📡 Aplicando tema desde servidor:', themeName);
    
    const theme = availableThemes[themeName as keyof typeof availableThemes];
    if (theme) {
      this.currentThemeName = themeName;
      
      // NOTIFICAR INMEDIATAMENTE a todos los suscriptores
      console.log('📡 Notificando INMEDIATAMENTE cambio de tema desde servidor a suscriptores:', themeName);
      console.log('👥 Número de suscriptores activos ANTES:', this.currentThemeSubject.observers.length);
      
      this.currentThemeSubject.next(theme);
      this.applyTheme(theme);
      
      console.log('👥 Número de suscriptores activos DESPUÉS:', this.currentThemeSubject.observers.length);
      
      // Actualizar localStorage
      localStorage.setItem('globalSelectedTheme', themeName);
      localStorage.setItem('themeLastUpdate', timestamp);
      
      // Precargar imágenes en segundo plano
      this.preloadThemeImagesBackground(themeName);
      
      console.log('✅ Tema sincronizado INMEDIATAMENTE desde servidor:', themeName);
    } else {
      console.error('❌ Tema no encontrado en servidor:', themeName);
    }
  }

  /**
   * Carga el tema inicial, intentando desde servidor primero, luego localStorage
   */
  private loadInitialTheme(): void {
    // 1. Intentar cargar desde servidor
    this.http.get<{selectedTheme: string, lastUpdated: string}>(`${this.apiUrl}/current`).subscribe({
      next: (config) => {
        console.log('✅ Tema cargado desde servidor:', config);
        
        const localUpdate = localStorage.getItem('themeLastUpdate');
        const localTheme = localStorage.getItem('globalSelectedTheme');
        
        let finalTheme: string;
        let finalTimestamp: string;
        
        // Usar el más reciente entre servidor y localStorage
        if (localUpdate && localTheme && localUpdate > config.lastUpdated) {
          finalTheme = localTheme;
          finalTimestamp = localUpdate;
          console.log('🏆 Usando tema local (más reciente):', finalTheme);
        } else {
          finalTheme = config.selectedTheme;
          finalTimestamp = config.lastUpdated;
          console.log('🏆 Usando tema del servidor:', finalTheme);
          
          // Actualizar localStorage
          localStorage.setItem('globalSelectedTheme', finalTheme);
          localStorage.setItem('themeLastUpdate', finalTimestamp);
        }
        
        this.setThemeLocally(finalTheme);
      },
      error: (error) => {
        console.warn('⚠️ Servidor no disponible, usando localStorage');
        this.loadFromLocalStorage();
      }
    });
  }

  /**
   * Carga el tema desde localStorage como fallback
   */
  private loadFromLocalStorage(): void {
    const savedTheme = localStorage.getItem('globalSelectedTheme') || 'conchali';
    console.log('📦 Cargando tema desde localStorage:', savedTheme);
    this.setThemeLocally(savedTheme);
  }

  /**
   * Aplica un tema localmente sin sincronizar
   */
  private setThemeLocally(themeName: string): void {
    this.currentThemeName = themeName;
    const theme = availableThemes[themeName as keyof typeof availableThemes];
    
    if (theme) {
      console.log('🔄 Aplicando tema localmente y notificando suscriptores:', themeName);
      this.currentThemeSubject.next(theme);
      this.applyTheme(theme);
      console.log('✅ Tema aplicado localmente:', themeName);
      console.log('👥 Suscriptores notificados:', this.currentThemeSubject.observers.length);
    } else {
      console.warn('⚠️ Tema no válido, usando por defecto');
      this.applyTheme(this.currentThemeSubject.value);
    }
  }

  /**
   * 🚀 MÉTODO PRINCIPAL: Cambia el tema y sincroniza automáticamente entre navegadores
   */
  async setTheme(themeName: string, adminUser: string = 'admin'): Promise<void> {
    console.log(`🎨 Cambiando tema a: ${themeName}`);
    
    // Verificar que el tema existe
    const theme = availableThemes[themeName as keyof typeof availableThemes];
    if (!theme) {
      console.error(`❌ Tema no encontrado: ${themeName}`);
      return;
    }

    // APLICAR EL TEMA INMEDIATAMENTE - NO ESPERAR PRECARGA
    this.currentThemeName = themeName;
    console.log('🚀 Notificando cambio de tema INMEDIATAMENTE desde setTheme() a suscriptores:', themeName);
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    console.log('👥 Suscriptores notificados INMEDIATAMENTE desde setTheme():', this.currentThemeSubject.observers.length);

    // Actualizar localStorage inmediatamente
    localStorage.setItem('globalSelectedTheme', themeName);
    localStorage.setItem('themeLastUpdate', new Date().toISOString());

    // Sincronizar con el servidor inmediatamente
    this.syncWithServer(themeName, adminUser);

    // Precargar imágenes EN SEGUNDO PLANO (no bloquea la UI)
    this.preloadThemeImagesBackground(themeName);
  }

  /**
   * Precarga imágenes del tema en segundo plano sin bloquear
   */
  private preloadThemeImagesBackground(themeName: string): void {
    const theme = availableThemes[themeName as keyof typeof availableThemes];
    if (!theme) return;

    // Usar setTimeout para ejecutar en el siguiente ciclo de eventos
    setTimeout(() => {
      const preloadPromises: Promise<void>[] = [];
      
      if (theme.municipality.logoPath) {
        preloadPromises.push(this.preloadImage(theme.municipality.logoPath, `${themeName}-logo`));
      }
      
      if (theme.municipality.backgroundImagePath) {
        preloadPromises.push(this.preloadImage(theme.municipality.backgroundImagePath, `${themeName}-background`));
      }

      Promise.all(preloadPromises).then(() => {
        console.log(`🖼️ Imágenes del tema ${themeName} precargadas en segundo plano`);
      }).catch((error) => {
        console.warn(`⚠️ Algunas imágenes del tema ${themeName} no se pudieron precargar en segundo plano:`, error);
      });
    }, 0);
  }

  /**
   * Sincroniza el tema con el servidor
   */
  private syncWithServer(themeName: string, adminUser: string): void {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    
    this.http.post<any>(`${this.apiUrl}/update`, { 
      themeName, 
      adminUser 
    }).subscribe({
      next: (response) => {
        console.log(`🌐 Tema sincronizado con servidor: ${themeName}`);
        this.syncInProgress = false;
      },
      error: (error) => {
        console.warn('⚠️ Error al sincronizar con servidor:', error);
        this.syncInProgress = false;
      }
    });
  }

  /**
   * Obtiene si una imagen está precargada
   */
  isImagePreloaded(imagePath: string, themeName: string, type: 'logo' | 'background'): boolean {
    const cacheKey = `${themeName}-${type}`;
    return this.imageCache.has(cacheKey) && this.imageCache.get(cacheKey) === true;
  }

  /**
   * Fuerza la precarga de imágenes de un tema específico
   */
  async preloadThemeImages(themeName: string): Promise<void> {
    const theme = availableThemes[themeName as keyof typeof availableThemes];
    if (!theme) return;

    const promises: Promise<void>[] = [];
    
    if (theme.municipality.logoPath) {
      promises.push(this.preloadImage(theme.municipality.logoPath, `${themeName}-logo`));
    }
    
    if (theme.municipality.backgroundImagePath) {
      promises.push(this.preloadImage(theme.municipality.backgroundImagePath, `${themeName}-background`));
    }

    await Promise.all(promises);
  }

  /**
   * Precarga todas las imágenes de los temas disponibles
   */
  private preloadAllThemeImages(): void {
    console.log('🖼️ Precargando imágenes de todos los temas...');
    
    Object.keys(availableThemes).forEach(themeName => {
      const theme = availableThemes[themeName as keyof typeof availableThemes];
      
      // Precargar logo
      if (theme.municipality.logoPath) {
        this.preloadImage(theme.municipality.logoPath, `${themeName}-logo`);
      }
      
      // Precargar imagen de fondo si existe
      if (theme.municipality.backgroundImagePath) {
        this.preloadImage(theme.municipality.backgroundImagePath, `${themeName}-background`);
      }
    });
  }

  /**
   * Precarga una imagen específica
   */
  private preloadImage(imagePath: string, cacheKey: string): Promise<void> {
    // Si ya está en cache o se está cargando, devolver la promesa existente
    if (this.imageCache.has(cacheKey)) {
      return Promise.resolve();
    }
    
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey)!;
    }

    const preloadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.imageCache.set(cacheKey, true);
        console.log(`✅ Imagen precargada: ${imagePath}`);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`⚠️ Error al precargar imagen: ${imagePath}`);
        this.imageCache.set(cacheKey, false); // Marcar como fallida pero en cache
        resolve(); // No rechazar para no afectar otras cargas
      };
      
      img.src = imagePath;
    });

    this.preloadPromises.set(cacheKey, preloadPromise);
    return preloadPromise;
  }

  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): ThemeConfig {
    return this.currentThemeSubject.value;
  }

  /**
   * Obtiene el nombre del tema actual
   */
  getCurrentThemeName(): string {
    return this.currentThemeName;
  }

  /**
   * Fuerza una recarga del tema desde el servidor
   */
  forceReload(): void {
    console.log('🔄 Forzando recarga del tema...');
    this.loadInitialTheme();
  }

  /**
   * Recarga el tema actual
   */
  reloadTheme(): void {
    this.applyTheme(this.currentThemeSubject.value);
  }

  /**
   * Obtiene todos los temas disponibles
   */
  getAvailableThemes(): typeof availableThemes {
    return availableThemes;
  }

     /**
    * Aplica las variables CSS del tema
    */
   private applyTheme(theme: ThemeConfig): void {
     const root = document.documentElement;
     
     // Aplicar colores principales
     root.style.setProperty('--primary-color', theme.colors.primary);
     root.style.setProperty('--primary-color-light', theme.colors.primaryLight);
     root.style.setProperty('--primary-color-dark', theme.colors.primaryDark);
     root.style.setProperty('--primary-color-very-light', theme.colors.primaryVeryLight);
     root.style.setProperty('--primary-color-border', theme.colors.primaryBorder);
     root.style.setProperty('--primary-color-rgb', theme.colors.primaryRgb);

     root.style.setProperty('--secondary-color', theme.colors.secondary);

     root.style.setProperty('--accent-color', theme.colors.accent);
     root.style.setProperty('--accent-color-light', theme.colors.accentLight);

     // Colores de estado
     root.style.setProperty('--error-color', theme.colors.error);
     root.style.setProperty('--success-color', theme.colors.success);
     root.style.setProperty('--warning-color', theme.colors.warning);
     root.style.setProperty('--info-color', theme.colors.info);

     // Grises
     root.style.setProperty('--gray-50', theme.colors.gray50);
     root.style.setProperty('--gray-100', theme.colors.gray100);
     root.style.setProperty('--gray-200', theme.colors.gray200);
     root.style.setProperty('--gray-300', theme.colors.gray300);
     root.style.setProperty('--gray-400', theme.colors.gray400);
     root.style.setProperty('--gray-500', theme.colors.gray500);
     root.style.setProperty('--gray-600', theme.colors.gray600);
     root.style.setProperty('--gray-700', theme.colors.gray700);
     root.style.setProperty('--gray-800', theme.colors.gray800);
     root.style.setProperty('--gray-900', theme.colors.gray900);

     // Colores de texto
     root.style.setProperty('--text-color', theme.colors.textColor);
     root.style.setProperty('--text-color-light', theme.colors.textColorLight);
     root.style.setProperty('--text-color-muted', theme.colors.textColorMuted);

     // Colores de fondo
     root.style.setProperty('--background-color', theme.colors.backgroundColor);
     root.style.setProperty('--background-alt', theme.colors.backgroundAlt);
     root.style.setProperty('--background-card', theme.colors.backgroundCard);

     // Espaciado
     root.style.setProperty('--spacing-xs', theme.spacing.xs);
     root.style.setProperty('--spacing-sm', theme.spacing.sm);
     root.style.setProperty('--spacing-md', theme.spacing.md);
     root.style.setProperty('--spacing-lg', theme.spacing.lg);
     root.style.setProperty('--spacing-xl', theme.spacing.xl);
     root.style.setProperty('--spacing-2xl', theme.spacing.xxl);
     root.style.setProperty('--spacing-3xl', theme.spacing.xxxl);

     // Bordes redondeados
     root.style.setProperty('--border-radius-sm', theme.borderRadius.sm);
     root.style.setProperty('--border-radius-md', theme.borderRadius.md);
     root.style.setProperty('--border-radius-lg', theme.borderRadius.lg);
     root.style.setProperty('--border-radius-xl', theme.borderRadius.xl);
     root.style.setProperty('--border-radius-2xl', theme.borderRadius.xxl);
     root.style.setProperty('--border-radius-full', theme.borderRadius.full);

     console.log('🎨 Variables CSS aplicadas para tema:', this.currentThemeName);
   }

     /**
    * Obtiene la información del municipio actual
    */
   getMunicipalityInfo() {
     return this.currentThemeSubject.value.municipality;
   }

   /**
    * Obtiene la ruta del logo actual
    */
   getLogoPath(): string {
     return this.currentThemeSubject.value.municipality.logoPath;
   }

   /**
    * Obtiene el nombre del municipio actual
    */
   getMunicipalityName(): string {
     return this.currentThemeSubject.value.municipality.name;
   }

   /**
    * Obtiene el nombre completo del municipio actual
    */
   getMunicipalityFullName(): string {
     return this.currentThemeSubject.value.municipality.fullName;
   }

   /**
    * Obtiene el email del municipio actual
    */
   getMunicipalityEmail(): string {
     return this.currentThemeSubject.value.municipality.email;
   }

  /**
   * Limpia recursos al destruir el servicio
   */
  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
} 