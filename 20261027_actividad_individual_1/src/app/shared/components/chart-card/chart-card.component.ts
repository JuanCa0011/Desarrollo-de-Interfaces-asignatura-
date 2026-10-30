import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { Chart, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Gráfico Chart.js reutilizable y agnóstico: recibe tipo, etiquetas y serie por `input()`.
 * Se actualiza al cambiar los datos y libera el canvas en `ngOnDestroy` (sin memory leaks).
 */
@Component({
  selector: 'app-chart-card',
  template: `
    <figure class="chart-card">
      <figcaption class="chart-card__title">{{ title() }}</figcaption>
      <div class="chart-card__canvas">
        <canvas #canvas role="img" [attr.aria-label]="title() + ': ' + summary()"></canvas>
      </div>
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }
    .chart-card {
      margin: 0;
      padding: 16px;
      border-radius: 8px;
      background: var(--ion-color-step-50, #f4f5f8);
    }
    .chart-card__title {
      margin-bottom: 8px;
      font-weight: 700;
    }
    .chart-card__canvas {
      position: relative;
      height: 260px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent implements OnDestroy {
  public readonly title = input.required<string>();
  public readonly type = input<ChartType>('bar');
  public readonly labels = input<string[]>([]);
  public readonly data = input<number[]>([]);
  public readonly seriesLabel = input('Valor');

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    effect(() => {
      const type = this.type();
      const labels = this.labels();
      const data = this.data();
      const label = this.seriesLabel();
      const circular = type === 'pie' || type === 'doughnut';

      this.chart?.destroy();
      this.chart = new Chart(this.canvas().nativeElement, {
        type,
        data: {
          labels,
          datasets: [
            {
              label,
              data,
              backgroundColor: circular
                ? labels.map((_, i) => `hsl(${(i * 47) % 360} 65% 50%)`)
                : '#3880ff',
              borderColor: '#3880ff',
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    });
  }

  protected summary(): string {
    return this.labels()
      .map((l, i) => `${l} ${this.data()[i]}`)
      .join(', ');
  }

  public ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
