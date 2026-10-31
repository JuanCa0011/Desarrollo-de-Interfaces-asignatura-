import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonText,
  IonButton,
} from '@ionic/angular';
import { LibrosService } from '../../../core/services/libros.service';
import { VentasService } from '../../../core/services/ventas.service';
import { ResenasMockService } from '../../../core/services/resenas-mock.service';
import { ExportService } from '../../../core/services/export.service';
import { Libro, Resena, VentaConLibro } from '../../../core/models/database.models';
import { StatWidgetComponent } from '../../../shared/components/stat-widget/stat-widget.component';
import { BookDataTableComponent } from '../../../shared/components/book-data-table/book-data-table.component';
import { ChartCardComponent } from '../../../shared/components/chart-card/chart-card.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

/**
 * Dashboard de administración: widgets, gráficos Chart.js, reseñas en tiempo real
 * (NoSQL simulado), tabla de inventario y exportación PDF/CSV.
 * Protegida por `roleMatchGuard`/`roleActivateGuard(['admin'])` en `admin.routes.ts`.
 */
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  providers: [CurrencyPipe],
  imports: [
    ThemeToggleComponent,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonText,
    IonButton,
    StatWidgetComponent,
    BookDataTableComponent,
    ChartCardComponent,
  ],
})
export class AdminDashboardPage implements OnInit {
  /** Servicio de libros (SQL). */
  private readonly librosService = inject(LibrosService);
  /** Servicio de ventas (SQL). */
  private readonly ventasService = inject(VentasService);
  /** Servicio de reseñas (NoSQL simulado). */
  private readonly resenasService = inject(ResenasMockService);
  /** Servicio de exportación PDF/CSV. */
  private readonly exportService = inject(ExportService);
  /** Pipe de moneda reutilizado desde la clase. */
  private readonly currency = inject(CurrencyPipe);
  /** Referencia de destrucción para cancelar suscripciones. */
  private readonly destroyRef = inject(DestroyRef);

  /** Inventario cargado. */
  public readonly libros = signal<Libro[]>([]);
  /** Ventas cargadas (puede estar vacío). */
  public readonly ventas = signal<VentaConLibro[]>([]);
  /** Últimas reseñas recibidas en tiempo real. */
  public readonly resenas = signal<Resena[]>([]);
  /** Indica que la carga inicial está en curso. */
  public readonly loading = signal(true);
  /** Mensaje de error de carga, o `null`. */
  public readonly errorMessage = signal<string | null>(null);

  /** Número de títulos distintos. */
  public readonly totalTitulos = computed(() => this.libros().length);
  /** Unidades totales en stock. */
  public readonly totalStock = computed(() => this.libros().reduce((s, l) => s + l.stock, 0));
  /** Títulos con 5 unidades o menos. */
  public readonly bajoStock = computed(() => this.libros().filter((l) => l.stock <= 5).length);
  /** Valor del inventario (precio por stock) formateado en euros. */
  public readonly valorInventario = computed(
    () =>
      this.currency.transform(
        this.libros().reduce((s, l) => s + l.precio * l.stock, 0),
        'EUR',
      ) ?? '',
  );

  /** Stock agrupado por categoría. */
  protected readonly stockPorCategoria = computed(() =>
    this.topWithOthers(this.group(this.libros(), (l) => l.categoria, (l) => l.stock)),
  );

  /** Ingresos de ventas agrupados por categoría del libro vendido. */
  protected readonly ingresosPorCategoria = computed(() =>
    this.topWithOthers(
      this.group(this.ventas(), (v) => v.libros?.categoria ?? 'Sin categoría', (v) => v.total),
    ),
  );

  /** Carga datos y arranca el flujo de reseñas simuladas. */
  public async ngOnInit(): Promise<void> {
    this.resenasService
      .stream()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => this.resenas.set(r.slice(0, 5)));

    try {
      this.libros.set(await this.librosService.listAll());
      // Las ventas son opcionales: si la consulta falla, el resto del panel sigue funcionando.
      this.ventas.set(await this.ventasService.listAll().catch(() => []));
    } catch {
      this.errorMessage.set('No se pudieron cargar los datos del inventario.');
    } finally {
      this.loading.set(false);
    }

    const libros = this.libros();
    if (libros.length) {
      this.resenasService
        .simulateActivity(libros)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  /** Exporta el inventario en el formato indicado. */
  public exportInventario(format: 'csv' | 'pdf'): void {
    const table = {
      title: 'Informe de inventario',
      headers: ['Título', 'Autor', 'Categoría', 'Precio (EUR)', 'Stock'],
      rows: this.libros().map((l) => [l.titulo, l.autor, l.categoria, l.precio.toFixed(2), l.stock]),
    };
    format === 'csv'
      ? this.exportService.exportCsv('inventario', table)
      : this.exportService.exportPdf('inventario', table);
  }

  /** Exporta las ventas en el formato indicado. */
  public exportVentas(format: 'csv' | 'pdf'): void {
    const table = {
      title: 'Informe de ventas',
      headers: ['Fecha', 'Libro', 'Cantidad', 'Precio unitario (EUR)', 'Total (EUR)'],
      rows: this.ventas().map((v) => [
        v.fecha_venta.slice(0, 10),
        v.libros?.titulo ?? '—',
        v.cantidad,
        v.precio_unitario.toFixed(2),
        v.total.toFixed(2),
      ]),
    };
    format === 'csv'
      ? this.exportService.exportCsv('ventas', table)
      : this.exportService.exportPdf('ventas', table);
  }

  /** Deja las `n` series mayores y agrupa el resto en «Otros» (los circulares legibles tienen pocas porciones). */
  private topWithOthers(
    g: { labels: string[]; data: number[] },
    n = 5,
  ): { labels: string[]; data: number[] } {
    const sorted = g.labels
      .map((label, i) => ({ label, value: g.data[i] }))
      .sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, n);
    const rest = sorted.slice(n).reduce((sum, x) => sum + x.value, 0);
    if (rest > 0) top.push({ label: 'Otros', value: rest });
    return { labels: top.map((x) => x.label), data: top.map((x) => x.value) };
  }

  /** Agrupa elementos por clave sumando un valor y devuelve etiquetas y datos ordenados. */
  private group<T>(
    items: T[],
    keyFn: (i: T) => string,
    valueFn: (i: T) => number,
  ): { labels: string[]; data: number[] } {
    const map = new Map<string, number>();
    for (const i of items) {
      map.set(keyFn(i), (map.get(keyFn(i)) ?? 0) + valueFn(i));
    }
    const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return { labels: entries.map(([k]) => k), data: entries.map(([, v]) => v) };
  }
}
