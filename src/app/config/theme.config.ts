import { compileInjectable } from '@angular/compiler';

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
    backgroundImagePath: 'assets/images/conchali-background.jpg',
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
    backgroundCard: '#ffffff',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '2.5rem',
    xxxl: '3rem',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '20px',
    full: '50%',
  },
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
      backgroundImagePath: 'assets/images/concepcion-background.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1e40af', // Azul
      primaryLight: '#3b82f6',
      primaryDark: '#1e3a8a',
      primaryVeryLight: '#eff6ff',
      primaryBorder: '#dbeafe',
      primaryRgb: '30, 64, 175',
      accent: '#059669', // Verde diferente
    },
  } as ThemeConfig,

  // Municipalidad de Valparaíso (tema verde)
  valparaiso: {
    ...defaultTheme,
    municipality: {
      name: 'VALPARAÍSO',
      fullName: 'Municipalidad de Valparaíso',
      email: 'rrhh@valparaiso.cl',
      logoPath: 'assets/images/logovalparaiso.png',
      backgroundImagePath: 'assets/images/valparaiso-background.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#059669', // Verde
      primaryLight: '#10b981',
      primaryDark: '#047857',
      primaryVeryLight: '#ecfdf5',
      primaryBorder: '#a7f3d0',
      primaryRgb: '5, 150, 105',
      accent: '#f59e0b', // Naranja de acento
    },
  } as ThemeConfig,

  // Municipalidad de Coinco
  coinco: {
    ...defaultTheme,
    municipality: {
      name: 'COINCO',
      fullName: 'Municipalidad de Coinco',
      email: 'rrhh@coinco.cl',
      logoPath: 'assets/images/coinco.png',
      backgroundImagePath: 'assets/images/coinco.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#003E80', // Azul profundo
      primaryLight: '#336CB3',
      primaryDark: '#002C5C',
      primaryVeryLight: '#E6EEF8',
      primaryBorder: '#A3B9D6',
      primaryRgb: '0, 62, 128',
      accent: '#f59e0b', // Naranja de acento
    },
  } as ThemeConfig,

  // Municipalidad de Huechuraba
  huechuraba: {
    ...defaultTheme,
    municipality: {
      name: 'HUECHURABA',
      fullName: 'Municipalidad de Huechuraba',
      email: 'rrhh@huechuraba.cl',
      logoPath: 'assets/images/Huechuraba.png',
      backgroundImagePath: 'assets/images/Huechuraba.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1E90FF', // Azul logo Huechuraba
      primaryLight: '#63B3FF',
      primaryDark: '#125CA8',
      primaryVeryLight: '#E8F4FF',
      primaryBorder: '#B8D9FF',
      primaryRgb: '30, 144, 255',
      accent: '#003E80', // Azul profundo de acento
    },
  } as ThemeConfig,
  // Municipalidad de Lonquimay
  lonquimay: {
    ...defaultTheme,
    municipality: {
      name: 'LONQUIMAY',
      fullName: 'Municipalidad de Lonquimay',
      email: 'rrhh@lonquimay.cl',
      logoPath: 'assets/images/Lonquimay.png',
      backgroundImagePath: 'assets/images/Lonquimay.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#45B4AF', // Turquesa base
      primaryLight: '#6FD0CC',
      primaryDark: '#32918D',
      primaryVeryLight: '#E1F4F4',
      primaryBorder: '#C0E8E7',
      primaryRgb: '69, 180, 175',
      accent: '#2563eb', // Azul de acento
    },
  } as ThemeConfig,

  // Municipalidad de Antuco
  antuco: {
    ...defaultTheme,
    municipality: {
      name: 'ANTUCO',
      fullName: 'Municipalidad de Antuco',
      email: 'rrhh@antuco.cl',
      logoPath: 'assets/images/Antuco.png',
      backgroundImagePath: 'assets/images/Antuco.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#30589C',
      primaryLight: '#5F82BF',
      primaryDark: '#21406B',
      primaryVeryLight: '#E2E8F5',
      primaryBorder: '#B6C5E3',
      primaryRgb: '48, 88, 156',
      accent: '#f59e0b',
    },
  } as ThemeConfig,

  // Municipalidad de Cañete
  canete: {
    ...defaultTheme,
    municipality: {
      name: 'CANETE',
      fullName: 'Municipalidad de Cañete',
      email: 'rrhh@canete.cl',
      logoPath: 'assets/images/Canete.png',
      backgroundImagePath: 'assets/images/Canete.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#4CAF50',
      primaryLight: '#80C77F',
      primaryDark: '#35773A',
      primaryVeryLight: '#E8F6E9',
      primaryBorder: '#B5DAB6',
      primaryRgb: '76, 175, 80',
      accent: '#2563eb',
    },
  } as ThemeConfig,

  // Municipalidad de Cauquenes
  cauquenes: {
    ...defaultTheme,
    municipality: {
      name: 'CAUQUENES',
      fullName: 'Municipalidad de Cauquenes',
      email: 'rrhh@cauquenes.cl',
      logoPath: 'assets/images/Cauquenes.png',
      backgroundImagePath: 'assets/images/Cauquenes.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#0D6BDF', // Azul institucional más suave
      primaryLight: '#4A93E8',
      primaryDark: '#084AA0',
      primaryVeryLight: '#E6F0FC',
      primaryBorder: '#A7C7F3',
      primaryRgb: '13, 107, 223',
      accent: '#f59e0b',
    },
  } as ThemeConfig,

  // Municipalidad de Chañaral
  chanaral: {
    ...defaultTheme,
    municipality: {
      name: 'CHANARAL',
      fullName: 'Municipalidad de Chañaral',
      email: 'rrhh@chanaral.cl',
      logoPath: 'assets/images/Chanaral.png',
      backgroundImagePath: 'assets/images/Chanaral.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#2F6FBC', // Azul medio contrastante
      primaryLight: '#5F96D1',
      primaryDark: '#204C7F',
      primaryVeryLight: '#E5EEF8',
      primaryBorder: '#AEC6E5',
      primaryRgb: '47, 111, 188',
      accent: '#f59e0b',
    },
  } as ThemeConfig,

  // Municipalidad de Chanco
  chanco: {
    ...defaultTheme,
    municipality: {
      name: 'CHANCO',
      fullName: 'Municipalidad de Chanco',
      email: 'rrhh@chanco.cl',
      logoPath: 'assets/images/Chanco.png',
      backgroundImagePath: 'assets/images/Chanco.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#003E80', // Azul profundo especificado
      primaryLight: '#336CB3',
      primaryDark: '#002C5C',
      primaryVeryLight: '#E6EEF8',
      primaryBorder: '#A3B9D6',
      primaryRgb: '0, 62, 128',
      accent: '#f59e0b',
    },
  } as ThemeConfig,

  // Municipalidad de Constitución
  constitucion: {
    ...defaultTheme,
    municipality: {
      name: 'CONSTITUCIÓN',
      fullName: 'Municipalidad de Constitución',
      email: 'rrhh@constitucion.cl',
      logoPath: 'assets/images/Constitucion.png',
      backgroundImagePath: 'assets/images/Constitucion.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#C8102E',
      primaryLight: '#D94D60',
      primaryDark: '#8E0B1F',
      primaryVeryLight: '#F9E6E9',
      primaryBorder: '#E7A6B0',
      primaryRgb: '200, 16, 46',
      accent: '#2563eb',
    },
  } as ThemeConfig,

  // Municipalidad de Contulmo
  contulmo: {
    ...defaultTheme,
    municipality: {
      name: 'CONTULMO',
      fullName: 'Municipalidad de Contulmo',
      email: 'rrhh@contulmo.cl',
      logoPath: 'assets/images/Contulmo.png',
      backgroundImagePath: 'assets/images/Contulmo.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#00994D',
      primaryLight: '#33B975',
      primaryDark: '#006A35',
      primaryVeryLight: '#E6F7ED',
      primaryBorder: '#A6DDBF',
      primaryRgb: '0, 153, 77',
      accent: '#2563eb',
    },
  } as ThemeConfig,

  // Municipalidad de Corral
  corral: {
    ...defaultTheme,
    municipality: {
      name: 'CORRAL',
      fullName: 'Municipalidad de Corral',
      email: 'rrhh@corral.cl',
      logoPath: 'assets/images/Corral.png',
      backgroundImagePath: 'assets/images/Corral.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#00A5AE',
      primaryLight: '#4CC5CC',
      primaryDark: '#00757A',
      primaryVeryLight: '#E6F8F9',
      primaryBorder: '#A6DEE1',
      primaryRgb: '0, 165, 174',
      accent: '#f59e0b',
    },
  } as ThemeConfig,

  // Municipalidad de El Bosque
  el_bosque: {
    ...defaultTheme,
    municipality: {
      name: 'BOSQUE',
      fullName: 'Municipalidad de El Bosque',
      email: 'rrhh@elbosque.cl',
      logoPath: 'assets/images/El_Bosque.png',
      backgroundImagePath: 'assets/images/El_Bosque.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#67B135',
      primaryLight: '#90C76C',
      primaryDark: '#478022',
      primaryVeryLight: '#EFF7E9',
      primaryBorder: '#C5DEAA',
      primaryRgb: '103, 177, 53',
      accent: '#662e8f', // Morado del logo interior
    },
  } as ThemeConfig,
  // Municipalidad de Colina
  colina: {
    ...defaultTheme,
    municipality: {
      name: 'COLINA',
      fullName: 'Municipalidad de Colina',
      email: 'rrhh@colina.cl',
      logoPath: 'assets/images/Colina.png',
      backgroundImagePath: 'assets/images/Colina.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#67B135',
      primaryLight: '#90C76C',
      primaryDark: '#478022',
      primaryVeryLight: '#EFF7E9',
      primaryBorder: '#C5DEAA',
      primaryRgb: '103, 177, 53',
      accent: '#662e8f', // Morado del logo interior
    },
  } as ThemeConfig,
  // Municipalidad de Providencia
  providencia: {
    ...defaultTheme,
    municipality: {
      name: 'PROVIDENCIA',
      fullName: 'Municipalidad de Providencia',
      email: 'rrhh@providencia.cl',
      logoPath: 'assets/images/providencia.png',
      backgroundImagePath: 'assets/images/providencia.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#01af40', // Verde base
      primaryLight: '#33c46a',
      primaryDark: '#017a2c',
      primaryVeryLight: '#e6f7ed',
      primaryBorder: '#a6e5c1',
      primaryRgb: '1, 175, 64',
      secondary: '#018f34',
      accent: '#00e676',
      accentLight: '#b2f5d6',
    },
  } as ThemeConfig,

  // Municipalidad de La Calera
  la_calera: {
    ...defaultTheme,
    municipality: {
      name: 'CALERA',
      fullName: 'Municipalidad La Calera',
      email: 'rrhh@lacalera.cl',
      logoPath: 'assets/images/La_Calera.png',
      backgroundImagePath: 'assets/images/La_Calera.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#211C4C', // Color especificado
      primaryLight: '#4D4889',
      primaryDark: '#161139',
      primaryVeryLight: '#E5E4EB',
      primaryBorder: '#8B87A1',
      primaryRgb: '33, 28, 76',
      accent: '#f59e0b',
    },
  } as ThemeConfig,

  // Municipalidad de La Florida
  la_florida: {
    ...defaultTheme,
    municipality: {
      name: 'FLORIDA',
      fullName: 'Municipalidad de La Florida',
      email: 'rrhh@laflorida.cl',
      logoPath: 'assets/images/La_Florida.png',
      backgroundImagePath: 'assets/images/La_Florida.jpg',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#0DAC3A',
      primaryLight: '#4ACF6D',
      primaryDark: '#0A7C2A',
      primaryVeryLight: '#E8F8EC',
      primaryBorder: '#A5E3B3',
      primaryRgb: '13, 172, 58',
      accent: '#2563eb',
    },
  } as ThemeConfig,

  // Municipalidad de Romeral
  romeral: {
    ...defaultTheme,
    municipality: {
      name: 'ROMERAL',
      fullName: 'Municipalidad de Romeral',
      email: 'rrhh@romeral.cl',
      logoPath: 'assets/images/RomeralLogo.png',
      backgroundImagePath: 'assets/images/RomeralFondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#009999', // Verde principal nuevo
      primaryLight: '#33bdbd', // Verde claro
      primaryDark: '#006666', // Verde oscuro
      primaryVeryLight: '#e0f7f7', // Verde muy claro
      primaryBorder: '#66cccc', // Borde verde claro
      primaryRgb: '0, 153, 153',
      secondary: '#334155', // Gris oscuro para contraste
      accent: '#FF9800', // Naranja cálido para acento
      accentLight: '#FFE0B2',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#ea580c',
      info: '#0066b3',
      // Grises y fondos se mantienen igual
    },
  } as ThemeConfig,

  // Municipalidad de Romeral
  saavedra: {
    ...defaultTheme,
    municipality: {
      name: 'SAAVEDRA',
      fullName: 'Municipalidad de Saavedra',
      email: 'rrhh@saavedra.cl',
      logoPath: 'assets/images/Saavedra.png',
      backgroundImagePath: 'assets/images/Saavedra.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1B5EA5', // Azul principal del escudo
      primaryLight: '#3A8DDE', // Azul claro
      primaryDark: '#0B2C4A', // Azul oscuro
      primaryVeryLight: '#EAF4FB', // Azul muy claro para fondos
      primaryBorder: '#A3C6E5', // Azul grisáceo claro
      primaryRgb: '27, 94, 165',
      secondary: '#FFD76A', // Amarillo dorado
      accent: '#A12A1A', // Rojo oscuro
      accentLight: '#F5C6C6', // Rojo claro
      textColor: '#0B2C4A', // Azul oscuro para texto
      textColorLight: '#3A8DDE', // Azul claro para texto secundario
      textColorMuted: '#A3C6E5', // Azul grisáceo claro para texto atenuado
      backgroundColor: '#FFFFFF', // Blanco
      backgroundAlt: '#EAF4FB', // Azul muy claro
      backgroundCard: '#FFFFFF', // Blanco
      // Los colores de estado y grises se mantienen igual
    },
  } as ThemeConfig,
  // Municipalidad de Santiago
  santiago: {
    ...defaultTheme,
    municipality: {
      name: 'SANTIAGO',
      fullName: 'Municipalidad de Santiago',
      email: 'rrhh@santiago.cl',
      logoPath: 'assets/images/Santiago.png',
      backgroundImagePath: 'assets/images/Santiago.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#6C2184', // Morado principal
      primaryLight: '#8E3CB0', // Morado claro
      primaryDark: '#4B155A', // Morado oscuro
      primaryVeryLight: '#F3E6F8', // Morado muy claro para fondos
      primaryBorder: '#C9A4DB', // Borde morado claro
      primaryRgb: '108, 33, 132',
      secondary: '#2196F3', // Azul claro
      accent: '#FFD600', // Amarillo dorado
      accentLight: '#FFF9C4', // Amarillo muy claro
      textColor: '#4B155A', // Morado oscuro para texto
      textColorLight: '#8E3CB0', // Morado claro para texto secundario
      textColorMuted: '#C9A4DB', // Morado claro para texto atenuado
      backgroundColor: '#FFFFFF', // Blanco
      backgroundAlt: '#F3E6F8', // Morado muy claro
      backgroundCard: '#FFFFFF', // Blanco
    },
  } as ThemeConfig,
  llayllay: {
    ...defaultTheme,
    municipality: {
      name: 'LLAYLLAY',
      fullName: 'Municipalidad de Llayllay',
      email: 'rrhh@llayllay.cl',
      logoPath: 'assets/images/Llayllay.png',
      backgroundImagePath: 'assets/images/Llayllay.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1B5EA5', // Azul principal del escudo
      primaryLight: '#3A8DDE', // Azul claro
      primaryDark: '#0B2C4A', // Azul oscuro
      primaryVeryLight: '#EAF4FB', // Azul muy claro para fondos
      primaryBorder: '#A3C6E5', // Azul grisáceo claro
      primaryRgb: '27, 94, 165',
      secondary: '#FFD76A', // Amarillo dorado
      accent: '#A12A1A', // Rojo oscuro
      accentLight: '#F5C6C6', // Rojo claro
      textColor: '#0B2C4A', // Azul oscuro para texto
      textColorLight: '#3A8DDE', // Azul claro para texto secundario
      textColorMuted: '#A3C6E5', // Azul grisáceo claro para texto atenuado
      backgroundColor: '#FFFFFF', // Blanco
      backgroundAlt: '#EAF4FB', // Azul muy claro
      backgroundCard: '#FFFFFF', // Blanco
    },
  } as ThemeConfig,

    rioverde: {
      ...defaultTheme,
      municipality: {
        name: 'RIO VERDE',
        fullName: 'Municipalidad de Rio Verde',
        email: 'rrhh@rioverde.cl',
        logoPath: 'assets/images/RioVerde.png',
        backgroundImagePath: 'assets/images/RioVerde.png',
      },
      colors: {
        ...defaultTheme.colors,
        primary: '#00994D',
        primaryLight: '#33B975',
        primaryDark: '#006A35',
        primaryVeryLight: '#E6F7ED',
        primaryBorder: '#A6DDBF',
        primaryRgb: '0, 153, 77',
        accent: '#2563eb',
      },
    } as ThemeConfig,
    pintana: {
      ...defaultTheme,
      municipality: {
        name: 'LA PINTANA' ,
        fullName: 'Municipalidad de La Pintana',
        email: 'rrhh@pintana.cl',
        logoPath: 'assets/images/pintana.png',
        backgroundImagePath: 'assets/images/pintana.png',
      },
      colors: {
        ...defaultTheme.colors,
        primary: '#6C2184', // Morado principal
        primaryLight: '#8E3CB0', // Morado claro
      primaryDark: '#4B155A', // Morado oscuro
      primaryVeryLight: '#F3E6F8', // Morado muy claro para fondos
      primaryBorder: '#C9A4DB', // Borde morado claro
      primaryRgb: '108, 33, 132',
      secondary: '#2196F3', // Azul claro
      accent: '#FFD600'
      },
    } as ThemeConfig,
  macul: {
    ...defaultTheme,
    municipality: {
      name: 'MACUL',
      fullName: 'Ilustre Municipalidad de Macul',
      email: 'rrhh@macul.cl',
      logoPath: 'assets/images/macul3.png',
      backgroundImagePath: 'assets/images/macul3.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1177c8', // Azul principal del logo
      primaryLight: '#336CB3', // Azul claro estilo Chanco
      primaryDark: '#0a4d7a', // Azul oscuro
      primaryVeryLight: '#E6EEF8', // Azul muy claro para fondos
      primaryBorder: '#A3B9D6', // Azul claro para bordes
      primaryRgb: '17, 119, 200',
      secondary: '#003E80', // Azul profundo para contraste
      accent: '#f59e0b', // Naranja de acento (puede usarse para botones o detalles)
      accentLight: '#FFE0B2', // Naranja claro
      textColor: '#0a4d7a', // Azul oscuro para texto
      textColorLight: '#336CB3', // Azul claro para texto secundario
      textColorMuted: '#A3B9D6', // Azul claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#E6EEF8', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
    },
  } as ThemeConfig,
};

// Función para obtener el tema actual (por defecto Conchalí)
export function getCurrentTheme(): ThemeConfig {
  // Obtener tema desde localStorage con la clave correcta
  const themeName = localStorage.getItem('globalSelectedTheme') || 'conchali';
  return (
    availableThemes[themeName as keyof typeof availableThemes] || defaultTheme
  );
}
