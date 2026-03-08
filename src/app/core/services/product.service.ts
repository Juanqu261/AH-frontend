import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PaginatedResponse } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(skip: number, take: number): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${environment.apiUrl}/products?skip=${skip}&take=${take}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }

  searchProducts(q: string, skip: number, take: number): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${environment.apiUrl}/products?q=${q}&skip=${skip}&take=${take}`);
  }
}
