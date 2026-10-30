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
  private readonly librosService = inject(LibrosService);
  private readonly ventasService = inject(VentasService);
  private readonly resenasService = inject(ResenasMockService);
  private readonly exportService = inject(ExportService);
  private readonly currency = inject(CurrencyPipe);
  private readonly destroyRef = inject(DestroyRef);

  public readonly libros = signal<Libro[]>([]);
  public readonly ventas = signal<VentaConLibro[]>([]);
  public readonly resenas = signal<Resena[]>([]);
  public readonly loading = signal(true);
  public readonly errorMessage = signal<string | null>(null);

  public readonly totalTitulos = computed(() => this.libros().length);
  public readonly totalStock = computed(() => this.libros().reduce((s, l) => s + l.stock, 0));
  public readonly bajoStock = computed(() => this.libros().filter((l) => l.stock <= 5).length);
  public readonly valorInventario = computed(
    () =>
      this.currency.transform(
        this.libros().reduce((s, l) => s + l.precio * l.stock, 0),
        'EUR',
      ) ?? '',
  );

  /** Stock agrupado por categoría. */
  protected readonly stockPorCategoria = computed(() =>
    this.group(this.libros(), (l) => l.categoria, (l) => l.stock),
  );

  /** Ingresos de ventas agrupados por mes (YYYY-MM). */
  protected readonly ingresosPorMes = computed(() =>
    this.group(this.ventas(), (v) => v.fecha_venta.slice(0, 7), (v) => v.total),
  );

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
