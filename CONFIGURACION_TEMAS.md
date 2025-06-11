# 🎨 Sistema de Configuración de Temas (Versión Mejorada)

## Descripción

El sistema municipal ahora cuenta con **configuración completa de temas persistentes** que permite personalizar:

- ✅ **Paleta de colores** (primarios, secundarios, acentos, estados)
- ✅ **Logo** de la municipalidad
- ✅ **Nombre** de la municipalidad
- ✅ **Email de contacto**
- ✅ **Toda la interfaz** de forma automática
- ✅ **Persistencia global** - Los temas se mantienen al recargar (F5)
- ✅ **Sincronización** - Cambios visibles para todos los usuarios
- ✅ **Sistema de reintentos** para carga confiable

## 🔄 Características de Persistencia

### Sistema Dual de Persistencia
1. **Archivo JSON global** (`src/assets/config/current-theme.json`) - Fuente principal
2. **localStorage** - Respaldo local para casos de error

### Actualización Automática
- **Verificación cada 30 segundos** de cambios en el tema global
- **Recarga automática** si hay actualizaciones más recientes
- **Sincronización** entre pestañas y usuarios

### Reintentos Inteligentes
- **3 intentos** para cargar el tema desde el archivo JSON
- **Delays progresivos** (1s, 2s, 3s) entre reintentos
- **Fallback automático** a localStorage si no se puede acceder al archivo

## 📁 Archivos Importantes

### 1. Configuración Principal
- **`src/app/config/theme.config.ts`** - Configuración de todos los temas disponibles
- **`src/app/servicios/theme.service.ts`** - Servicio mejorado que maneja los temas con persistencia
- **`src/assets/config/current-theme.json`** - Archivo global de configuración actual
- **`scripts/update-theme.js`** - Script para actualizar el tema globalmente
- **`src/styles.scss`** - Variables CSS globales que se actualizan dinámicamente

### 2. Componentes Actualizados
Todos los componentes ahora usan variables CSS dinámicas:
- Login
- Dashboard de Admin
- Formularios de Postulación
- Gestión de Datos
- Estadísticas
- Y más...

## 🚀 Cómo Personalizar para una Nueva Municipalidad

### Paso 1: Editar la Configuración

Edita el archivo `src/app/config/theme.config.ts` y agrega un nuevo tema:

```typescript
export const availableThemes = {
  conchali: defaultTheme,
  
  // Agregar nueva municipalidad
  nuevaMunicipalidad: {
    municipality: {
      name: 'NUEVA MUNI',
      fullName: 'Municipalidad de Nueva',
      email: 'contacto@nuevamuni.cl',
      logoPath: 'assets/images/logo-nueva.png',
      backgroundImagePath: 'assets/images/background-nueva.jpg'
    },
    colors: {
      // Colores principales (cambiar según identidad visual)
      primary: '#1e40af',        // Azul principal
      primaryLight: '#3b82f6',   // Azul claro
      primaryDark: '#1e3a8a',    // Azul oscuro
      primaryVeryLight: '#eff6ff', // Azul muy claro para fondos
      primaryBorder: '#dbeafe',  // Bordes
      primaryRgb: '30, 64, 175', // RGB para transparencias
      
      // Color secundario
      secondary: '#334155',
      
      // Color de acento (verde, naranja, etc.)
      accent: '#059669',         // Verde
      accentLight: '#d1fae5',
      
      // Colores de estado (mantener o personalizar)
      error: '#dc2626',
      success: '#16a34a',
      warning: '#ea580c',
      info: '#0066b3',
      
      // El resto de colores se pueden mantener iguales
      ...defaultTheme.colors,
      
      // Solo sobrescribir los que quieras cambiar
      textColor: '#1e293b',
      backgroundColor: '#f8fafc',
    },
    
    // Espaciado y bordes se mantienen iguales
    spacing: defaultTheme.spacing,
    borderRadius: defaultTheme.borderRadius
  } as ThemeConfig
};
```

### Paso 2: Agregar Assets

1. **Logo**: Coloca el logo en `src/assets/images/logo-nuevamuni.png`
2. **Fondo** (opcional): Coloca imagen de fondo en `src/assets/images/background-nueva.jpg`

### Paso 3: Actualizar el Archivo JSON Global

Edita `src/assets/config/current-theme.json`:

```json
{
  "selectedTheme": "nuevaMunicipalidad",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "updatedBy": "admin"
}
```

### Paso 4: Configurar Tema por Defecto

En la función `getCurrentTheme()` del mismo archivo, puedes cambiar el tema por defecto:

