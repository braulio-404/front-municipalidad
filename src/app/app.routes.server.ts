import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros que deben usar SSR en lugar de prerender
  // Rutas que usan SSR
  {
    path: 'admin/formularios/ver/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/formularios/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/datos/requisitos/ver/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/datos/requisitos/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'postulacion/formulario/:id',
    renderMode: RenderMode.Server
  },
  // Ruta que está causando problemas de prerenderizado
  {
    path: 'postulacion',
    renderMode: RenderMode.Server
  },
  // Todas las demás rutas usan prerender
  
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
