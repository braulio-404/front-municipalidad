import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { FormulariosComponent } from './features/admin/formularios/formularios.component';
import { DatosComponent } from './features/admin/datos/datos.component';
import { DescargasComponent } from './features/admin/descargas/descargas.component';
import { EstadisticasComponent } from './features/admin/estadisticas/estadisticas.component';
import { DashboardHomeComponent } from './features/admin/dashboard-home/dashboard-home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { 
        path: 'admin', 
        component: AdminDashboardComponent,
        children: [
            { path: '', component: DashboardHomeComponent },
            { path: 'formularios', component: FormulariosComponent },
            { path: 'datos', component: DatosComponent },
            { path: 'descargas', component: DescargasComponent },
            { path: 'estadisticas', component: EstadisticasComponent }
        ] 
    }
];
