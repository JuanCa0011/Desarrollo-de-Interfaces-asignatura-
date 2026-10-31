import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guarda inversa (CanActivateFn): impide que un usuario ya autenticado vuelva a ver
 * las pantallas de login/registro, redirigiéndolo a la zona privada de la app.
 */
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.whenReady();

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
