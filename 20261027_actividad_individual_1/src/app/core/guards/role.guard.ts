import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/database.models';

/**
 * Factorías de autorización por rol (RBAC), siguiendo el patrón del Dossier_Guards:
 * - `roleMatchGuard` (CanMatchFn): barrera de red; evita descargar el chunk lazy-loaded
 *   si el usuario no tiene el rol requerido.
 * - `roleActivateGuard` (CanActivateFn): barrera de vista; evita instanciar el componente
 *   ya descargado si el rol no es válido.
 * Ambas devuelven un UrlTree (nunca un booleano "a secas") para redirigir de forma atómica.
 */
export const roleMatchGuard = (allowedRoles: readonly UserRole[]): CanMatchFn => {
  return async (_route: Route, _segments: UrlSegment[]) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.whenReady();

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const role = authService.role();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};

export const roleActivateGuard = (allowedRoles: readonly UserRole[]): CanActivateFn => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.whenReady();

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const role = authService.role();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};
