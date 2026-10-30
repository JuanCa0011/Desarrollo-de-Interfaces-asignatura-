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
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly icon = input<string>();
  public readonly hint = input<string>();
  public readonly color = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  public readonly selected = output<void>();
}
