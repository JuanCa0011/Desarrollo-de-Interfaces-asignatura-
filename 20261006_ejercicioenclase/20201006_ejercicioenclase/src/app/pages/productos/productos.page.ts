import { Component, Injectable, OnInit, inject } from '@angular/core';
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

import { Product, ProductsResponse } from '../../../models/product.model';
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
    IonButton
  ]
})
export class ProductosPage implements OnInit {
  private productService = inject(ProductService);
  products: Product[] = [];
  total = 0;
  loading = false;
  error = '';
  ngOnInit(): void {
    this.loadProducts();
  }
  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.productService.getProducts()
      .subscribe({
        next: (response: ProductsResponse) => {
          this.products = response.products;
          this.total = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.error =
            'No se han podido cargar los productos.';
          this.loading = false;
        }
      });
  }
}