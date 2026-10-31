import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  CanMatchFn,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
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
  return async (_route: Route, segments: UrlSegment[]) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.whenReady();

    if (!authService.isAuthenticated()) {
      // Se conserva la URL pedida para volver a ella tras iniciar sesión.
      const returnUrl = '/' + segments.map((s) => s.path).join('/');
      return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    }

    const role = authService.role();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};

/** Barrera de vista del RBAC: redirige con `UrlTree` a `/login` o `/forbidden` si el rol no es válido. */
export const roleActivateGuard = (allowedRoles: readonly UserRole[]): CanActivateFn => {
  return async (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.whenReady();

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const role = authService.role();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};
