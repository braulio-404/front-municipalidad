import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { FormulariosComponent } from './features/admin/formularios/formularios.component';
import { PostulacionFormComponent } from './features/admin/formularios/postulacion-form/postulacion-form.component';
import { DatosComponent } from './features/admin/datos/datos.component';
import { DescargasComponent } from './features/admin/descargas/descargas.component';
import { EstadisticasComponent } from './features/admin/estadisticas/estadisticas.component';
import { DashboardHomeComponent } from './features/admin/dashboard-home/dashboard-home.component';
import { PostulacionesComponent } from './features/postulacion/postulaciones.component';
import { FormularioPostulacionComponent } from './features/postulacion/formulario-postulacion/formulario-postulacion.component';
import { ConfirmacionPostulacionComponent } from './features/postulacion/confirmacion-postulacion/confirmacion-postulacion.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'postulacion', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { 
        path: 'admin', 
        component: AdminDashboardComponent,
        canActivate: [AdminGuard],
        children: [
            { path: 'home', component: DashboardHomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'formularios', component: FormulariosComponent },
            { path: 'formularios/nuevo', component: PostulacionFormComponent, data: { modo: 'nuevo' } },
            { path: 'formularios/ver/:id', component: PostulacionFormComponent, data: { modo: 'ver' } },
            { path: 'formularios/editar/:id', component: PostulacionFormComponent, data: { modo: 'editar' } },
            { path: 'datos', component: DatosComponent },
            { path: 'datos/requisitos/nuevo', component: DatosComponent, data: { modo: 'nuevo', tipo: 'requisito' } },
            { path: 'datos/requisitos/ver/:id', component: DatosComponent, data: { modo: 'ver', tipo: 'requisito' } },
            { path: 'datos/requisitos/editar/:id', component: DatosComponent, data: { modo: 'editar', tipo: 'requisito' } },
            { path: 'descargas', component: DescargasComponent },
            { path: 'estadisticas', component: EstadisticasComponent }
        ] 
    },
    { 
        path: 'dashboard', 
        component: PostulacionesComponent, 
        canActivate: [AuthGuard]
    },
    { path: 'postulacion', component: PostulacionesComponent },
    { path: 'postulacion/formulario/:id', component: FormularioPostulacionComponent },
    { path: 'postulacion/confirmacion', component: ConfirmacionPostulacionComponent },
    { path: '**', redirectTo: 'postulacion' }
];
