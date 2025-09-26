import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const adminGuard: CanActivateFn = () => {
  if (environment.features?.bypassAdminGuard) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.appUser$.pipe(
    map((user) => (user?.role === 'admin' ? true : router.createUrlTree(['/']))),
    take(1)
  );
};
