import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/role.enum';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.CLIENT] },
    loadChildren: () => import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  {
    path: 'freelancer',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.FREELANCER] },
    loadChildren: () =>
      import('./features/freelancer/freelancer.routes').then((m) => m.FREELANCER_ROUTES),
  },
  { path: '**', redirectTo: 'auth/login' },
];
