import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PaginatedResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(skip: number, take: number): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`/api/products?skip=${skip}&take=${take}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  searchProducts(q: string, skip: number, take: number): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`/api/products?q=${q}&skip=${skip}&take=${take}`);
  }
}
