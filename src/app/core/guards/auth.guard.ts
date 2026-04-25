import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';

export const authGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.user(); // ✅ signal usage

  // ❌ Not logged in
  if (!user || !auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // ✅ Role-based check
  const allowedRoles = route.data?.['roles'] as string[];

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};