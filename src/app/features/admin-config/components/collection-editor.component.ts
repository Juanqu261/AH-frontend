import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { LucideAngularModule, Trash2, Plus, FolderOpen, ChevronDown } from 'lucide-angular';
import { CollectionConfig } from '../../../core/models/site-config.model';
import { ProductChipComponent } from './product-chip.component';
import { ProductPickerDialogComponent, ProductPickerData } from './product-picker-dialog.component';

@Component({
  selector: 'app-collection-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ProductChipComponent],
  template: `
    <div class="relative border border-white/10 rounded-lg bg-[#131313] overflow-hidden transition-all hover:border-white/20">
      <!-- Signature accent stripe -->
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-emerald-light to-accent-emerald-glow"></div>

      <!-- Collapsed/Expanded header (always visible, clickable to toggle) -->
      <button type="button" (click)="toggle()"
              class="w-full text-left pl-6 pr-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-mono shrink-0">
          {{ (index + 1).toString().padStart(2, '0') }}
        </span>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
            <lucide-icon [img]="icons.FolderOpen" class="w-3 h-3"></lucide-icon>
            <span>Collection</span>
            <span class="text-gray-600 font-mono normal-case tracking-normal">· {{ collection.products.length }} product{{ collection.products.length === 1 ? '' : 's' }}</span>
          </div>
          <div class="text-silver text-sm font-light truncate">
            {{ collection.name || collection.slug || 'Untitled collection' }}
          </div>
          <div *ngIf="!expanded() && collection.description" class="text-xs text-gray-500 truncate mt-0.5">
            {{ collection.description }}
          </div>
        </div>

        <lucide-icon [img]="icons.ChevronDown"
                     class="w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200"
                     [class.rotate-180]="expanded()"></lucide-icon>
      </button>

      <!-- Expanded body -->
      <div *ngIf="expanded()" class="pl-6 pr-5 pb-5 space-y-4 border-t border-white/5 pt-4 animate-[slideIn_0.2s_ease-out]">
        <!-- Fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1.5">Slug</label>
            <input type="text" [(ngModel)]="collection.slug"
                   class="w-full bg-charcoal border border-white/10 rounded p-2 text-sm text-silver focus:ring-2 focus:ring-accent-emerald-light/70 focus:border-transparent font-mono" />
          </div>
          <div>
            <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1.5">Name</label>
            <input type="text" [(ngModel)]="collection.name"
                   class="w-full bg-charcoal border border-white/10 rounded p-2 text-sm text-silver focus:ring-2 focus:ring-accent-emerald-light/70 focus:border-transparent" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1.5">Description</label>
            <textarea [(ngModel)]="collection.description" rows="2"
                      class="w-full bg-charcoal border border-white/10 rounded p-2 text-sm text-silver focus:ring-2 focus:ring-accent-emerald-light/70 focus:border-transparent resize-y"></textarea>
          </div>
        </div>

        <!-- Products -->
        <div class="pt-3 border-t border-white/5">
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-[10px] uppercase tracking-[0.25em] text-gray-500">
              Products
              <span class="text-gray-600 font-mono ml-1">{{ collection.products.length }}</span>
            </span>
            <button type="button" (click)="openPicker()"
                    class="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gray-300 hover:text-silver border border-white/10 hover:border-white/30 hover:bg-white/5 rounded px-3 py-1.5 transition-colors">
              <lucide-icon [img]="icons.Plus" class="w-3.5 h-3.5"></lucide-icon>
              Add products
            </button>
          </div>
          <div *ngIf="collection.products.length; else empty" class="flex flex-wrap gap-2">
            <app-product-chip *ngFor="let h of collection.products; trackBy: trackByHandle"
                              [handle]="h" (remove)="removeProduct(h)"></app-product-chip>
          </div>
          <ng-template #empty>
            <p class="text-xs text-gray-600 italic">No products in this collection yet.</p>
          </ng-template>
        </div>

        <!-- Delete (in expanded body so it's never accidentally clicked) -->
        <div class="pt-3 border-t border-white/5 flex justify-end">
          <button type="button" (click)="remove.emit()"
                  class="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-red-300 border border-white/10 hover:border-red-500/50 hover:bg-red-900/20 rounded px-2.5 py-1.5 transition-colors">
            <lucide-icon [img]="icons.Trash2" class="w-3 h-3"></lucide-icon>
            Delete collection
          </button>
        </div>
      </div>
    </div>
  `
})
export class CollectionEditorComponent implements OnInit {
  @Input() collection!: CollectionConfig;
  @Input() index = 0;
  @Input() initiallyExpanded = false;
  @Output() remove = new EventEmitter<void>();

  readonly icons = { Trash2, Plus, FolderOpen, ChevronDown };
  expanded = signal(false);
  private dialog = inject(Dialog);

  ngOnInit() {
    this.expanded.set(this.initiallyExpanded);
  }

  toggle() {
    this.expanded.update(v => !v);
  }

  trackByHandle = (_: number, h: string) => h;

  removeProduct(handle: string) {
    this.collection.products = this.collection.products.filter(h => h !== handle);
  }

  openPicker() {
    const ref = this.dialog.open<string[] | null, ProductPickerData>(ProductPickerDialogComponent, {
      data: {
        mode: 'multi',
        initiallySelected: [...this.collection.products],
        title: `PRODUCTS · ${this.collection.name || this.collection.slug || 'Collection'}`
      },
      hasBackdrop: true,
      backdropClass: 'bg-black/70',
      panelClass: 'outline-none'
    });
    ref.closed.subscribe(result => {
      if (result) this.collection.products = result;
    });
  }
}
