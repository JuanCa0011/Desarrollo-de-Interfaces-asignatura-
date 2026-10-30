import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IonSearchbar, IonSpinner, IonText } from '@ionic/angular';
import { Libro } from '../../../core/models/database.models';

export type BookSortKey = 'titulo' | 'autor' | 'categoria' | 'precio' | 'stock';
export type SortDirection = 'asc' | 'desc';

/**
 * Tabla de libros reutilizable con buscador y ordenación.
 * Agnóstica del contenedor: recibe los datos por `libros` y notifica
 * las interacciones mediante `rowSelected` y `searchChange`.
 */
@Component({
  selector: 'app-book-data-table',
  templateUrl: './book-data-table.component.html',
  styleUrls: ['./book-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, IonSearchbar, IonSpinner, IonText],
})
export class BookDataTableComponent {
  public readonly libros = input<Libro[]>([]);
  public readonly loading = input(false);
  public readonly caption = input('Listado de libros');

  /** Se emite al pulsar una fila (clic o teclado). */
  public readonly rowSelected = output<Libro>();
  /** Se emite con el texto de búsqueda cada vez que cambia. */
  public readonly searchChange = output<string>();

  protected readonly term = signal('');
  protected readonly sortKey = signal<BookSortKey>('titulo');
  protected readonly sortDir = signal<SortDirection>('asc');

  protected readonly columns: { key: BookSortKey; label: string; numeric: boolean }[] = [
    { key: 'titulo', label: 'Título', numeric: false },
    { key: 'autor', label: 'Autor', numeric: false },
    { key: 'categoria', label: 'Categoría', numeric: false },
    { key: 'precio', label: 'Precio', numeric: true },
    { key: 'stock', label: 'Stock', numeric: true },
  ];

  protected readonly rows = computed(() => {
    const term = this.term().trim().toLowerCase();
    const key = this.sortKey();
    const factor = this.sortDir() === 'asc' ? 1 : -1;
    const filtered = term
      ? this.libros().filter((l) =>
          [l.titulo, l.autor, l.categoria, l.isbn ?? ''].some((v) => v.toLowerCase().includes(term)),
        )
      : this.libros();
    return [...filtered].sort((a, b) => {
      const x = a[key];
      const y = b[key];
      return (
        (typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y), 'es')) * factor
      );
    });
  });

  protected onSearch(event: Event): void {
    const value = String((event as CustomEvent).detail.value ?? '');
    this.term.set(value);
    this.searchChange.emit(value);
  }

  protected sortBy(key: BookSortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  protected ariaSort(key: BookSortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }
}
