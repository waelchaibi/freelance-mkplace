import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/client-layout.component').then((m) => m.ClientLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/client-dashboard.component').then((m) => m.ClientDashboardComponent),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services/client-services.component').then((m) => m.ClientServicesComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/client-orders.component').then((m) => m.ClientOrdersComponent),
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./pages/orders/create-order/client-create-order.component').then(
            (m) => m.ClientCreateOrderComponent
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('../../shared/components/message-inbox/message-inbox.component').then(
            (m) => m.MessageInboxComponent
          ),
        data: {
          title: 'Messages',
          subtitle: 'Discutez avec l\'admin pour chaque projet. Pas de contact direct avec le freelancer.',
        },
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../../shared/components/notifications-page/notifications-page.component').then(
            (m) => m.NotificationsPageComponent
          ),
      },
      {
        path: 'freelancers/:id',
        loadComponent: () =>
          import('./pages/freelancers/client-freelancer-showcase.component').then(
            (m) => m.ClientFreelancerShowcaseComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/client-profile.component').then((m) => m.ClientProfileComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/orders/order-detail/client-order-detail.component').then(
            (m) => m.ClientOrderDetailComponent
          ),
      },
    ],
  },
];
