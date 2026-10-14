import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  async getProducts(): Promise<Product[]> {
    const response = await fetch('assets/data/products.json');

    if (!response.ok) {
      throw new Error(`No se pudieron cargar los productos: ${response.status}`);
    }

    const products: Product[] = await response.json();
    return products;
  }
}
