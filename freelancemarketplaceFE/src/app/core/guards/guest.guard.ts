import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.getRole();

  if (!auth.isAuthenticated() || !role) {
    return true;
  }

  const routes = {
    ADMIN: '/admin/dashboard',
    CLIENT: '/client/dashboard',
    FREELANCER: '/freelancer/dashboard',
  } as const;

  return router.createUrlTree([routes[role]]);
};
