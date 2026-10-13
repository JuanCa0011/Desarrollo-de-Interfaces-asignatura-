import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { StoreProduct } from '../../../models/product-model';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class CatalogoPage implements OnInit {
  private readonly storeService = inject(StoreService);

  products = signal<StoreProduct[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading.set(true);
    this.error.set('');

    this.storeService.getStoreProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('No se han podido cargar las publicaciones.');
        this.loading.set(false);
      },
    });
  }
}