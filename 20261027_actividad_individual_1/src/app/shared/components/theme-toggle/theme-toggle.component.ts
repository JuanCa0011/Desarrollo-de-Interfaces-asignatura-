import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { ThemeService } from '../../../core/services/theme.service';

addIcons({ 'moon-outline': moonOutline, 'sunny-outline': sunnyOutline });

/**
 * Botón de icono para alternar el modo claro/oscuro. Pensado para colocarse en
 * `<ion-buttons slot="end">` de la barra superior de cada página.
 */
@Component({
  selector: 'app-theme-toggle',
  template: `
    <ion-button
      (click)="theme.toggle()"
      [attr.aria-label]="theme.label()"
      [attr.aria-pressed]="theme.isDark()"
      [title]="theme.label()"
    >
      <ion-icon
        slot="icon-only"
        [name]="theme.isDark() ? 'sunny-outline' : 'moon-outline'"
        aria-hidden="true"
      ></ion-icon>
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonIcon],
})
export class ThemeToggleComponent {
  /** Servicio que gestiona el tema. */
  protected readonly theme = inject(ThemeService);
}
