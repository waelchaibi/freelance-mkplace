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
        path: 'notifications',
        loadComponent: () =>
          import('../../shared/components/notifications-page/notifications-page.component').then(
            (m) => m.NotificationsPageComponent
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/users/admin-role-users.component').then((m) => m.AdminRoleUsersComponent),
        data: {
          role: 'CLIENT',
          title: 'Clients',
          subtitle: 'Gérer les comptes clients et l\'accès à la plateforme.',
        },
      },
      {
        path: 'freelancers',
        loadComponent: () =>
          import('./pages/users/admin-role-users.component').then((m) => m.AdminRoleUsersComponent),
        data: {
          role: 'FREELANCER',
          title: 'Freelancers',
          subtitle: 'Consultez les profils freelancers et gérez l\'accès aux comptes.',
        },
      },
      {
        path: 'users',
        redirectTo: 'clients',
        pathMatch: 'full',
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
          import('../../shared/components/message-inbox/message-inbox.component').then(
            (m) => m.MessageInboxComponent
          ),
        data: {
          title: 'Centre de messagerie',
          subtitle: 'Vue consolidée des conversations clients par projet.',
        },
      },
      {
        path: 'feedbacks',
        loadComponent: () =>
          import('./pages/feedbacks/admin-feedbacks.component').then((m) => m.AdminFeedbacksComponent),
      },
      {
        path: 'notification-log',
        loadComponent: () =>
          import('./pages/notifications/admin-notification-log.component').then(
            (m) => m.AdminNotificationLogComponent
          ),
      },
    ],
  },
];
