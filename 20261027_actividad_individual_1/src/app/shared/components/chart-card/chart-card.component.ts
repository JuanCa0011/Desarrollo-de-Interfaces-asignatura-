import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Chart, ChartType, registerables } from 'chart.js';
import { ThemeService } from '../../../core/services/theme.service';

Chart.register(...registerables);

/** Paleta de series: acento índigo + tonos con buen contraste en claro y oscuro (el gris se reserva a "Otros"). */
const PALETTE = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#94a3b8'];

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
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 20px;
      height: 100%;
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius);
      background: var(--app-surface);
      box-shadow: var(--app-shadow);
    }
    .chart-card__title {
      margin-bottom: 12px;
      font-family: var(--app-font-display);
      font-size: 1.1rem;
      font-weight: 700;
    }
    .chart-card__empty {
      display: grid;
      flex: 1;
      place-items: center;
      min-height: 160px;
      margin: 0;
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
  /** Título del gráfico (también su etiqueta accesible). */
  public readonly title = input.required<string>();
  /** Tipo de gráfico de Chart.js (`bar`, `line`, `pie`, `doughnut`...). */
  public readonly type = input<ChartType>('bar');
  /** Etiquetas de cada dato. */
  public readonly labels = input<string[]>([]);
  /** Valores numéricos de la serie. */
  public readonly data = input<number[]>([]);
  /** Nombre de la serie. */
  public readonly seriesLabel = input('Valor');
  /** Texto mostrado cuando no hay datos. */
  public readonly emptyMessage = input('No hay datos para mostrar.');

  /** `true` si hay algún valor mayor que cero. */
  protected readonly hasData = computed(() => this.data().some((v) => v > 0));

  /** Referencia al `<canvas>` donde se dibuja. */
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  /** Servicio de tema; redibuja al cambiar de modo. */
  private readonly theme = inject(ThemeService);
  /** Instancia de Chart.js activa. */
  private chart?: Chart;

  /** Crea o redibuja el gráfico cuando cambian los datos o el tema. */
  constructor() {
    effect(() => {
      const type = this.type();
      const labels = this.labels();
      const data = this.data();
      const label = this.seriesLabel();
      // Dependencia del tema: los colores del texto y bordes se leen del DOM al crear el gráfico.
      this.theme.isDark();
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
                ? labels.map((l, i) => (l === 'Otros' ? PALETTE[5] : PALETTE[i % 5]))
                : '#6366f1',
              borderColor: circular ? getComputedStyle(document.documentElement).getPropertyValue('--app-surface').trim() : '#6366f1',
              borderWidth: circular ? 3 : 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...(type === 'doughnut' ? { cutout: '64%' } : {}),
          plugins: {
            legend: {
              display: circular,
              position: 'bottom',
              labels: { color: getComputedStyle(document.body).color, usePointStyle: true, padding: 14 },
            },
          },
        },
      });
    });
  }

  /** Resumen textual del gráfico para lectores de pantalla. */
  protected summary(): string {
    return this.labels()
      .map((l, i) => `${l} ${this.data()[i]}`)
      .join(', ');
  }

  /** Destruye el gráfico para liberar el canvas. */
  public ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
