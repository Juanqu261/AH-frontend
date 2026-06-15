import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { LucideAngularModule, Star, Sparkles, Library, Plus, Settings2, RefreshCw, Save, Check, AlertCircle, Loader2, DollarSign } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { ADMIN_KEY_STORAGE } from '../../core/guards/admin.guard';
import { SiteConfig, CollectionConfig, PricingConfig } from '../../core/models/site-config.model';
import { ProductChipComponent } from './components/product-chip.component';
import { CollectionEditorComponent } from './components/collection-editor.component';
import {
  ProductPickerDialogComponent,
  ProductPickerData
} from './components/product-picker-dialog.component';

type Tab = 'editor' | 'advanced';

const DEFAULT_PRICING: PricingConfig = { usdToCop: 1, currencyCode: 'USD', roundTo: 0 };

const EMPTY_CONFIG: SiteConfig = {
  spottedProduct: '',
  catalogRecommendations: [],
  collections: [],
  pricing: { ...DEFAULT_PRICING }
};

/** Coerces any partial/legacy config into a complete pricing block. */
function normalizePricing(pricing?: Partial<PricingConfig>): PricingConfig {
  return {
    usdToCop: pricing?.usdToCop && pricing.usdToCop > 0 ? pricing.usdToCop : DEFAULT_PRICING.usdToCop,
    currencyCode: pricing?.currencyCode || DEFAULT_PRICING.currencyCode,
    roundTo: pricing?.roundTo && pricing.roundTo > 0 ? pricing.roundTo : DEFAULT_PRICING.roundTo,
  };
}

