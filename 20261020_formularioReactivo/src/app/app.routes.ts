import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // URL de la página: /registropage (el path de la URL es independiente del nombre de la carpeta).
    path: 'registropage',
    // Carga perezosa: el componente se descarga solo al entrar en esta ruta.
    // La ruta del import y el nombre de la clase deben coincidir con el archivo renombrado.
    loadComponent: () => import('./registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    // La ruta vacía redirige a la página principal, que ahora es 'registropage'.
    path: '',
    redirectTo: 'registropage',
    pathMatch: 'full',
  },
];
