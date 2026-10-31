import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

/**
 * Gestiona el modo claro/oscuro. Aplica la clase `ion-palette-dark` en `<html>`
 * (paleta `dark.class` de Ionic). El valor inicial es la preferencia guardada por el
 * usuario o, si no hay, la del sistema operativo.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _dark = signal(this.initialValue());

  public readonly isDark = this._dark.asReadonly();
  public readonly label = computed(() =>
    this._dark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
  );

  constructor() {
    this.apply(this._dark());
  }

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

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }

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
