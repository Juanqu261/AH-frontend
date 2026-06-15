import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteConfig, CollectionConfig, PricingConfig } from '../models/site-config.model';
import { environment } from '../../../environments/environment';

const MAX_CATALOG_RECOMMENDATIONS = 10;

const DEFAULT_PRICING: PricingConfig = { usdToCop: 1, currencyCode: 'USD', roundTo: 0 };

@Injectable({
    providedIn: 'root'
})
export class SiteConfigService {
    private http = inject(HttpClient);
    private configSignal = signal<SiteConfig | null>(null);
    private loaded = false;

    readonly config = this.configSignal.asReadonly();

    readonly collections = computed<CollectionConfig[]>(() => {
        return this.configSignal()?.collections ?? [];
    });

    readonly spottedProductSlug = computed<string | null>(() => {
        return this.configSignal()?.spottedProduct ?? null;
    });

    readonly catalogRecommendationSlugs = computed<string[]>(() => {
        const slugs = this.configSignal()?.catalogRecommendations ?? [];
        return slugs.slice(0, MAX_CATALOG_RECOMMENDATIONS);
    });

    /** Normalized pricing settings with safe fallbacks (defaults to raw USD). */
    readonly pricing = computed<PricingConfig>(() => {
        const p = this.configSignal()?.pricing;
        return {
            usdToCop: p?.usdToCop && p.usdToCop > 0 ? p.usdToCop : DEFAULT_PRICING.usdToCop,
            currencyCode: p?.currencyCode || DEFAULT_PRICING.currencyCode,
            roundTo: p?.roundTo && p.roundTo > 0 ? p.roundTo : DEFAULT_PRICING.roundTo,
        };
    });

    loadConfig(): Promise<SiteConfig> {
        if (this.loaded && this.configSignal()) {
            return Promise.resolve(this.configSignal()!);
        }

        return new Promise((resolve, reject) => {
            this.http.get<SiteConfig>(`${environment.apiUrl}/config`).subscribe({
                next: (config) => {
                    this.configSignal.set(config);
                    this.loaded = true;
                    resolve(config);
                },
                error: (err) => {
                    console.error('Failed to load site config from API, trying local file as fallback', err);
                    // Fallback to static file if API is unreachable (e.g. backend down)
                    this.http.get<SiteConfig>('site.config.json').subscribe({
                       next: (localConfig) => {
                           this.configSignal.set(localConfig);
                           resolve(localConfig);
                       },
                       error: (fallbackErr) => reject(fallbackErr)
                    });
                }
            });
        });
    }

    getCollectionBySlug(slug: string): CollectionConfig | undefined {
        return this.collections().find(c => c.slug === slug);
    }
}
