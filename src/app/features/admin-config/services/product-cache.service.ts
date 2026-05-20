import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay, catchError } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductCacheService {
  private products = inject(ProductService);
  private cache = new Map<string, Observable<Product | null>>();

  getByHandle(handle: string): Observable<Product | null> {
    if (!handle) return of(null);
    let req = this.cache.get(handle);
    if (!req) {
      req = this.products.getProductByHandle(handle).pipe(
        catchError(() => of(null as Product | null)),
        shareReplay(1)
      );
      this.cache.set(handle, req);
    }
    return req;
  }

  invalidate(handle: string) {
    this.cache.delete(handle);
  }
}
