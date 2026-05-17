import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/role.enum';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as Role[]) ?? [];
  const userRole = auth.getRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  if (userRole) {
    return router.createUrlTree([`/${userRole.toLowerCase()}/dashboard`]);
  }

  return router.createUrlTree(['/auth/login']);
};
