import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton
} from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { Product, ProductsResponse } from '../../../models/product-model';
import { ProductService } from '../../services/product';



@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
  ]
})
export class ProductosPage implements OnInit {
  private readonly productService = inject(ProductService);
  readonly pageSize = 10;
  products = signal<Product[]>([]);
  total = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page = this.currentPage()): void {
    this.loading.set(true);
    this.error.set('');

    this.productService.getProducts(this.pageSize, (page - 1) * this.pageSize)
      .subscribe({
        next: (response: ProductsResponse) => {
          this.products.set(response.products);
          this.total.set(response.total);
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          console.error(err);
          this.error.set('No se han podido cargar los productos.');
          this.loading.set(false);
        }
      });
  }

  get totalPages(): number {
    return Math.ceil(this.total() / this.pageSize);
  }

  get firstProductNumber(): number {
    return this.total() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1;
  }

  get lastProductNumber(): number {
    return Math.min(this.currentPage() * this.pageSize, this.total());
  }

  goToPage(page: number): void {
    if (this.loading() || page < 1 || page > this.totalPages || page === this.currentPage()) {
      return;
    }

    this.loadProducts(page);
  }
}