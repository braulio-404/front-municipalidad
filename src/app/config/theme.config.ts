export interface ThemeConfig {
  // Información de la Municipalidad
  municipality: {
    name: string;
    fullName: string;
    email: string;
    logoPath: string;
    backgroundImagePath?: string;
  };

  // Paleta de colores principales
  colors: {
    // Colores primarios (morados actuales de Conchalí)
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryVeryLight: string;
    primaryBorder: string;
    primaryRgb: string;

    // Color secundario
    secondary: string;

    // Color de acento (verde actual)
    accent: string;
    accentLight: string;

    // Colores de estado
    error: string;
    success: string;
    warning: string;
    info: string;

    // Grises
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;

    // Colores de texto
    textColor: string;
    textColorLight: string;
    textColorMuted: string;

    // Colores de fondo
    backgroundColor: string;
    backgroundAlt: string;
    backgroundCard: string;
  };

  // Configuración de espaciado (mantener actuales)
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };

  // Configuración de bordes redondeados
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    full: string;
  };
}

// Configuración por defecto (valores actuales de Conchalí)
export const defaultTheme: ThemeConfig = {
  municipality: {
    name: 'CONCHALÍ',
    fullName: 'Municipalidad de Conchalí',
    email: 'rrhh@conchali.cl',
    logoPath: 'assets/images/logoconchali.png',
    backgroundImagePath: 'assets/images/conchali-background.jpg'
  },

  colors: {
    // Colores primarios (morados actuales)
    primary: '#662e8f',
    primaryLight: '#8b4db8',
    primaryDark: '#4a1f6a',
    primaryVeryLight: '#f8f1ff',
    primaryBorder: '#e5d4f0',
    primaryRgb: '102, 46, 143',

    // Color secundario
    secondary: '#334155',

    // Color de acento (verde actual)
    accent: '#34b748',
    accentLight: '#c5e8cc',

    // Colores de estado
    error: '#dc2626',
    success: '#16a34a',
    warning: '#ea580c',
    info: '#0066b3',

    // Grises
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#0f172a',

    // Colores de texto
    textColor: '#1e293b',
    textColorLight: '#64748b',
    textColorMuted: '#94a3b8',

    // Colores de fondo
    backgroundColor: '#fcfaff',
    backgroundAlt: '#f5f5f5',
    backgroundCard: '#ffffff'
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '2.5rem',
    xxxl: '3rem'
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '20px',
    full: '50%'
  }
};

// Configuraciones para diferentes municipalidades
export const availableThemes = {
  conchali: defaultTheme,
  
  // Municipalidad de Concepción (tema azul)
  concepcion: {
    ...defaultTheme,
    municipality: {
      name: 'CONCEPCIÓN',
      fullName: 'Municipalidad de Concepción',
      email: 'rrhh@concepcion.cl',
      logoPath: 'assets/images/logoconcepcion.png',
      backgroundImagePath: 'assets/images/concepcion-background.jpg'
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1e40af', // Azul
      primaryLight: '#3b82f6',
      primaryDark: '#1e3a8a',
      primaryVeryLight: '#eff6ff',
      primaryBorder: '#dbeafe',
      primaryRgb: '30, 64, 175',
      accent: '#059669' // Verde diferente
    }
  } as ThemeConfig,

  // Municipalidad de Valparaíso (tema verde)
  valparaiso: {
    ...defaultTheme,
    municipality: {
      name: 'VALPARAÍSO',
      fullName: 'Municipalidad de Valparaíso',
      email: 'rrhh@valparaiso.cl',
      logoPath: 'assets/images/logovalparaiso.png',
      backgroundImagePath: 'assets/images/valparaiso-background.jpg'
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#059669', // Verde
      primaryLight: '#10b981',
      primaryDark: '#047857',
      primaryVeryLight: '#ecfdf5',
      primaryBorder: '#a7f3d0',
      primaryRgb: '5, 150, 105',
      accent: '#f59e0b' // Naranja de acento
    }
  } as ThemeConfig,

  // Municipalidad de Santiago (tema rojo)
  santiago: {
    ...defaultTheme,
    municipality: {
      name: 'SANTIAGO',
      fullName: 'Municipalidad de Santiago',
      email: 'rrhh@santiago.cl',
      logoPath: 'assets/images/logosantiago.png',
      backgroundImagePath: 'assets/images/santiago-background.jpg'
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#dc2626', // Rojo
      primaryLight: '#ef4444',
      primaryDark: '#b91c1c',
      primaryVeryLight: '#fef2f2',
      primaryBorder: '#fecaca',
      primaryRgb: '220, 38, 38',
      accent: '#2563eb' // Azul de acento
    }
  } as ThemeConfig
};

// Función para obtener el tema actual (por defecto Conchalí)
export function getCurrentTheme(): ThemeConfig {
  // Obtener tema desde localStorage con la clave correcta
  const themeName = localStorage.getItem('globalSelectedTheme') || 'conchali';
  return availableThemes[themeName as keyof typeof availableThemes] || defaultTheme;
} 