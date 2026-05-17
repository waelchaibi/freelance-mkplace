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