@Component({
  selector: 'app-admin-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ProductChipComponent,
    CollectionEditorComponent
  ],
  templateUrl: './admin-config.component.html',
  styleUrls: ['./admin-config.component.css'],
  standalone: true
})
export class AdminConfigComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(Dialog);

  config = signal<SiteConfig>({ ...EMPTY_CONFIG });
  configJson = signal<string>('');
  jsonError = signal<string>('');

  adminKey = '';
  statusMessage = signal<{ text: string; type: 'success' | 'error' | 'loading' | null }>({ text: '', type: null });

  activeTab = signal<Tab>('editor');
  lastAddedIndex = signal<number>(-1);

  readonly icons = { Star, Sparkles, Library, Plus, Settings2, RefreshCw, Save, Check, AlertCircle, Loader2, DollarSign };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.adminKey = localStorage.getItem(ADMIN_KEY_STORAGE) ?? '';
    }
    this.loadCurrentConfig();
  }

  loadCurrentConfig() {
    this.statusMessage.set({ text: 'Loading current config...', type: 'loading' });
    this.http.get<SiteConfig>(`${environment.apiUrl}/config`).subscribe({
      next: (cfg) => {
        const normalized: SiteConfig = {
          spottedProduct: cfg?.spottedProduct ?? '',
          catalogRecommendations: cfg?.catalogRecommendations ?? [],
          collections: cfg?.collections ?? [],
          pricing: normalizePricing(cfg?.pricing)
        };
        this.config.set(normalized);
        this.configJson.set(JSON.stringify(normalized, null, 2));
        this.statusMessage.set({ text: '', type: null });
      },
      error: (err) => {
        console.error('Error fetching config', err);
        this.statusMessage.set({ text: 'Failed to load configuration.', type: 'error' });
      }
    });
  }

  switchTab(tab: Tab) {
    if (tab === this.activeTab()) return;

    if (this.activeTab() === 'advanced' && tab === 'editor') {
      // Parse JSON back into structured config
      try {
        const parsed = JSON.parse(this.configJson()) as SiteConfig;
        this.config.set({
          spottedProduct: parsed.spottedProduct ?? '',
          catalogRecommendations: parsed.catalogRecommendations ?? [],
          collections: parsed.collections ?? [],
          pricing: normalizePricing(parsed.pricing)
        });
        this.jsonError.set('');
      } catch (e: any) {
        this.jsonError.set('Invalid JSON: ' + (e?.message ?? 'parse error'));
        return; // stay on advanced
      }
    }

    if (this.activeTab() === 'editor' && tab === 'advanced') {
      this.configJson.set(JSON.stringify(this.config(), null, 2));
      this.jsonError.set('');
    }

    this.activeTab.set(tab);
  }

  // --- Pricing / currency ---
  get pricing(): PricingConfig {
    return this.config().pricing ?? { ...DEFAULT_PRICING };
  }

  updatePricing(patch: Partial<PricingConfig>) {
    this.config.update(c => ({
      ...c,
      pricing: { ...normalizePricing(c.pricing), ...patch }
    }));
  }

  /** Sample of how a $25.00 USD product would render with the current settings. */
  pricePreview = computed<string>(() => {
    const p = normalizePricing(this.config().pricing);
    const amount = 25 * p.usdToCop;
    const rounded = p.roundTo > 0 ? Math.round(amount / p.roundTo) * p.roundTo : amount;
    const isCop = p.currencyCode.toUpperCase() === 'COP';
    try {
      return new Intl.NumberFormat(isCop ? 'es-CO' : 'en-US', {
        style: 'currency',
        currency: p.currencyCode,
        minimumFractionDigits: isCop ? 0 : 2,
        maximumFractionDigits: isCop ? 0 : 2,
      }).format(rounded);
    } catch {
      return `${rounded} ${p.currencyCode}`;
    }
  });

  // --- Spotted product ---
  openSpottedPicker() {
    const current = this.config().spottedProduct;
    const ref = this.dialog.open<string[] | null, ProductPickerData>(ProductPickerDialogComponent, {
      data: {
        mode: 'single',
        initiallySelected: current ? [current] : [],
        title: 'SPOTTED PRODUCT'
      },
      hasBackdrop: true,
      backdropClass: 'bg-black/70',
      panelClass: 'outline-none'
    });
    ref.closed.subscribe(result => {
      if (result) {
        this.config.update(c => ({ ...c, spottedProduct: result[0] ?? '' }));
      }
    });
  }

  clearSpotted() {
    this.config.update(c => ({ ...c, spottedProduct: '' }));
  }

  // --- Recommendations ---
  openRecommendationsPicker() {
    const current = this.config().catalogRecommendations;
    const ref = this.dialog.open<string[] | null, ProductPickerData>(ProductPickerDialogComponent, {
      data: {
        mode: 'multi',
        initiallySelected: [...current],
        title: 'CATALOG RECOMMENDATIONS'
      },
      hasBackdrop: true,
      backdropClass: 'bg-black/70',
      panelClass: 'outline-none'
    });
    ref.closed.subscribe(result => {
      if (result) {
        this.config.update(c => ({ ...c, catalogRecommendations: result }));
      }
    });
  }

  removeRecommendation(handle: string) {
    this.config.update(c => ({
      ...c,
      catalogRecommendations: c.catalogRecommendations.filter(h => h !== handle)
    }));
  }

  // --- Collections ---
  addCollection() {
    const next: CollectionConfig = { slug: '', name: 'New collection', description: '', products: [] };
    this.config.update(c => ({ ...c, collections: [...c.collections, next] }));
    this.lastAddedIndex.set(this.config().collections.length - 1);
  }

  removeCollection(idx: number) {
    this.config.update(c => ({
      ...c,
      collections: c.collections.filter((_, i) => i !== idx)
    }));
  }

  trackByIndex(i: number) { return i; }
  trackByHandle(_: number, h: string) { return h; }

  // --- Save ---
  saveConfig() {
    // If on Advanced tab, re-parse first
    if (this.activeTab() === 'advanced') {
      try {
        const parsed = JSON.parse(this.configJson()) as SiteConfig;
        this.config.set({ ...parsed, pricing: normalizePricing(parsed.pricing) });
        this.jsonError.set('');
      } catch (e: any) {
        this.jsonError.set('Invalid JSON: ' + (e?.message ?? 'parse error'));
        this.statusMessage.set({ text: 'Fix JSON errors before saving.', type: 'error' });
        return;
      }
    }

    if (!this.adminKey) {
      this.statusMessage.set({ text: 'Admin Key is required to save changes.', type: 'error' });
      return;
    }

    this.statusMessage.set({ text: 'Saving...', type: 'loading' });
    const headers = new HttpHeaders().set('x-admin-key', this.adminKey);

    this.http.put(`${environment.apiUrl}/admin/config`, this.config(), { headers }).subscribe({
      next: () => {
        this.statusMessage.set({ text: 'Configuration saved successfully!', type: 'success' });
        this.configJson.set(JSON.stringify(this.config(), null, 2));
        setTimeout(() => this.statusMessage.set({ text: '', type: null }), 3500);
      },
      error: (err) => {
        console.error('Save error:', err);
        const backendMsg = err?.error?.error || err?.error?.message || err?.message || '';
        if (err.status === 401 || err.status === 403) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(ADMIN_KEY_STORAGE);
          }
          this.statusMessage.set({
            text: `Unauthorized (${err.status}): ${backendMsg || 'Invalid Admin Key'}`,
            type: 'error'
          });
        } else {
          this.statusMessage.set({
            text: `Save failed (${err.status ?? 'no status'}): ${backendMsg || 'Check server logs / network tab'}`,
            type: 'error'
          });
        }
        setTimeout(() => this.statusMessage.set({ text: '', type: null }), 6000);
      }
    });
  }
}