```typescript
export function getCurrentTheme(): ThemeConfig {
  // Cambiar 'conchali' por el nombre de tu nuevo tema
  const themeName = localStorage.getItem('globalSelectedTheme') || 'nuevaMunicipalidad';
  return availableThemes[themeName as keyof typeof availableThemes] || defaultTheme;
}
```

### Paso 5: Actualizar el Título

Edita `src/index.html`:

```html
<title>Municipalidad de Nueva</title>
```

## 🔄 Cambio de Tema en Producción

### Método Manual (Recomendado)
1. **Como administrador**, ingresa al sistema
2. **Haz clic en "🎨 Temas"** (esquina inferior derecha)
3. **Selecciona el nuevo tema**
4. **Ejecuta el comando mostrado** en el servidor:
   ```bash
   node scripts/update-theme.js nuevoTema admin
   ```

### Método Automático
- Los cambios se propagan automáticamente a todos los usuarios
- **Verificación cada 30 segundos** de actualizaciones
- **No requiere recarga manual** por parte de los usuarios

## ⚡ Características de Rendimiento

### Carga Optimizada
- **Cache-busting** con timestamps automáticos
- **Reintentos con delay progresivo** para conexiones lentas
- **Fallback inmediato** a localStorage si el servidor no responde

### Sincronización Eficiente
- **Verificación de timestamps** para evitar recargas innecesarias
- **Solo actualiza** si hay cambios reales
- **Mantiene el estado local** como respaldo

## 🎯 Colores Principales a Personalizar

### Colores Obligatorios
- **`primary`** - Color principal de la municipalidad (botones, títulos, sidebar)
- **`primaryLight`** - Versión más clara del primario (hover effects)
- **`primaryDark`** - Versión más oscura del primario
- **`primaryVeryLight`** - Muy claro para fondos sutiles
- **`accent`** - Color de acento (elementos destacados, íconos de éxito)

### RGB para Transparencias
- **`primaryRgb`** - Valores RGB separados por comas para efectos con transparencia

### Ejemplo de Paletas

#### Paleta Azul Corporativo
```typescript
primary: '#1e40af',
primaryLight: '#3b82f6', 
primaryDark: '#1e3a8a',
primaryVeryLight: '#eff6ff',
accent: '#059669', // Verde complementario
```

#### Paleta Verde Institucional  
```typescript
primary: '#059669',
primaryLight: '#10b981',
primaryDark: '#047857', 
primaryVeryLight: '#ecfdf5',
accent: '#f59e0b', // Naranja complementario
```

#### Paleta Roja Municipal
```typescript
primary: '#dc2626',
primaryLight: '#ef4444',
primaryDark: '#991b1b',
primaryVeryLight: '#fef2f2', 
accent: '#2563eb', // Azul complementario
```

## 🧪 Probando los Cambios

1. **Ejecuta la aplicación**: `npm start`
2. **Inicia sesión** como administrador
3. **Haz clic en el botón "🎨 Temas"** (esquina inferior derecha)
4. **Selecciona tu nuevo tema** del dropdown
5. **Verifica** que todos los colores se actualicen correctamente
6. **Recarga la página (F5)** - El tema debe mantenerse
7. **Abre otro navegador** - Debe mostrar el tema actualizado

## 📋 Checklist de Verificación

- [ ] Logo se muestra correctamente en login y dashboard
- [ ] Nombre de municipalidad aparece en sidebar y títulos
- [ ] Email se muestra en página de postulaciones
- [ ] Colores primarios se aplican en botones y elementos principales
- [ ] Color de acento se ve en íconos y elementos destacados
- [ ] Hover effects funcionan con los nuevos colores
- [ ] Formularios mantienen la consistencia visual
- [ ] Estados de error/éxito/warning se ven correctamente
- [ ] **Tema persiste al recargar (F5)**
- [ ] **Tema se sincroniza entre pestañas**
- [ ] **Tema se sincroniza entre usuarios**

## 🔧 Solución de Problemas

### Los colores no se cambian
- Verifica que el navegador no tenga caché (Ctrl+F5)
- Asegúrate de que el tema esté bien definido en `theme.config.ts`
- Revisa que el archivo `current-theme.json` sea accesible
- Revisa la consola del navegador por errores

### El tema se pierde al recargar
- Verifica que el archivo `src/assets/config/current-theme.json` exista
- Asegúrate de que el servicio web pueda acceder a la carpeta `assets`
- Revisa el localStorage del navegador (debe tener `globalSelectedTheme`)

### El logo no aparece
- Verifica que el archivo existe en la ruta especificada
- Asegúrate de que el formato sea PNG, JPG o SVG
- Revisa que el nombre del archivo coincida exactamente

### Algunos elementos mantienen colores viejos
- Es posible que el componente no esté usando variables CSS
- Verifica que use `var(--primary-color)` en lugar de colores hardcodeados
- Fuerza un hard refresh (Ctrl+Shift+R)

