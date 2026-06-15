import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { LucideAngularModule, Star, Sparkles, Library, Plus, Settings2, RefreshCw, Save, Check, AlertCircle, Loader2, DollarSign, Database } from 'lucide-angular';
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
type SyncMode = 'full' | 'delta';
type SyncState = 'idle' | 'running' | 'success' | 'partial' | 'failed';

interface SyncResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
  duration: number;
}

interface SyncStatusSnapshot {
  state: SyncState;
  mode: SyncMode | null;
  startedAt: string | null;
  completedAt: string | null;
  lastResult: { status: string; duration: number; syncResult: SyncResult } | null;
}

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
export class AdminConfigComponent implements OnInit, OnDestroy {
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

  // --- Sync ---
  syncStatus = signal<SyncStatusSnapshot | null>(null);
  syncBusy = signal<boolean>(false);
  private syncPoller: ReturnType<typeof setInterval> | null = null;

  readonly icons = { Star, Sparkles, Library, Plus, Settings2, RefreshCw, Save, Check, AlertCircle, Loader2, DollarSign, Database };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.adminKey = localStorage.getItem(ADMIN_KEY_STORAGE) ?? '';
    }
    this.loadCurrentConfig();
    // Reflejar una sync que ya esté corriendo (p.ej. tras recargar la página).
    this.refreshSyncStatus(true);
  }

  ngOnDestroy() {
    this.stopPolling();
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

  // --- Sync ---
  private authHeaders(): HttpHeaders {
    return new HttpHeaders().set('x-admin-key', this.adminKey);
  }

  /** Dispara una sync (full o delta) y empieza a hacer polling del estado. */
  triggerSync(mode: SyncMode) {
    if (!this.adminKey) {
      this.statusMessage.set({ text: 'Admin Key is required to run a sync.', type: 'error' });
      return;
    }
    if (this.syncBusy() || this.syncStatus()?.state === 'running') {
      return;
    }
    if (mode === 'full' &&
        !confirm('Run a FULL sync? This re-fetches the entire catalog and can take several minutes.')) {
      return;
    }

    this.syncBusy.set(true);
    this.statusMessage.set({ text: `Starting ${mode} sync...`, type: 'loading' });

    this.http.post(`${environment.apiUrl}/admin/sync?mode=${mode}`, {}, { headers: this.authHeaders() })
      .subscribe({
        next: () => {
          this.statusMessage.set({ text: `${mode === 'full' ? 'Full' : 'Delta'} sync started.`, type: 'loading' });
          this.startPolling();
        },
        error: (err) => {
          this.syncBusy.set(false);
          if (err.status === 409) {
            // Ya hay una sync corriendo: simplemente seguimos su progreso.
            this.statusMessage.set({ text: 'A sync is already running.', type: 'loading' });
            this.startPolling();
            return;
          }
          this.handleSyncAuthError(err) || this.statusMessage.set({
            text: `Sync failed to start (${err.status ?? 'no status'}): ${this.errMsg(err)}`,
            type: 'error'
          });
          setTimeout(() => this.statusMessage.set({ text: '', type: null }), 6000);
        }
      });
  }

  private startPolling() {
    this.stopPolling();
    this.syncPoller = setInterval(() => this.refreshSyncStatus(), 3000);
  }

  private stopPolling() {
    if (this.syncPoller) {
      clearInterval(this.syncPoller);
      this.syncPoller = null;
    }
  }

  /** Consulta el estado de la sync. `silent` evita pisar el toast en la carga inicial. */
  refreshSyncStatus(silent = false) {
    if (!this.adminKey) return;

    this.http.get<SyncStatusSnapshot>(`${environment.apiUrl}/admin/sync/status`, { headers: this.authHeaders() })
      .subscribe({
        next: (snap) => {
          this.syncStatus.set(snap);

          if (snap.state === 'running') {
            this.syncBusy.set(true);
            if (this.syncPoller === null) this.startPolling(); // p.ej. al recargar la página
            return;
          }

          // Estado terminal: paramos el polling.
          this.stopPolling();
          this.syncBusy.set(false);

          if (silent) return;
          const r = snap.lastResult?.syncResult;
          if (snap.state === 'success' && r) {
            this.statusMessage.set({
              text: `Sync complete: ${r.created} created, ${r.updated} updated, ${r.failed} failed.`,
              type: 'success'
            });
          } else if (snap.state === 'partial' && r) {
            this.statusMessage.set({
              text: `Sync finished with issues: ${r.failed} failed of ${r.totalProcessed}.`,
              type: 'error'
            });
          } else if (snap.state === 'failed') {
            this.statusMessage.set({
              text: `Sync failed: ${r?.errors?.[0] ?? 'see server logs'}`,
              type: 'error'
            });
          }
          if (snap.state !== 'idle') {
            setTimeout(() => this.statusMessage.set({ text: '', type: null }), 6000);
          }
        },
        error: (err) => {
          if (!silent) this.handleSyncAuthError(err);
          this.stopPolling();
          this.syncBusy.set(false);
        }
      });
  }

  private errMsg(err: any): string {
    return err?.error?.error || err?.error?.message || err?.message || '';
  }

  /** Limpia la key guardada en 401/403. Devuelve true si lo manejó. */
  private handleSyncAuthError(err: any): boolean {
    if (err.status === 401 || err.status === 403) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(ADMIN_KEY_STORAGE);
      }
      this.statusMessage.set({
        text: `Unauthorized (${err.status}): ${this.errMsg(err) || 'Invalid Admin Key'}`,
        type: 'error'
      });
      return true;
    }
    return false;
  }
}
