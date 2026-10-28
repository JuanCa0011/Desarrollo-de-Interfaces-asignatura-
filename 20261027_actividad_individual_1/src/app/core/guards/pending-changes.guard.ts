import { CanDeactivateFn } from '@angular/router';

/**
 * Contrato que deben implementar los componentes con formularios que quieran
 * protegerse de pérdida de datos accidental al navegar fuera de la vista.
 */
export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

/**
 * Guarda de integridad de datos (CanDeactivateFn): antes de abandonar una vista con
 * un formulario, delega en el propio componente si debe bloquear o permitir la salida
 * (p. ej. comprobando `form.dirty`).
 */
export const pendingChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (component) => {
  if (component.canDeactivate) {
    return component.canDeactivate();
  }
  return true;
};
