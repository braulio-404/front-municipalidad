# Gestión de Estados de Postulantes

## Descripción General
Se ha implementado un sistema completo para gestionar los estados de las postulaciones, permitiendo actualizar estados individuales y en lote, filtrar postulantes por estado y obtener estadísticas.

## Nuevas Funcionalidades Implementadas

### 1. Servicios del Backend (API Endpoints)

#### Actualizar Estado Individual
```http
PATCH /postulante/:id/estado
Content-Type: application/json

{
  "estado": "Seleccionado"
}
```

#### Buscar Postulantes por Estado
```http
GET /postulante/estado/Seleccionado?formularioId=1
```

#### Actualizar Estados en Lote
```http
PATCH /postulante/estado/lote
Content-Type: application/json

{
  "postulantesIds": ["uuid1", "uuid2", "uuid3"],
  "estado": "En Revisión"
}
```

#### Obtener Estadísticas de Estados
```http
GET /postulante/estadisticas/estados?formularioId=1
```

### 2. Servicios del Frontend

#### Métodos Implementados en `PostulantesService`:

- **`updateEstado(id, updateEstadoDto)`** - Actualizar estado individual
- **`findByEstado(estado, formularioId?)`** - Buscar por estado
- **`updateEstadoLote(updateEstadoLoteDto)`** - Actualización en lote
- **`getEstadisticasEstados(formularioId?)`** - Obtener estadísticas
- **`getPostulantesAgrupadosPorEstado(formularioId?)`** - Agrupar por estado
- **`getEstadosDisponibles()`** - Lista de estados disponibles
- **`getColorEstado(estado)`** - Color UI para cada estado
- **`getIconoEstado(estado)`** - Icono UI para cada estado

### 3. Estados Disponibles

1. **Pendiente** - Estado inicial (naranja)
2. **En Revisión** - En proceso de evaluación (azul)
3. **Seleccionado** - Postulante seleccionado (verde)
4. **Rechazado** - Postulación rechazada (rojo)
5. **Finalizado** - Proceso completado (morado)
6. **Documentos Incompletos** - Faltan documentos (naranja)
7. **En Proceso** - En algún paso del proceso (azul claro)
8. **Aprobado** - Aprobado oficialmente (verde fuerte)

## Interfaz de Usuario

### Características del Componente de Gestión

1. **Panel de Estadísticas**:
   - Muestra distribución de postulantes por estado
   - Tarjetas con iconos y colores representativos
   - Actualización en tiempo real

2. **Filtros Avanzados**:
   - Por formulario específico
   - Por estado de postulación
   - Búsqueda por nombre, RUT o email

3. **Selección Múltiple**:
   - Modo de selección para acciones en lote
   - Seleccionar todos / deseleccionar todos
   - Contador de elementos seleccionados

4. **Acciones en Lote**:
   - Cambiar estado de múltiples postulantes
   - Interfaz intuitiva con confirmación
   - Retroalimentación del resultado

5. **Gestión Individual**:
   - Modal para cambiar estado individual
   - Información detallada del postulante
   - Validación y confirmación

### Tabla de Postulantes

- **Columnas**: Nombre, RUT, Email, Formulario, Estado, Fecha, Acciones
- **Estados Visuales**: Badges con colores e iconos distintivos
- **Acciones**: Cambiar estado, ver documentos
- **Responsiva**: Adaptable a dispositivos móviles

## Interfaces TypeScript

### Nuevas Interfaces Agregadas:

```typescript
// DTO para actualización individual
interface UpdateEstadoDto {
  estado: string;
}

// DTO para actualización en lote
interface UpdateEstadoLoteDto {
  postulantesIds: string[];
  estado: string;
}

// DTO actualizado para postulantes
interface UpdatePostulanteDto {
  nombres?: string;
  apellidoPaterno?: string;
  rut?: string;
  email?: string;
  telefono?: string;
  estado?: string; // Nuevo campo
}

// Estadísticas de estados
interface EstadisticasEstados {
  [estado: string]: number;
}

// Postulantes agrupados por estado
interface PostulantePorEstado {
  estado: string;
  postulantes: Postulante[];
  total: number;
}
```

## Actualización de la Interfaz Postulante

Se agregó el campo `estado` opcional:

```typescript
interface Postulante {
  // ... campos existentes
  estado?: string; // Nuevo campo para el estado
  // ... resto de campos
}
```

## Integración con Estadísticas Admin

El servicio registra automáticamente las actividades de cambio de estado en el sistema de estadísticas:

- Cambios individuales de estado
- Actualizaciones en lote
- Actividades con iconos y descripciones descriptivas

## Uso en el Componente

### Acceso a la Funcionalidad

1. Ir a **Admin > Datos Configurables**
2. Seleccionar la pestaña **"Estados de Postulantes"**
3. Usar los filtros para encontrar postulantes específicos
4. Cambiar estados individual o en lote según necesidad

### Flujo de Trabajo Típico

1. **Filtrar** postulantes por formulario y/o estado actual
2. **Seleccionar** postulantes (individual o múltiple)
3. **Cambiar estado** usando el modal o acciones en lote
4. **Verificar** cambios en las estadísticas actualizadas

## Ventajas del Sistema

- ✅ **Eficiencia**: Actualización en lote para múltiples postulantes
- ✅ **Trazabilidad**: Registro de todas las actividades
- ✅ **Usabilidad**: Interfaz intuitiva con filtros y búsqueda
- ✅ **Visual**: Estados con colores e iconos distintivos
- ✅ **Estadísticas**: Panel de estadísticas en tiempo real
- ✅ **Responsivo**: Funciona en dispositivos móviles
- ✅ **Escalable**: Fácil agregar nuevos estados

## Tecnologías Utilizadas

- **Angular 17+** con componentes standalone
- **TypeScript** con interfaces tipadas
- **SCSS** con variables CSS para temas
- **Material Icons** para iconografía
- **Observables RxJS** para programación reactiva
- **CSS Grid/Flexbox** para diseño responsivo 