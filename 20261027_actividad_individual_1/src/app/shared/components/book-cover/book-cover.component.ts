import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Portada de un libro. Muestra la foto real de la portada (Open Library, por ISBN) cuando existe y,
 * mientras carga o si no hay imagen disponible, una portada generada con CSS: degradado cuyo tono
 * depende del título, con título y autor en tipografía serif.
 */
@Component({
  selector: 'app-book-cover',
  templateUrl: './book-cover.component.html',
  styleUrls: ['./book-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCoverComponent {
  /** Título impreso en la portada generada. */
  public readonly titulo = input.required<string>();
  /** Autor impreso en la portada generada. */
  public readonly autor = input.required<string>();
  /** ISBN con el que se busca la foto real; sin él solo se muestra la portada generada. */
  public readonly isbn = input<string | null | undefined>(null);

  /** `true` cuando la imagen real ha cargado y puede mostrarse encima de la generada. */
  protected readonly loaded = signal(false);
  /** `true` si Open Library no tiene portada para este ISBN o falló la carga. */
  protected readonly failed = signal(false);

  /** URL de la foto real, o `null` si no hay ISBN o ya falló. `default=false` hace que un ISBN sin portada devuelva 404. */
  protected readonly photoUrl = computed(() => {
    const isbn = this.isbn()?.replace(/[^0-9Xx]/g, '');
    return isbn && !this.failed()
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
      : null;
  });

  /** Tono (0-359) derivado de un hash estable del título. */
  private readonly hue = computed(() => {
    let h = 0;
    for (const c of this.titulo()) h = (h * 31 + c.charCodeAt(0)) % 360;
    return h;
  });

  /** Color inicial del degradado. */
  protected readonly from = computed(() => `hsl(${this.hue()} 52% 34%)`);
  /** Color final del degradado. */
  protected readonly to = computed(() => `hsl(${(this.hue() + 45) % 360} 58% 18%)`);
}
