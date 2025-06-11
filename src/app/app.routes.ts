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
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { 
        path: 'admin', 
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: DashboardHomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'formularios', component: FormulariosComponent, canActivate: [AuthGuard] },
            { path: 'formularios/nuevo', component: PostulacionFormComponent, data: { modo: 'nuevo' }, canActivate: [AuthGuard] },
            { path: 'formularios/ver/:id', component: PostulacionFormComponent, data: { modo: 'ver' }, canActivate: [AuthGuard] },
            { path: 'formularios/editar/:id', component: PostulacionFormComponent, data: { modo: 'editar' }, canActivate: [AuthGuard] },
            { path: 'datos', component: DatosComponent, canActivate: [AuthGuard] },
            { path: 'datos/requisitos/nuevo', component: DatosComponent, data: { modo: 'nuevo', tipo: 'requisito' }, canActivate: [AuthGuard] },
            { path: 'datos/requisitos/ver/:id', component: DatosComponent, data: { modo: 'ver', tipo: 'requisito' }, canActivate: [AuthGuard] },
            { path: 'datos/requisitos/editar/:id', component: DatosComponent, data: { modo: 'editar', tipo: 'requisito' }, canActivate: [AuthGuard] },
            { path: 'descargas', component: DescargasComponent, canActivate: [AuthGuard] },
            { path: 'estadisticas', component: EstadisticasComponent, canActivate: [AuthGuard] }
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
    { path: '**', redirectTo: 'login' }
];
