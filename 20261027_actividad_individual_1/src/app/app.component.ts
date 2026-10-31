import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { ThemeService } from './core/services/theme.service';

/** Componente raíz: monta `ion-app` y el `ion-router-outlet` principal. */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // Se inyecta aquí para aplicar el tema guardado desde el primer render.
  /** Inyectado aquí para aplicar el tema guardado desde el primer render. */
  private readonly theme = inject(ThemeService);
}
