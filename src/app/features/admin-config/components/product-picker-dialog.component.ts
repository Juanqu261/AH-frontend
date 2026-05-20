import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { LucideAngularModule, Search, ChevronLeft, ChevronRight, Check } from 'lucide-angular';
import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { Product, PaginatedResponse } from '../../../core/models/product.model';

export interface ProductPickerData {
  mode: 'single' | 'multi';
  initiallySelected: string[];
  title?: string;
}

@Component({
  selector: 'app-product-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-[#161616] border border-white/10 rounded-xl shadow-2xl shadow-black/60 w-[min(900px,95vw)] max-h-[85vh] flex flex-col text-silver">
      <div class="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#131313] rounded-t-xl">
        <div class="flex items-center gap-3">
          <span class="w-1 h-6 bg-accent-emerald-light rounded"></span>
          <h3 class="text-lg font-light tracking-[0.25em]">{{ data.title || 'SELECT PRODUCTS' }}</h3>
        </div>
        <span class="text-[10px] text-gray-400 uppercase tracking-[0.3em] px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono">
          {{ selected().size }} selected
        </span>
      </div>

      <div class="px-6 py-4 border-b border-white/5">
        <div class="relative">
          <lucide-icon [img]="icons.Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"></lucide-icon>
          <input type="text"
                 [(ngModel)]="query"
                 (ngModelChange)="search$.next($event)"
                 placeholder="Search products by name..."
                 class="w-full bg-charcoal border border-white/10 rounded p-3 pl-10 text-sm focus:ring-2 focus:ring-accent-emerald-light/70 focus:border-transparent placeholder-gray-600" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-[#131313] text-[10px] uppercase tracking-[0.3em] text-gray-500 sticky top-0">
            <tr>
              <th class="px-4 py-3 w-10"></th>
              <th class="px-4 py-3 text-left">Product</th>
              <th class="px-4 py-3 text-left hidden sm:table-cell">Handle</th>
              <th class="px-4 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading()">
              <td colspan="4" class="px-4 py-8 text-center text-gray-500 italic">Loading…</td>
            </tr>
            <tr *ngIf="!loading() && products().length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-gray-500 italic">No products found.</td>
            </tr>
            <tr *ngFor="let p of products()"
                (click)="toggle(p)"
                [class]="'border-t border-white/5 cursor-pointer transition-colors ' +
                         (isSelected(p) ? 'bg-white/[0.06] hover:bg-white/[0.08]' : 'hover:bg-white/[0.03]')">
              <td class="px-4 py-2">
                <input *ngIf="data.mode === 'multi'" type="checkbox"
                       [checked]="isSelected(p)" (click)="$event.stopPropagation(); toggle(p)"
                       class="accent-accent-emerald-light w-4 h-4" />
                <input *ngIf="data.mode === 'single'" type="radio" name="picker-row"
                       [checked]="isSelected(p)" (click)="$event.stopPropagation(); toggle(p)"
                       class="accent-accent-emerald-light w-4 h-4" />
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-3">
                  <img *ngIf="p.images?.[0]?.url as src; else noImg"
                       [src]="src" [alt]="p.name"
                       class="w-10 h-10 object-cover rounded border border-white/10" />
                  <ng-template #noImg>
                    <span class="w-10 h-10 rounded border border-white/10 bg-charcoal"></span>
                  </ng-template>
                  <span class="text-silver">{{ p.name }}</span>
                </div>
              </td>
              <td class="px-4 py-2 text-gray-500 font-mono text-xs hidden sm:table-cell">{{ p.shopifyHandle }}</td>
              <td class="px-4 py-2 text-right text-gray-300">{{ (p.priceCents / 100) | currency }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span class="font-mono">{{ rangeLabel() }}</span>
        <div class="flex gap-2">
          <button type="button" (click)="prevPage()" [disabled]="skip() === 0"
                  class="flex items-center gap-1 px-3 py-1 border border-white/10 rounded hover:bg-white/5 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <lucide-icon [img]="icons.ChevronLeft" class="w-3.5 h-3.5"></lucide-icon> Prev
          </button>
          <button type="button" (click)="nextPage()" [disabled]="skip() + take >= total()"
                  class="flex items-center gap-1 px-3 py-1 border border-white/10 rounded hover:bg-white/5 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Next <lucide-icon [img]="icons.ChevronRight" class="w-3.5 h-3.5"></lucide-icon>
          </button>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-[#131313] rounded-b-xl">
        <button type="button" (click)="cancel()"
                class="px-5 py-2 text-sm uppercase tracking-[0.25em] text-gray-400 hover:text-silver transition-colors">Cancel</button>
        <button type="button" (click)="confirm()"
                class="flex items-center gap-2 bg-gradient-to-r from-accent-emerald-glow to-accent-emerald hover:from-accent-emerald-light hover:to-accent-emerald-glow border border-accent-emerald-light/30 text-silver px-6 py-2 rounded text-sm uppercase tracking-[0.25em] shadow-lg shadow-black/40 transition-all">
          <lucide-icon [img]="icons.Check" class="w-4 h-4"></lucide-icon>
          Confirm
        </button>
      </div>
    </div>
  `
})
export class ProductPickerDialogComponent implements OnInit, OnDestroy {
  data: ProductPickerData = inject(DIALOG_DATA);
  private dialogRef = inject(DialogRef<string[] | null>);
  private productSvc = inject(ProductService);

  readonly icons = { Search, ChevronLeft, ChevronRight, Check };
  query = '';
  search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  readonly take = 20;
  skip = signal(0);
  total = signal(0);
  products = signal<Product[]>([]);
  loading = signal(false);
  selected = signal<Set<string>>(new Set(this.data.initiallySelected ?? []));

  rangeLabel = computed(() => {
    const from = this.products().length ? this.skip() + 1 : 0;
    const to = this.skip() + this.products().length;
    return `${from}-${to} of ${this.total()}`;
  });

  ngOnInit() {
    this.search$.pipe(
      debounceTime(250),
      switchMap(q => {
        this.skip.set(0);
        this.loading.set(true);
        return q.trim()
          ? this.productSvc.searchProducts(q.trim(), 0, this.take)
          : this.productSvc.getProducts(0, this.take);
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => this.applyPage(res));

    this.fetchPage();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchPage() {
    this.loading.set(true);
    const q = this.query.trim();
    const req = q
      ? this.productSvc.searchProducts(q, this.skip(), this.take)
      : this.productSvc.getProducts(this.skip(), this.take);
    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: res => this.applyPage(res),
      error: () => { this.loading.set(false); this.products.set([]); }
    });
  }

  private applyPage(res: PaginatedResponse<Product>) {
    this.products.set(res.products);
    this.total.set(res.total);
    this.loading.set(false);
  }

  isSelected(p: Product) {
    return !!p.shopifyHandle && this.selected().has(p.shopifyHandle);
  }

  toggle(p: Product) {
    if (!p.shopifyHandle) return;
    const next = new Set(this.selected());
    if (this.data.mode === 'single') {
      next.clear();
      next.add(p.shopifyHandle);
    } else {
      if (next.has(p.shopifyHandle)) next.delete(p.shopifyHandle);
      else next.add(p.shopifyHandle);
    }
    this.selected.set(next);
  }

  prevPage() {
    this.skip.set(Math.max(0, this.skip() - this.take));
    this.fetchPage();
  }

  nextPage() {
    this.skip.set(this.skip() + this.take);
    this.fetchPage();
  }

  confirm() {
    this.dialogRef.close(Array.from(this.selected()));
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
