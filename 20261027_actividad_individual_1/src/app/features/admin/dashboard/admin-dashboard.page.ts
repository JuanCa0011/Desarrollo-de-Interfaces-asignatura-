import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonText } from '@ionic/angular';
import { LibrosService } from '../../../core/services/libros.service';
import { Libro } from '../../../core/models/database.models';
import { StatWidgetComponent } from '../../../shared/components/stat-widget/stat-widget.component';
import { BookDataTableComponent } from '../../../shared/components/book-data-table/book-data-table.component';

/**
 * Dashboard de administración. Fase 2: widgets estadísticos y tabla de inventario.
 * Los gráficos Chart.js y la exportación PDF/CSV se añaden en la Fase 3.
 * Protegida por `roleMatchGuard`/`roleActivateGuard(['admin'])` en `admin.routes.ts`.
 */
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  providers: [CurrencyPipe],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonText,
    StatWidgetComponent,
    BookDataTableComponent,
  ],
})
export class AdminDashboardPage implements OnInit {
  private readonly librosService = inject(LibrosService);
  private readonly currency = inject(CurrencyPipe);

  public readonly libros = signal<Libro[]>([]);
  public readonly loading = signal(true);
  public readonly errorMessage = signal<string | null>(null);

  public readonly totalTitulos = computed(() => this.libros().length);
  public readonly totalStock = computed(() => this.libros().reduce((s, l) => s + l.stock, 0));
  public readonly bajoStock = computed(() => this.libros().filter((l) => l.stock <= 5).length);
  public readonly valorInventario = computed(
    () => this.currency.transform(this.libros().reduce((s, l) => s + l.precio * l.stock, 0), 'EUR') ?? '',
  );

  public async ngOnInit(): Promise<void> {
    try {
      this.libros.set(await this.librosService.listAll());
    } catch {
      this.errorMessage.set('No se pudieron cargar los datos del inventario.');
    } finally {
      this.loading.set(false);
    }
  }
}
