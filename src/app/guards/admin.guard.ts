import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.appUser$.pipe(
    map((user) => (user?.role === 'admin' ? true : router.createUrlTree(['/']))),
    take(1)
  );
};
