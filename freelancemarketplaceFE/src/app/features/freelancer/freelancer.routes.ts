import { Routes } from '@angular/router';

export const FREELANCER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/freelancer-layout.component').then((m) => m.FreelancerLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/freelancer-dashboard.component').then(
            (m) => m.FreelancerDashboardComponent
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
          subtitle: 'Échangez avec l\'admin sur vos projets assignés.',
        },
      },
      {
        path: 'feedbacks',
        loadComponent: () =>
          import('./pages/feedbacks/freelancer-feedbacks.component').then(
            (m) => m.FreelancerFeedbacksComponent
          ),
      },
      {
        path: 'portfolio',
        loadComponent: () =>
          import('./pages/portfolio/freelancer-portfolio.component').then(
            (m) => m.FreelancerPortfolioComponent
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../../shared/components/notifications-page/notifications-page.component').then(
            (m) => m.NotificationsPageComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/freelancer-profile.component').then(
            (m) => m.FreelancerProfileComponent
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services/freelancer-services.component').then(
            (m) => m.FreelancerServicesComponent
          ),
      },
      {
        path: 'services/new',
        loadComponent: () =>
          import('./pages/services/create-service/freelancer-create-service.component').then(
            (m) => m.FreelancerCreateServiceComponent
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/orders/order-detail/freelancer-order-detail.component').then(
            (m) => m.FreelancerOrderDetailComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/freelancer-orders.component').then((m) => m.FreelancerOrdersComponent),
      },
    ],
  },
];
