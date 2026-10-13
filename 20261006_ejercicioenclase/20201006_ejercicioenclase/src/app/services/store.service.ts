import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StoreProduct } from '../../models/product-model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  getStoreProducts(): Observable<StoreProduct[]> {
    return this.http.get<StoreProduct[]>(this.apiUrl);
  }
}