### La sincronización no funciona
- Verifica que el servidor esté sirviendo archivos estáticos correctamente
- Revisa la red en las herramientas de desarrollador
- Confirma que el archivo JSON se actualice en el servidor

## 🎨 Selector de Temas (Administración)

El selector de temas está disponible para administradores:

1. **Botón "🎨 Temas"** en la esquina inferior derecha del dashboard
2. **Vista previa** de colores en tiempo real
3. **Información del tema actual** y usuario que lo cambió
4. **Solo administradores** pueden cambiar temas
5. **Usuarios regulares** ven el tema pero no pueden modificarlo

## 🔒 Seguridad y Permisos

- **Solo administradores** pueden cambiar temas
- **Verificación de roles** antes de permitir cambios
- **Log de cambios** con usuario y timestamp
- **Reversión automática** si hay problemas de permisos

## 🚀 Despliegue en Producción

### 1. Asegurar Acceso a Assets
```nginx
# Configuración nginx para servir assets
location /assets/ {
    expires 1h;
    add_header Cache-Control "public, immutable";
}

location /assets/config/ {
    expires 0;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 2. Script de Actualización
```bash
# En el servidor de producción
node scripts/update-theme.js nuevaTema admin
```

### 3. Verificar Permisos
```bash
# Asegurar que el archivo sea escribible
chmod 644 src/assets/config/current-theme.json
```

## 📈 Monitoreo

El sistema automáticamente:
- **Registra cambios** de tema con timestamps
- **Mantiene historial** en localStorage
- **Detecta errores** de carga y usa fallbacks
- **Sincroniza cambios** cada 30 segundos

## 📞 Soporte

Si tienes problemas con el sistema de temas:

1. **Revisa la consola** del navegador para errores
2. **Verifica el archivo** `current-theme.json` en el servidor
3. **Confirma permisos** de administrador
4. **Prueba el fallback** limpiando localStorage
5. **Fuerza recarga** del tema desde el selector

## 🎨 Configuración Global de Temas

## Descripción
Este sistema permite que un administrador configure el tema de la aplicación de manera global, para que todos los usuarios en todas las PCs vean el mismo tema.

## Cómo Funciona

### 1. Archivo de Configuración Global
```
src/assets/config/current-theme.json
```

Este archivo contiene la configuración actual del tema:
```json
{
  "selectedTheme": "conchali",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "updatedBy": "admin"
}
```

### 2. Flujo de Cambio de Tema

1. **Admin cambia tema** → Se actualiza localStorage inmediatamente
2. **Se ejecuta script** → Actualiza el archivo JSON global
3. **Otros usuarios** → Al cargar la app, leen el archivo JSON y ven el nuevo tema

## Instalación en Producción

### Opción 1: Script Manual (Recomendado para instalaciones simples)

Cuando el admin cambia el tema, el sistema mostrará en consola:
```bash
💡 En producción, ejecutar: node scripts/update-theme.js [nombreTema] [usuarioAdmin]
```

**Pasos:**
1. Instalar la aplicación en el servidor
2. Cuando aparezca el mensaje en consola, ejecutar el comando mostrado
3. El archivo `src/assets/config/current-theme.json` se actualizará
4. Todos los usuarios verán el nuevo tema al recargar

### Opción 2: Endpoint Backend (Para instalaciones avanzadas)

Si tienes un backend, puedes crear un endpoint que escriba el archivo:

```javascript
// Ejemplo endpoint en Express.js
app.post('/api/admin/update-theme', (req, res) => {
  const { selectedTheme, updatedBy } = req.body;
  
  const config = {
    selectedTheme,
    lastUpdated: new Date().toISOString(),
    updatedBy
  };
  
  fs.writeFileSync('./src/assets/config/current-theme.json', JSON.stringify(config, null, 2));
  res.json({ success: true });
});
```

## Comandos Útiles

### Cambiar tema manualmente:
```bash
node scripts/update-theme.js conchali admin
node scripts/update-theme.js concepcion admin
```

### Verificar tema actual:
```bash
cat src/assets/config/current-theme.json
```

## Temas Disponibles

- `conchali`: Morado y Verde (por defecto)
- `concepcion`: Azul y Verde (Concepción)

## Resolución de Problemas

### Problema: Los usuarios no ven el tema actualizado
**Solución:** Verificar que el archivo `current-theme.json` se haya actualizado correctamente

### Problema: Error al ejecutar el script
**Solución:** Asegurarse de estar en el directorio raíz del proyecto al ejecutar el comando

### Problema: Usuarios siguen viendo tema anterior
**Solución:** Los usuarios deben recargar la página (F5) para ver los cambios 