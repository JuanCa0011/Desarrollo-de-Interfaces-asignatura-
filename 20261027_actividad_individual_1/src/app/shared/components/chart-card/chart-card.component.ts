import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
      @if (!hasData()) {
        <p class="chart-card__empty" role="status">{{ emptyMessage() }}</p>
      }
      <div class="chart-card__canvas" [hidden]="!hasData()">
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
      background: var(--app-surface);
    }
    .chart-card__title {
      margin-bottom: 8px;
      font-weight: 700;
    }
    .chart-card__empty {
      margin: 24px 0;
      text-align: center;
      color: var(--app-text-muted);
    }
    .chart-card__canvas {
      position: relative;
      height: 320px;
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
  public readonly emptyMessage = input('No hay datos para mostrar.');

  protected readonly hasData = computed(() => this.data().some((v) => v > 0));

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
      this.chart = undefined;
      if (!data.some((v) => v > 0)) return;

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
              borderColor: circular ? getComputedStyle(document.body).backgroundColor : '#3880ff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: circular,
              position: 'bottom',
              labels: { color: getComputedStyle(document.body).color },
            },
          },
        },
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
