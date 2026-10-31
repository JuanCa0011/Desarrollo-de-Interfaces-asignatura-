import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSpinner,
  IonText,
  IonModal,
} from '@ionic/angular';
import { LibrosService } from '../core/services/libros.service';
import { Libro } from '../core/models/database.models';
import { BookCardComponent } from '../shared/components/book-card/book-card.component';
import { BookCoverComponent } from '../shared/components/book-cover/book-cover.component';
import { ThemeToggleComponent } from '../shared/components/theme-toggle/theme-toggle.component';

/** Criterios de ordenación disponibles en el catálogo. */
type CatalogSort = 'destacados' | 'titulo' | 'precio-asc' | 'precio-desc' | 'valoracion';

/** Página "Catálogo": escaparate con buscador, filtro por categoría, orden y detalle de cada libro. */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSpinner,
    IonText,
    IonModal,
    BookCardComponent,
    BookCoverComponent,
    ThemeToggleComponent,
  ],
})
export class HomePage implements OnInit {
  /** Servicio de acceso a los libros. */
  private readonly librosService = inject(LibrosService);

  /** Libros cargados desde Supabase. */
  public readonly libros = signal<Libro[]>([]);
  /** Indica que la carga inicial está en curso. */
  public readonly loading = signal(true);
  /** Mensaje de error de carga, o `null`. */
  public readonly errorMessage = signal<string | null>(null);
  /** Libro cuyo detalle se muestra en el modal. */
  public readonly selected = signal<Libro | null>(null);
  /** Texto de búsqueda. */
  public readonly term = signal('');
  /** Categoría activa (`null` = todas). */
  public readonly category = signal<string | null>(null);
  /** Criterio de ordenación activo. */
  public readonly sort = signal<CatalogSort>('destacados');

  /** Opciones del selector de orden. */
  protected readonly sortOptions: { value: CatalogSort; label: string }[] = [
    { value: 'destacados', label: 'Destacados primero' },
    { value: 'titulo', label: 'Título (A-Z)' },
    { value: 'precio-asc', label: 'Precio: menor a mayor' },
    { value: 'precio-desc', label: 'Precio: mayor a menor' },
    { value: 'valoracion', label: 'Mejor valorados' },
  ];

  /** Categorías disponibles con el número de libros de cada una. */
  protected readonly categories = computed(() => {
    const counts = new Map<string, number>();
    for (const l of this.libros()) counts.set(l.categoria, (counts.get(l.categoria) ?? 0) + 1);
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([name, count]) => ({ name, count }));
  });

  /** Libros filtrados por búsqueda y categoría, y ordenados. */
  protected readonly visible = computed(() => {
    const term = this.term().trim().toLowerCase();
    const cat = this.category();
    const filtered = this.libros().filter(
      (l) =>
        (!cat || l.categoria === cat) &&
        (!term || [l.titulo, l.autor, l.categoria, l.isbn ?? ''].some((v) => v.toLowerCase().includes(term))),
    );
    const price = (l: Libro): number => l.precio * (1 - (l.descuento ?? 0) / 100);
    const byTitle = (a: Libro, b: Libro): number => a.titulo.localeCompare(b.titulo, 'es');
    const sorters: Record<CatalogSort, (a: Libro, b: Libro) => number> = {
      destacados: (a, b) => Number(b.destacado) - Number(a.destacado) || byTitle(a, b),
      titulo: byTitle,
      'precio-asc': (a, b) => price(a) - price(b),
      'precio-desc': (a, b) => price(b) - price(a),
      valoracion: (a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0) || byTitle(a, b),
    };
    return [...filtered].sort(sorters[this.sort()]);
  });

  /** Carga el catálogo al iniciar la página. */
  public async ngOnInit(): Promise<void> {
    try {
      this.libros.set(await this.librosService.listAll());
    } catch {
      this.errorMessage.set('No se pudo cargar el catálogo de libros.');
    } finally {
      this.loading.set(false);
    }
  }

  /** Actualiza el término de búsqueda desde el campo de texto. */
  protected onSearch(event: Event): void {
    this.term.set((event.target as HTMLInputElement).value);
  }

  /** Cambia el criterio de ordenación desde el selector. */
  protected onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as CatalogSort);
  }

  /** Activa una categoría; pulsar la activa vuelve a mostrar todas. */
  protected toggleCategory(name: string | null): void {
    this.category.set(this.category() === name ? null : name);
  }

  /** Precio final de un libro tras el descuento. */
  protected finalPrice(l: Libro): number {
    return l.precio * (1 - (l.descuento ?? 0) / 100);
  }
}
