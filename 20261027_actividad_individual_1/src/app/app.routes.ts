import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleActivateGuard, roleMatchGuard } from './core/guards/role.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

/** Rutas principales: login/registro (invitados), shell autenticado con Side Menu, 403 y 404. */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    canDeactivate: [pendingChangesGuard],
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
  },
  {
    // Shell con Side Menu (Paso 1.1): toda la navegación autenticada vive aquí.
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.page').then((m) => m.MainLayoutPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        // Blindaje en dos capas: canMatch evita descargar el chunk, canActivate protege la vista.
        path: 'admin',
        canMatch: [roleMatchGuard(['admin'])],
        canActivate: [roleActivateGuard(['admin'])],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
