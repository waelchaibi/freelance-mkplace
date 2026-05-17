import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services/admin-services.component').then((m) => m.AdminServicesComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/orders/order-detail/admin-order-detail.component').then(
            (m) => m.AdminOrderDetailComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/admin-orders.component').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages/admin-messages.component').then((m) => m.AdminMessagesComponent),
      },
    ],
  },
];
