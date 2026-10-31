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
  private readonly librosService = inject(LibrosService);

  public readonly libros = signal<Libro[]>([]);
  public readonly loading = signal(true);
  public readonly errorMessage = signal<string | null>(null);
  public readonly selected = signal<Libro | null>(null);

  public async ngOnInit(): Promise<void> {
    try {
      this.libros.set(await this.librosService.listAll());
    } catch {
      this.errorMessage.set('No se pudo cargar el catálogo de libros.');
    } finally {
      this.loading.set(false);
    }
  }

  public onRowSelected(libro: Libro): void {
    this.selected.set(libro);
  }
}
