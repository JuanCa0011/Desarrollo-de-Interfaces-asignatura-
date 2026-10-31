import { Injectable, computed, signal } from '@angular/core';

/** Clave de `localStorage` donde se guarda la preferencia de tema. */
const STORAGE_KEY = 'theme';

/**
 * Gestiona el modo claro/oscuro. Aplica la clase `ion-palette-dark` en `<html>`
 * (paleta `dark.class` de Ionic). El valor inicial es la preferencia guardada por el
 * usuario o, si no hay, la del sistema operativo.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Estado interno del modo oscuro. */
  private readonly _dark = signal(this.initialValue());

  /** `true` si el modo oscuro está activo (solo lectura). */
  public readonly isDark = this._dark.asReadonly();
  /** Texto accesible de la acción del botón de tema. */
  public readonly label = computed(() =>
    this._dark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
  );

  /** Aplica el tema inicial al arrancar. */
  constructor() {
    this.apply(this._dark());
  }

  /** Alterna entre claro y oscuro y guarda la preferencia. */
  public toggle(): void {
    const next = !this._dark();
    this._dark.set(next);
    this.apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Sin almacenamiento disponible: el cambio solo dura la sesión.
    }
  }

  /** Añade o quita la clase `ion-palette-dark` en `<html>`. */
  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }

  /** Preferencia guardada o, si no existe, la del sistema operativo. */
  private initialValue(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved === 'dark';
    } catch {
      // Se ignora y se usa la preferencia del sistema.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
