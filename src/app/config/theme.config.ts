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

  // Municipalidad de Saavedra
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
      backgroundAlt: '#EAF4FB', // Azul muy claro alternativo
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
      primary: '#30589C', // Azul principal como Antuco
      primaryLight: '#5F82BF', // Azul claro
      primaryDark: '#21406B', // Azul oscuro
      primaryVeryLight: '#E2E8F5', // Azul muy claro para fondos
      primaryBorder: '#B6C5E3', // Borde azul claro
      primaryRgb: '48, 88, 156',
      secondary: '#37474F', // Gris azulado para contraste
      accent: '#f59e0b', // Naranja dorado como Antuco
      accentLight: '#FFE0B2', // Naranja claro
      textColor: '#263238', // Gris oscuro para mejor legibilidad
      textColorLight: '#455A64', // Gris medio para texto secundario
      textColorMuted: '#78909C', // Gris azulado para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco puro
      backgroundAlt: '#FAFAFA', // Gris muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado armonizados
      success: '#4CAF50', // Verde éxito
      warning: '#f59e0b', // Naranja advertencia (mismo que accent)
      error: '#F44336', // Rojo error
      info: '#3B82F6', // Azul información (mismo que primary)
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

  // Municipalidad de San Esteban
  sanesteban: {
    ...defaultTheme,
    municipality: {
      name: 'SAN ESTEBAN',
      fullName: 'Municipalidad de San Esteban',
      email: 'rrhh@sanesteban.cl',
      logoPath: 'assets/images/sanesteban.png',
      backgroundImagePath: 'assets/images/sanesteban.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#3B9AE1', // Azul claro principal
      primaryLight: '#6BB4E8', // Azul más claro
      primaryDark: '#2B7BB8', // Azul más oscuro
      primaryVeryLight: '#EBF5FD', // Azul muy claro para fondos
      primaryBorder: '#A3CEE8', // Azul claro para bordes
      primaryRgb: '59, 154, 225',
      secondary: '#1E40AF', // Azul profundo para contraste
      accent: '#34D399', // Verde de acento
      accentLight: '#A7F3D0', // Verde claro
      textColor: '#1E3A8A', // Azul oscuro para texto principal
      textColorLight: '#3B82F6', // Azul medio para texto secundario
      textColorMuted: '#94A3B8', // Gris azulado para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#EBF5FD', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#10B981', // Verde éxito
      warning: '#F59E0B', // Naranja advertencia
      error: '#EF4444', // Rojo error
      info: '#3B9AE1', // Azul información (mismo que primary)
    },
  } as ThemeConfig,

  // Municipalidad de Victoria
  victoria: {
    ...defaultTheme,
    municipality: {
      name: 'VICTORIA',
      fullName: 'Municipalidad de Victoria',
      email: 'rrhh@victoria.cl',
      logoPath: 'assets/images/victoria.png',
      backgroundImagePath: 'assets/images/victoriafondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1E6BB8', // Azul principal elegante
      primaryLight: '#4A8FD1', // Azul claro
      primaryDark: '#155A9B', // Azul oscuro
      primaryVeryLight: '#E8F2FB', // Azul muy claro para fondos
      primaryBorder: '#A3C7E8', // Azul claro para bordes
      primaryRgb: '30, 107, 184',
      secondary: '#1B365D', // Azul marino para contraste
      accent: '#F4A261', // Dorado/naranja de acento
      accentLight: '#FAD5A5', // Dorado claro
      textColor: '#1B365D', // Azul marino para texto principal
      textColorLight: '#4A6B8A', // Azul gris para texto secundario
      textColorMuted: '#94A3B8', // Gris para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#E8F2FB', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#16A34A', // Verde éxito
      warning: '#EA580C', // Naranja advertencia
      error: '#DC2626', // Rojo error
      info: '#1E6BB8', // Azul información (mismo que primary)
    },
  } as ThemeConfig,

  // Municipalidad de Traiguen
  traiguen: {
    ...defaultTheme,
    municipality: {
      name: 'TRAIGUEN',
      fullName: 'Municipalidad de Traiguen',
      email: 'rrhh@traiguen.cl',
      logoPath: 'assets/images/traiguen.png',
      backgroundImagePath: 'assets/images/traiguenfondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#2E7D32', // Verde principal elegante
      primaryLight: '#4CAF50', // Verde claro
      primaryDark: '#1B5E20', // Verde oscuro
      primaryVeryLight: '#E8F5E8', // Verde muy claro para fondos
      primaryBorder: '#A5D6A7', // Verde claro para bordes
      primaryRgb: '46, 125, 50',
      secondary: '#1B5E20', // Verde oscuro para contraste
      accent: '#FF9800', // Naranja de acento
      accentLight: '#FFE0B2', // Naranja claro
      textColor: '#1B5E20', // Verde oscuro para texto principal
      textColorLight: '#4CAF50', // Verde medio para texto secundario
      textColorMuted: '#81C784', // Verde claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#E8F5E8', // Verde muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#4CAF50', // Verde éxito (mismo que primaryLight)
      warning: '#FF9800', // Naranja advertencia (mismo que accent)
      error: '#F44336', // Rojo error
      info: '#2196F3', // Azul información
    },
  } as ThemeConfig,

  // Municipalidad de Talagante
  talagante: {
    ...defaultTheme,
    municipality: {
      name: 'TALAGANTE',
      fullName: 'Municipalidad de Talagante',
      email: 'rrhh@talagante.cl',
      logoPath: 'assets/images/talagante.png',
      backgroundImagePath: 'assets/images/talagante.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#D32F2F', // Rojo principal institucional
      primaryLight: '#F44336', // Rojo claro
      primaryDark: '#B71C1C', // Rojo oscuro
      primaryVeryLight: '#FFEBEE', // Rojo muy claro para fondos
      primaryBorder: '#FFCDD2', // Rojo claro para bordes
      primaryRgb: '211, 47, 47',
      secondary: '#B71C1C', // Rojo oscuro para contraste
      accent: '#FF9800', // Naranja dorado de acento
      accentLight: '#FFE0B2', // Naranja claro
      textColor: '#B71C1C', // Rojo oscuro para texto principal
      textColorLight: '#D32F2F', // Rojo medio para texto secundario
      textColorMuted: '#E57373', // Rojo claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#FFEBEE', // Rojo muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#4CAF50', // Verde éxito
      warning: '#FF9800', // Naranja advertencia (mismo que accent)
      error: '#D32F2F', // Rojo error (mismo que primary)
      info: '#2196F3', // Azul información
    },
  } as ThemeConfig,

  // Municipalidad de Mostazal
  mostazal: {
    ...defaultTheme,
    municipality: {
      name: 'MOSTAZAL',
      fullName: 'Municipalidad de Mostazal',
      email: 'rrhh@mostazal.cl',
      logoPath: 'assets/images/mostazal.png',
      backgroundImagePath: 'assets/images/mostazalfondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#009688', // Turquesa principal institucional
      primaryLight: '#4DB6AC', // Turquesa claro
      primaryDark: '#00695C', // Turquesa oscuro
      primaryVeryLight: '#E0F2F1', // Turquesa muy claro para fondos
      primaryBorder: '#B2DFDB', // Turquesa claro para bordes
      primaryRgb: '0, 150, 136',
      secondary: '#00695C', // Turquesa oscuro para contraste
      accent: '#FF7043', // Naranja coral de acento
      accentLight: '#FFCCBC', // Naranja coral claro
      textColor: '#00695C', // Turquesa oscuro para texto principal
      textColorLight: '#009688', // Turquesa medio para texto secundario
      textColorMuted: '#80CBC4', // Turquesa claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#E0F2F1', // Turquesa muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#4CAF50', // Verde éxito
      warning: '#FF9800', // Naranja advertencia
      error: '#F44336', // Rojo error
      info: '#009688', // Turquesa información (mismo que primary)
    },
  } as ThemeConfig,

  // Municipalidad de Puchuncaví
  puchuncavi: {
    ...defaultTheme,
    municipality: {
      name: 'PUCHUNCAVÍ',
      fullName: 'Municipalidad de Puchuncaví',
      email: 'rrhh@puchuncavi.cl',
      logoPath: 'assets/images/puchuncavi.png',
      backgroundImagePath: 'assets/images/puchuncavifondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1976D2', // Azul marino principal (representa el mar)
      primaryLight: '#42A5F5', // Azul claro
      primaryDark: '#0D47A1', // Azul oscuro
      primaryVeryLight: '#E3F2FD', // Azul muy claro para fondos
      primaryBorder: '#90CAF9', // Azul claro para bordes
      primaryRgb: '25, 118, 210',
      secondary: '#388E3C', // Verde natural (representa las montañas/naturaleza)
      accent: '#4CAF50', // Verde acento
      accentLight: '#C8E6C9', // Verde claro
      textColor: '#0D47A1', // Azul oscuro para texto principal
      textColorLight: '#1976D2', // Azul medio para texto secundario
      textColorMuted: '#64B5F6', // Azul claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#E3F2FD', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#4CAF50', // Verde éxito (mismo que accent)
      warning: '#FF9800', // Naranja advertencia
      error: '#F44336', // Rojo error
      info: '#1976D2', // Azul información (mismo que primary)
    },
  } as ThemeConfig,

  // Municipalidad de Los Ángeles
  losangeles: {
    ...defaultTheme,
    municipality: {
      name: 'LOS ÁNGELES',
      fullName: 'Municipalidad de Los Ángeles',
      email: 'rrhh@losangeles.cl',
      logoPath: 'assets/images/losangeles.png',
      backgroundImagePath: 'assets/images/losangeles.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1565C0', // Azul principal institucional
      primaryLight: '#1976D2', // Azul claro
      primaryDark: '#0D47A1', // Azul oscuro
      primaryVeryLight: '#E3F2FD', // Azul muy claro para fondos
      primaryBorder: '#90CAF9', // Azul claro para bordes
      primaryRgb: '21, 101, 192',
      secondary: '#0277BD', // Azul secundario más profundo
      accent: '#FF8F00', // Dorado/naranja de acento
      accentLight: '#FFE0B2', // Dorado claro
      textColor: '#0D47A1', // Azul oscuro para texto principal
      textColorLight: '#1565C0', // Azul medio para texto secundario
      textColorMuted: '#64B5F6', // Azul claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco
      backgroundAlt: '#E3F2FD', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado personalizados
      success: '#4CAF50', // Verde éxito
      warning: '#FF8F00', // Naranja advertencia (mismo que accent)
      error: '#F44336', // Rojo error
      info: '#1565C0', // Azul información (mismo que primary)
    },
  } as ThemeConfig,

  // Municipalidad de La Unión
  launion: {
    ...defaultTheme,
    municipality: {
      name: 'LA UNIÓN',
      fullName: 'Municipalidad de La Unión',
      email: 'rrhh@launion.cl',
      logoPath: 'assets/images/launion.png',
      backgroundImagePath: 'assets/images/launionfondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#5B2C87', // Violeta que coincide más con el logo del escudo
      primaryLight: '#7C3AED', // Violeta claro más acorde al logo
      primaryDark: '#4A1A69', // Violeta oscuro que complementa el logo
      primaryVeryLight: '#F5F3FF', // Violeta muy claro para fondos, compatible con logo
      primaryBorder: '#E0E7FF', // Violeta muy suave para bordes
      primaryRgb: '91, 44, 135',
      secondary: '#1F2937', // Gris oscuro neutro
      accent: '#10B981', // Verde que coincide con el círculo verde del logo
      accentLight: '#D1FAE5', // Verde claro suave
      textColor: '#1F2937', // Gris oscuro para texto principal
      textColorLight: '#4B5563', // Gris medio para texto secundario
      textColorMuted: '#6B7280', // Gris medio para texto atenuado
      backgroundColor: '#FEFFFE', // Fondo casi blanco con ligero tinte
      backgroundAlt: '#F8FAFC', // Gris muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco puro para tarjetas
      // Colores de estado balanceados con el tema
      success: '#10B981', // Verde éxito (mismo que accent del logo)
      warning: '#F59E0B', // Naranja advertencia equilibrado
      error: '#EF4444', // Rojo error estándar
      info: '#3B82F6', // Azul información neutro
      // Grises optimizados para el tema violeta-verde
      gray50: '#F8FAFC',
      gray100: '#F1F5F9',
      gray200: '#E2E8F0',
      gray300: '#CBD5E1',
      gray400: '#94A3B8',
      gray500: '#64748B',
      gray600: '#475569',
      gray700: '#334155',
      gray800: '#1E293B',
      gray900: '#0F172A',
    },
  } as ThemeConfig,

  // Municipalidad de María Pinto
  mariapinto: {
    ...defaultTheme,
    municipality: {
      name: 'MARÍA PINTO',
      fullName: 'Ilustre Municipalidad de María Pinto',
      email: 'rrhh@mariapinto.cl',
      logoPath: 'assets/images/mariapinto.png',
      backgroundImagePath: undefined, // Sin imagen de fondo para mejor visibilidad del logo
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1976D2', // Azul lindo y vibrante
      primaryLight: '#42A5F5', // Azul claro hermoso
      primaryDark: '#0D47A1', // Azul oscuro elegante
      primaryVeryLight: '#E3F2FD', // Azul muy claro para fondos
      primaryBorder: '#90CAF9', // Azul suave para bordes
      primaryRgb: '25, 118, 210',
      secondary: '#37474F', // Gris azulado para contraste
      accent: '#4CAF50', // Verde natural de acento
      accentLight: '#C8E6C9', // Verde claro suave
      textColor: '#263238', // Gris oscuro para mejor legibilidad
      textColorLight: '#455A64', // Gris medio para texto secundario
      textColorMuted: '#78909C', // Gris azulado para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco puro para mejor contraste con logo
      backgroundAlt: '#FAFAFA', // Gris muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco puro para tarjetas
      // Colores de estado armonizados con mejor contraste
      success: '#4CAF50', // Verde éxito vibrante
      warning: '#FF9800', // Naranja advertencia
      error: '#F44336', // Rojo error
      info: '#1976D2', // Azul información (mismo que primary)
      // Grises optimizados para mejor legibilidad
      gray50: '#FAFAFA',
      gray100: '#F5F5F5',
      gray200: '#EEEEEE',
      gray300: '#E0E0E0',
      gray400: '#BDBDBD',
      gray500: '#9E9E9E',
      gray600: '#757575',
      gray700: '#616161',
      gray800: '#424242',
      gray900: '#212121',
    },
  } as ThemeConfig,

  // Municipalidad de Quemchi
  quemchi: {
    ...defaultTheme,
    municipality: {
      name: 'QUEMCHI',
      fullName: 'Municipalidad de Quemchi',
      email: 'rrhh@quemchi.cl',
      logoPath: 'assets/images/quemchi.png',
      backgroundImagePath: undefined, // Sin imagen de fondo para mejor visibilidad del logo
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#C85450', // Rojo más suave y elegante
      primaryLight: '#E57373', // Rojo claro más suave
      primaryDark: '#B71C1C', // Rojo oscuro para contraste
      primaryVeryLight: '#FFEBEE', // Rojo muy claro para fondos
      primaryBorder: '#FFCDD2', // Rojo suave para bordes
      primaryRgb: '200, 84, 80',
      secondary: '#37474F', // Gris azulado para mejor contraste
      accent: '#4CAF50', // Verde más vibrante para acentos
      accentLight: '#C8E6C9', // Verde claro suave
      textColor: '#263238', // Gris oscuro para mejor legibilidad
      textColorLight: '#455A64', // Gris medio para texto secundario
      textColorMuted: '#90A4AE', // Gris claro para texto atenuado
      backgroundColor: '#FFFFFF', // Fondo blanco puro para mejor contraste con logo
      backgroundAlt: '#FAFAFA', // Gris muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco puro para tarjetas
      // Colores de estado armonizados con mejor contraste
      success: '#4CAF50', // Verde éxito más vibrante
      warning: '#FF9800', // Naranja advertencia
      error: '#C85450', // Rojo error (mismo que primary)
      info: '#2196F3', // Azul información neutral
      // Grises optimizados para mejor legibilidad
      gray50: '#FAFAFA',
      gray100: '#F5F5F5',
      gray200: '#EEEEEE',
      gray300: '#E0E0E0',
      gray400: '#BDBDBD',
      gray500: '#9E9E9E',
      gray600: '#757575',
      gray700: '#616161',
      gray800: '#424242',
      gray900: '#212121',
    },
  } as ThemeConfig,

  // Municipalidad de San Antonio (tema verde)
  sanantonio: {
    ...defaultTheme,
    municipality: {
      name: 'SAN ANTONIO',
      fullName: 'Ilustre Municipalidad de San Antonio',
      email: 'contacto@sanantonio.cl',
      logoPath: 'assets/images/sanantonio.png',
      backgroundImagePath: undefined, // Puedes agregar fondo si tienes uno
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#4CAF50', // Verde principal
      primaryLight: '#81C784',
      primaryDark: '#388E3C',
      primaryVeryLight: '#E8F5E9',
      primaryBorder: '#A5D6A7',
      primaryRgb: '76, 175, 80',
      accent: '#FFD600', // Amarillo de la flor del logo
      accentLight: '#FFF9C4',
      secondary: '#1976D2', // Azul del logo
      // Puedes ajustar los colores de estado si lo deseas
      success: '#43A047',
      error: '#E53935',
      warning: '#FBC02D',
      info: '#0288D1',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Doñihue (tema azul oscuro y rojo)
  donihue: {
    ...defaultTheme,
    municipality: {
      name: 'DOÑIHUE',
      fullName: 'Ilustre Municipalidad de Doñihue',
      email: 'contacto@donihue.cl',
      logoPath: 'assets/images/Donihue.png',
      backgroundImagePath: undefined, // Puedes agregar fondo si tienes uno, ej: 'assets/images/DonihueFondo.png'
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1A2233', // Azul oscuro principal (del fondo)
      primaryLight: '#3B4252',
      primaryDark: '#101624',
      primaryVeryLight: '#E5E9F2',
      primaryBorder: '#AAB4C8',
      primaryRgb: '26, 34, 51',
      accent: '#B71C1C', // Rojo del logo
      accentLight: '#FFCDD2',
      secondary: '#1976D2', // Azul secundario
      // Colores de estado
      success: '#388E3C',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Santa Juana (azul, verde y naranja sobrio)
  santajuana: {
    ...defaultTheme,
    municipality: {
      name: 'SANTA JUANA',
      fullName: 'Municipalidad de Santa Juana',
      email: 'contacto@santajuana.cl',
      logoPath: 'assets/images/santajuana.png',
      backgroundImagePath: 'assets/images/santajuanafondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1565C0', // Azul sobrio
      primaryLight: '#5E92F3',
      primaryDark: '#003c8f',
      primaryVeryLight: '#E3F2FD',
      primaryBorder: '#90CAF9',
      primaryRgb: '21, 101, 192',
      accent: '#388E3C', // Verde del texto SANTA JUANA
      accentLight: '#C8E6C9',
      secondary: '#F57C00', // Naranja de la franja
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de San Fabián (azul fondo del logo, sobrio)
  sanfabian: {
    ...defaultTheme,
    municipality: {
      name: 'SAN FABIÁN',
      fullName: 'Municipalidad de San Fabián',
      email: 'contacto@sanfabian.cl',
      logoPath: 'assets/images/sanfabian.png',
      backgroundImagePath: undefined,
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#292E54', // Azul fondo del logo
      primaryLight: '#444A6D',
      primaryDark: '#181B2F',
      primaryVeryLight: '#F3F4FA',
      primaryBorder: '#BFC3D9',
      primaryRgb: '41, 46, 84',
      accent: '#FFFFFF', // Blanco para detalles y textos
      accentLight: '#F3F4FA',
      secondary: '#444A6D', // Un azul más claro para contraste
      // Colores de estado
      success: '#388E3C',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Rauco (morado degradado y rosado)
  rauco: {
    ...defaultTheme,
    municipality: {
      name: 'RAUCO',
      fullName: 'Ilustre Municipalidad de Rauco',
      email: 'contacto@rauco.cl',
      logoPath: 'assets/images/rauco.png',
      backgroundImagePath: 'assets/images/raucofondo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#8E24AA', // Morado principal
      primaryLight: '#C158DC',
      primaryDark: '#5C007A',
      primaryVeryLight: '#F3E5F5',
      primaryBorder: '#E1BEE7',
      primaryRgb: '142, 36, 170',
      accent: '#EC407A', // Rosado del degradado
      accentLight: '#F8BBD0',
      secondary: '#512DA8', // Morado más oscuro
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Pica (azul vibrante tipo Santiago, acento dorado)
  pica: {
    ...defaultTheme,
    municipality: {
      name: 'PICA',
      fullName: 'Ilustre Municipalidad de Pica',
      email: 'contacto@pica.cl',
      logoPath: 'assets/images/pica.png',
      backgroundImagePath: undefined,
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1565C0', // Azul vibrante tipo Santiago
      primaryLight: '#5E92F3',
      primaryDark: '#003c8f',
      primaryVeryLight: '#E3F2FD',
      primaryBorder: '#90CAF9',
      primaryRgb: '21, 101, 192',
      accent: '#FFC107', // Amarillo/dorado del escudo
      accentLight: '#FFF8E1',
      secondary: '#1976D2', // Azul secundario
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Placilla (azul sobrio, amarillo y blanco)
  placilla: {
    ...defaultTheme,
    municipality: {
      name: 'PLACILLA',
      fullName: 'Ilustre Municipalidad de Placilla',
      email: 'contacto@placilla.cl',
      logoPath: 'assets/images/placilla.png',
      backgroundImagePath: undefined,
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1A237E', // Azul sobrio
      primaryLight: '#5C6BC0',
      primaryDark: '#0D133D',
      primaryVeryLight: '#E8EAF6',
      primaryBorder: '#C5CAE9',
      primaryRgb: '26, 35, 126',
      accent: '#FFD600', // Amarillo del logo
      accentLight: '#FFF9C4',
      secondary: '#FFFFFF', // Blanco para detalles
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Toltén (azul fuerte y amarillo)
  tolten: {
    ...defaultTheme,
    municipality: {
      name: 'TOLTÉN',
      fullName: 'Ilustre Municipalidad de Toltén',
      email: 'contacto@tolten.cl',
      logoPath: 'assets/images/tolten.png',
      backgroundImagePath: undefined,
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#0D47A1', // Azul fuerte
      primaryLight: '#5472D3',
      primaryDark: '#002171',
      primaryVeryLight: '#E3F2FD',
      primaryBorder: '#90CAF9',
      primaryRgb: '13, 71, 161',
      accent: '#FFD600', // Amarillo del escudo
      accentLight: '#FFF9C4',
      secondary: '#1976D2', // Azul secundario
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Putaendo (celeste del logo, sobrio)
  putaendo: {
    ...defaultTheme,
    municipality: {
      name: 'PUTAENDO',
      fullName: 'Ilustre Municipalidad de Putaendo',
      email: 'contacto@putaendo.cl',
      logoPath: 'assets/images/puteaendo.png',
      backgroundImagePath: 'assets/images/puteaendo.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#7EC3E6', // Celeste del logo
      primaryLight: '#B3E5FC',
      primaryDark: '#4696B8',
      primaryVeryLight: '#E1F5FE',
      primaryBorder: '#B3E5FC',
      primaryRgb: '126, 195, 230',
      accent: '#FFFFFF', // Blanco para detalles y textos
      accentLight: '#F3F4FA',
      secondary: '#4696B8', // Celeste más oscuro para contraste
      // Colores de estado
      success: '#388E3C',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
    },
  } as ThemeConfig,

  // Municipalidad de Curarrehue (ajustado: rosa más oscuro pero elegante)
  curarrehue: {
    ...defaultTheme,
    municipality: {
      name: 'CURARREHUE',
      fullName: 'Municipalidad de Curarrehue',
      email: 'contacto@curarrehue.cl',
      logoPath: 'assets/images/curarrehuelogo.png',
      backgroundImagePath: undefined, // Sin fondo, solo color/degradado
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#9B5BA8', // Rosa morado más oscuro para mejor contraste
      primaryLight: '#C688D4', // Rosa morado claro
      primaryDark: '#6B4C93', // Morado más oscuro
      primaryVeryLight: '#F3E8F5',
      primaryBorder: '#D4A5DC',
      primaryRgb: '155, 91, 168',
      accent: '#E57373', // Rosa coral elegante
      accentLight: '#FFCDD2',
      secondary: '#C2559B', // Rosa más definido para detalles
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
      textColor: '#2D2D2D', // Texto oscuro para mejor legibilidad
      textColorLight: '#6B4C93',
      textColorMuted: '#9B5BA8',
      backgroundColor: '#FFFFFF', // Fondo blanco para el contenido principal
      backgroundAlt: '#F9F5FA', // Alternativo muy suave con tinte rosa
      backgroundCard: '#FFFFFF',
    },
  } as ThemeConfig,
  // Municipalidad de Vilcún (ajustado: rosa más oscuro pero elegante)
  vilcun: {
    ...defaultTheme,
    municipality: {
      name: 'VILCÚN',
      fullName: 'Municipalidad de Vilcún',
      email: 'contacto@vilcun.cl',
      logoPath: 'assets/images/vilcun.png',
      backgroundImagePath: undefined, // Sin fondo, solo color/degradado
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#226d3a', // Verde oscuro del texto "Vilcún"
      primaryLight: '#7fc242', // Verde claro de los campos
      primaryDark: '#1a4d2a', // Verde más profundo de los campos
      primaryVeryLight: '#ffe97a', // Amarillo claro del sol y espiga
      primaryBorder: '#fff7c2', // Amarillo suave para bordes
      primaryRgb: '34, 109, 58',
      secondary: '#2d6eb6', // Azul de la montaña
      accent: '#8b5c2a', // Marrón del tractor
      accentLight: '#cfa66b', // Marrón claro del tractor
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos igual que defaultTheme
      textColor: '#226d3a', // Verde oscuro para texto principal
      textColorLight: '#7fc242', // Verde claro para texto secundario
      textColorMuted: '#b7cbb2', // Gris verdoso suave para texto atenuado
      backgroundColor: '#ffffff', // Fondo blanco
      backgroundAlt: '#eaf6fb', // Celeste muy claro del cielo
      backgroundCard: '#ffffff', // Blanco para tarjetas
    },
  } as ThemeConfig,

  rancagua: { 
    ...defaultTheme,
    municipality: {
      name: 'Rancagua',
      fullName: 'Municipalidad de Rancagua',
      email: 'contacto@rancagua.cl',
      logoPath: 'assets/images/Rancagua2.png',
      backgroundImagePath: undefined, // Sin fondo, solo color/degradado
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#d32f2f', // Rojo institucional
      primaryLight: '#e57373', // Rojo claro (hover/bordes)
      primaryDark: '#b71c1c', // Rojo oscuro (contraste)
      primaryVeryLight: '#ffebee', // Rojo muy claro (fondos suaves)
      primaryBorder: '#ffcdd2', // Rojo pastel (bordes)
      primaryRgb: '211, 47, 47',
      secondary: '#b71c1c', // Rojo oscuro para títulos o detalles
      accent: '#37474f', // Gris azulado oscuro para botones/acento
      accentLight: '#b0bec5', // Gris claro para hover/acento suave
      // Colores de estado
      success: '#43A047',
      error: '#D32F2F',
      warning: '#FBC02D',
      info: '#1976D2',
      // Grises y fondos
      textColor: '#b71c1c', // Rojo oscuro para texto principal sobre fondo blanco
      textColorLight: '#37474f', // Gris azulado oscuro para texto secundario
      textColorMuted: '#90a4ae', // Gris claro para texto atenuado
      backgroundColor: '#ffffff', // Fondo blanco
      backgroundAlt: '#f5f5f5', // Gris muy claro para fondo alternativo
      backgroundCard: '#ffffff', // Blanco para tarjetas
    },
  } as ThemeConfig,
  coyhaique: { 
    ...defaultTheme,
    municipality: {
      name: 'Coyhaique',
      fullName: 'Municipalidad de Coyhaique',
      email: 'contacto@coyhaique.cl',
      logoPath: 'assets/images/coyhaique.png',
      backgroundImagePath: undefined, // Sin fondo, solo color/degradado
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#1976D2', // Azul cielo y fondo de montañas
      primaryLight: '#63A4FF', // Azul claro
      primaryDark: '#174EA6', // Azul oscuro
      primaryVeryLight: '#E3F2FD', // Azul muy claro para fondos
      primaryBorder: '#B3D1F7', // Azul suave para bordes
      primaryRgb: '25, 118, 210',
      secondary: '#FFD600', // Dorado de la corona
      accent: '#F57C00', // Naranja del árbol
      accentLight: '#FFE0B2', // Naranja claro
      textColor: '#174EA6', // Azul oscuro para texto
      textColorLight: '#1976D2', // Azul medio para texto secundario
      textColorMuted: '#90A4AE', // Gris azulado para texto atenuado
      backgroundColor: '#FFFFFF', // Blanco
      backgroundAlt: '#E3F2FD', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado y grises se mantienen igual
    }, 
  } as ThemeConfig,
  rioClaro: { 
    ...defaultTheme,
    municipality: {
      name: 'Rio Claro',
      fullName: 'Municipalidad de Rio Claro',
      email: 'contacto@rioclaro.cl',
      logoPath: 'assets/images/rioClaro.png',
      backgroundImagePath: undefined, // Sin fondo, solo color/degradado
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#223A57', // Azul profundo (río y cerros)
      primaryLight: '#3B5A7A', // Azul intermedio
      primaryDark: '#16263A', // Azul muy oscuro
      primaryVeryLight: '#EAF4F8', // Azul muy claro para fondos
      primaryBorder: '#B3C7D8', // Azul suave para bordes
      primaryRgb: '34, 58, 87',
      secondary: '#C46B47', // Marrón de la montaña
      accent: '#E2A93B', // Dorado del sol
      accentLight: '#FFE0B2', // Amarillo claro
      textColor: '#16263A', // Azul muy oscuro para texto
      textColorLight: '#3B5A7A', // Azul intermedio para texto secundario
      textColorMuted: '#90A4AE', // Gris azulado para texto atenuado
      backgroundColor: '#F1F8FA', // Azul muy claro de fondo
      backgroundAlt: '#EAF4F8', // Azul muy claro alternativo
      backgroundCard: '#FFFFFF', // Blanco para tarjetas
      // Colores de estado y grises se mantienen igual
    }, 
  } as ThemeConfig,
  torresPaine: { 
    ...defaultTheme,
    municipality: {
      name: 'Torres Paine',
      fullName: 'Municipalidad de Torres del Paine',
      email: 'contacto@torrespaine.cl',
      logoPath: 'assets/images/torresPaine2.png',
      backgroundImagePath: 'assets/images/torresPaine2.png',
    },
    colors: {
      ...defaultTheme.colors,
      primary: '#4FC3F7', // Azul cielo
      primaryLight: '#81D4FA', // Azul claro
      primaryDark: '#263859', // Azul montaña
      primaryVeryLight: '#E3F6FD', // Azul muy claro
      primaryBorder: '#B3E5FC', // Azul suave
      primaryRgb: '79, 195, 247',
      secondary: '#6CBF43', // Verde pradera
      accent: '#B77B3B', // Marrón guanaco/cerro
      accentLight: '#FFE082', // Amarillo claro
      textColor: '#263859', // Azul montaña
      textColorLight: '#4FC3F7', // Azul cielo
      textColorMuted: '#90A4AE', // Gris azulado
      backgroundColor: '#FFFFFF', // Blanco
      backgroundAlt: '#E3F6FD', // Azul muy claro
      backgroundCard: '#FFFFFF', // Blanco
      // Colores de estado y grises se mantienen igual
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
