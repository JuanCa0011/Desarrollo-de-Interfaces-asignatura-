import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cashOutline, cubeOutline, libraryOutline, warningOutline } from 'ionicons/icons';

addIcons({ cashOutline, cubeOutline, libraryOutline, warningOutline });

/**
 * Widget estadístico reutilizable (KPI). Recibe etiqueta, valor e icono por
 * `input()` y emite `selected` cuando se activa (clic o teclado), por ejemplo
 * para que el padre filtre o navegue al detalle.
 */
@Component({
  selector: 'app-stat-widget',
  templateUrl: './stat-widget.component.html',
  styleUrls: ['./stat-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class StatWidgetComponent {
  /** Etiqueta de la métrica. */
  public readonly label = input.required<string>();
  /** Valor a destacar. */
  public readonly value = input.required<string | number>();
  /** Nombre del icono Ionicons (opcional). */
  public readonly icon = input<string>();
  /** Texto secundario (opcional). */
  public readonly hint = input<string>();
  /** Color de acento del widget. */
  public readonly color = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  /** Se emite al activar el widget. */
  public readonly selected = output<void>();
}
