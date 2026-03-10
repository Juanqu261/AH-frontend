import { Component, OnInit, inject, PLATFORM_ID, ViewChildren, QueryList, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteConfigService } from '../../../core/services/site-config.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, PaginatedResponse } from '../../../core/models/product.model';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule, RouterModule],
    providers: [CurrencyPipe],
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, AfterViewInit {
    private siteConfigService = inject(SiteConfigService);
    private productService = inject(ProductService);
    private platformId = inject(PLATFORM_ID);

    products = signal<Product[]>([]);

    @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

    ngOnInit() {
        this.siteConfigService.loadConfig().then(() => {
            const recommendedSlugs = this.siteConfigService.catalogRecommendationSlugs();

            this.productService.getProducts(0, 100).subscribe({
                next: (response: PaginatedResponse<Product>) => {
                    // Filter and preserve the order from the JSON config
                    const filtered = recommendedSlugs
                        .map(slug => response.products.find(p => this.formatNameForUrl(p.name) === slug))
                        .filter((p): p is Product => !!p);

                    this.products.set(filtered);

                    if (isPlatformBrowser(this.platformId)) {
                        setTimeout(() => {
                            ScrollTrigger.refresh();
                            this.initScrollAnimations();
                        }, 100);
                    }
                }
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
