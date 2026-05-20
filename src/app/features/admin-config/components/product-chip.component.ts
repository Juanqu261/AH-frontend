import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { Observable, of } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductCacheService } from '../services/product-cache.service';

@Component({
  selector: 'app-product-chip',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <span class="group inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-full pl-1 pr-2.5 py-1 text-sm text-silver transition-colors">
      <ng-container *ngIf="product$ | async as product; else loading">
        <img *ngIf="product.images?.[0]?.url as src; else noImg"
             [src]="src" [alt]="product.name"
             class="w-7 h-7 rounded-full object-cover border border-white/10" />
        <ng-template #noImg>
          <span class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-gray-500">—</span>
        </ng-template>
        <span class="truncate max-w-[180px]" [title]="product.name + ' (' + handle + ')'">{{ product.name }}</span>
      </ng-container>
      <ng-template #loading>
        <span class="w-7 h-7 rounded-full bg-white/5 animate-pulse"></span>
        <span class="text-gray-500 italic font-mono text-xs">{{ handle }}</span>
      </ng-template>
      <button *ngIf="removable"
              type="button"
              (click)="remove.emit()"
              class="ml-1 text-gray-500 hover:text-red-400 transition-colors p-0.5 rounded-full hover:bg-red-900/30"
              aria-label="Remove">
        <lucide-icon [img]="icons.X" class="w-3.5 h-3.5"></lucide-icon>
      </button>
    </span>
  `
})
export class ProductChipComponent implements OnChanges {
  @Input() handle = '';
  @Input() removable = true;
  @Output() remove = new EventEmitter<void>();

  readonly icons = { X };
  private cache = inject(ProductCacheService);
  product$: Observable<Product | null> = of(null);

  ngOnChanges() {
    this.product$ = this.cache.getByHandle(this.handle);
  }
}
