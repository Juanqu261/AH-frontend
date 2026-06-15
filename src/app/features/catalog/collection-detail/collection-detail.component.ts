import { Component, ChangeDetectionStrategy, OnInit, inject, PLATFORM_ID, signal, computed, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SiteConfigService } from '../../../core/services/site-config.service';
import { DisplayPricePipe } from '../../../core/pipes/display-price.pipe';
import { ProductService } from '../../../core/services/product.service';
import { CollectionConfig } from '../../../core/models/site-config.model';
import { Product, PaginatedResponse } from '../../../core/models/product.model';
import { formatNameForUrl } from '../../../core/utils/slug.util';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslatePipe } from '../../../core/i18n/t.pipe';
import { localizedProduct } from '../../../core/i18n/product-locale';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

@Component({
    selector: 'app-collection-detail',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, TranslatePipe, DisplayPricePipe],
    templateUrl: './collection-detail.component.html',
    styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private siteConfigService = inject(SiteConfigService);
    private productService = inject(ProductService);
    private platformId = inject(PLATFORM_ID);
    public locale = inject(LocaleService);

    collection = signal<CollectionConfig | null>(null);
    products = signal<Product[]>([]);
    isLoading = signal(true);

    productViews = computed(() =>
        this.products().map(p => ({ raw: p, view: localizedProduct(p, this.locale.lang()) }))
    );

    @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (!slug) {
                this.router.navigateByUrl(this.locale.localized('/collections'));
                return;
            }

            this.siteConfigService.loadConfig().then(() => {
                const collectionConfig = this.siteConfigService.getCollectionBySlug(slug);

                if (!collectionConfig) {
                    this.router.navigateByUrl(this.locale.localized('/collections'));
                    return;
                }

                this.collection.set(collectionConfig);

                this.productService.getProducts(0, 100).subscribe({
                    next: (response: PaginatedResponse<Product>) => {
                        const filtered = response.products.filter(p =>
                            collectionConfig.products.includes(this.formatNameForUrl(p.name))
                        );
                        this.products.set(filtered);
                        this.isLoading.set(false);

                        if (isPlatformBrowser(this.platformId)) {
                            setTimeout(() => {
                                if (document.querySelector('.gsap-header')) {
                                    gsap.fromTo('.gsap-header',
                                        { y: 30, opacity: 0 },
                                        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
                                    );
                                }
                                ScrollTrigger.refresh();
                                this.initScrollAnimations();
                            }, 100);
                        }
                    },
                    error: () => {
                        this.isLoading.set(false);
                    }
                });
            });
        });
    }

    private initScrollAnimations() {
        if (!this.productCards || this.productCards.length === 0) return;

        this.productCards.forEach((card) => {
            gsap.fromTo(card.nativeElement,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: card.nativeElement,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }

    formatNameForUrl = formatNameForUrl;
}
