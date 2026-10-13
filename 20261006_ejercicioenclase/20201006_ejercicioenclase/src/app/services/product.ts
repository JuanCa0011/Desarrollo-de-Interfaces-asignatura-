import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../../models/product-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'https://dummyjson.com/products';

  getProducts(limit: number, skip: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(this.apiUrl, {
      params: { limit, skip },
    });
  }
}