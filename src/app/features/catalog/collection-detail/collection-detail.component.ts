import { Component, OnInit, inject, PLATFORM_ID, signal, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SiteConfigService } from '../../../core/services/site-config.service';
import { ProductService } from '../../../core/services/product.service';
import { CollectionConfig } from '../../../core/models/site-config.model';
import { Product, PaginatedResponse } from '../../../core/models/product.model';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

@Component({
    selector: 'app-collection-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    providers: [CurrencyPipe],
    templateUrl: './collection-detail.component.html',
    styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit, AfterViewInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private siteConfigService = inject(SiteConfigService);
    private productService = inject(ProductService);
    private platformId = inject(PLATFORM_ID);

    collection = signal<CollectionConfig | null>(null);
    products = signal<Product[]>([]);
    isLoading = signal(true);

    @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (!slug) {
                this.router.navigate(['/collections']);
                return;
            }

            this.siteConfigService.loadConfig().then(() => {
                const collectionConfig = this.siteConfigService.getCollectionBySlug(slug);

                if (!collectionConfig) {
                    this.router.navigate(['/collections']);
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

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            gsap.fromTo('.gsap-header',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
            );
        }
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

    formatNameForUrl(name: string): string {
        if (!name) return '';
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
}
