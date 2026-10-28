import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { LibrosService } from '../core/services/libros.service';
import { Libro } from '../core/models/database.models';

/** Página "Catálogo": primera vista protegida tras el login, lista los libros desde Supabase. */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonText,
  ],
})
export class HomePage implements OnInit {
  private readonly librosService = inject(LibrosService);

  public readonly libros = signal<Libro[]>([]);
  public readonly loading = signal(true);
  public readonly errorMessage = signal<string | null>(null);

  public async ngOnInit(): Promise<void> {
    try {
      const libros = await this.librosService.listAll();
      this.libros.set(libros);
    } catch {
      this.errorMessage.set('No se pudo cargar el catálogo de libros.');
    } finally {
      this.loading.set(false);
    }
  }
}
