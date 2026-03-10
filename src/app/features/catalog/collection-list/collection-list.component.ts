import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteConfigService } from '../../../core/services/site-config.service';
import { ProductService } from '../../../core/services/product.service';
import { CollectionConfig } from '../../../core/models/site-config.model';
import { Product, PaginatedResponse } from '../../../core/models/product.model';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CollectionCard extends CollectionConfig {
  previewImages: string[];
}

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit, AfterViewInit {
  private siteConfigService = inject(SiteConfigService);
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);

  collections = signal<CollectionCard[]>([]);

  ngOnInit() {
    this.siteConfigService.loadConfig().then(() => {
      const configs = this.siteConfigService.collections();

      this.productService.getProducts(0, 100).subscribe({
        next: (response: PaginatedResponse<Product>) => {
          const cards: CollectionCard[] = configs.map(col => {
            const matchedProducts = response.products.filter(p =>
              col.products.includes(this.formatNameForUrl(p.name))
            );
            const previewImages = matchedProducts
              .filter(p => p.images && p.images.length > 0 && p.images[0].url)
              .map(p => p.images[0].url)
              .slice(0, 3);

            return { ...col, previewImages };
          });

          this.collections.set(cards);

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
        }
      });
    });
  }

  ngAfterViewInit() {
    // Animations are deferred to after data loads (see ngOnInit)
  }

  private initScrollAnimations() {
    const cards = gsap.utils.toArray('.gsap-collection-card');
    cards.forEach((card: any) => {
      gsap.fromTo(card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
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
