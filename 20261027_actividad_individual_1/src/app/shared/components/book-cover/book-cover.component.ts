import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Portada generada con CSS: degradado cuyo tono depende del título, con título y autor
 * en tipografía serif. Sustituye a las imágenes placeholder externas (sin red, sin carga).
 */
@Component({
  selector: 'app-book-cover',
  template: `
    <div class="cover" [style.--cover-from]="from()" [style.--cover-to]="to()" aria-hidden="true">
      <span class="cover__title">{{ titulo() }}</span>
      <span class="cover__rule"></span>
      <span class="cover__author">{{ autor() }}</span>
    </div>
  `,
  styleUrls: ['./book-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCoverComponent {
  /** Título impreso en la portada. */
  public readonly titulo = input.required<string>();
  /** Autor impreso en la portada. */
  public readonly autor = input.required<string>();

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
