import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { LibrosService } from '../core/services/libros.service';
import { Libro } from '../core/models/database.models';
import { BookDataTableComponent } from '../shared/components/book-data-table/book-data-table.component';
import { ThemeToggleComponent } from '../shared/components/theme-toggle/theme-toggle.component';

/** Página "Catálogo": primera vista protegida tras el login, lista los libros desde Supabase. */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSpinner,
    IonText,
    BookDataTableComponent,
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
  /** Último libro seleccionado en la tabla. */
  public readonly selected = signal<Libro | null>(null);

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

  /** Guarda el libro seleccionado en la tabla. */
  public onRowSelected(libro: Libro): void {
    this.selected.set(libro);
  }
}
