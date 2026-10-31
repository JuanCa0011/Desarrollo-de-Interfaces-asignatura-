import { Routes } from '@angular/router';

/**
 * Rutas de la sección de administración, cargadas mediante `loadChildren` solo si
 * `roleMatchGuard(['admin'])` autoriza la descarga del chunk (ver app.routes.ts).
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
  },
];
