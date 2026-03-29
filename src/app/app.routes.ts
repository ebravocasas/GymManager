import { Routes } from '@angular/router';

import { TarifasGestion } from './components/tarifas-gestion/tarifas-gestion';
import { ClientesGestion } from './components/clientes-gestion/clientes-gestion';
import { PagosGestion } from './components/pagos-gestion/pagos-gestion';
import { Dashboard } from './components/dashboard/dashboard';
import { LoginComponent } from './login';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesGestion, canActivate: [authGuard] },
  { path: 'tarifas', component: TarifasGestion, canActivate: [authGuard] },
  { path: 'pagos', component: PagosGestion, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
