import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Libro } from '../../../core/models/database.models';
import { BookCoverComponent } from '../book-cover/book-cover.component';

/**
 * Tarjeta de libro del catálogo: portada, valoración, precio con descuento y estado de stock.
 * Agnóstica del contenedor: recibe el libro por `libro` y emite `selected` al activarse.
 */
@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, BookCoverComponent],
})
export class BookCardComponent {
  /** Libro a mostrar. */
  public readonly libro = input.required<Libro>();

  /** Se emite al pulsar la tarjeta (clic o teclado). */
  public readonly selected = output<Libro>();

  /** Porcentaje de descuento (0 si no hay). */
  protected readonly descuento = computed(() => this.libro().descuento ?? 0);

  /** Precio final tras aplicar el descuento. */
  protected readonly precioFinal = computed(
    () => this.libro().precio * (1 - this.descuento() / 100),
  );

  /** Estado de stock con su texto y su variante visual. */
  protected readonly stock = computed(() => {
    const s = this.libro().stock;
    if (s === 0) return { text: 'Agotado', kind: 'out' };
    if (s <= 5) return { text: `Últimas ${s} uds.`, kind: 'low' };
    return { text: 'En stock', kind: 'ok' };
  });
}
