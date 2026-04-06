import { Component, AfterViewInit, inject, PLATFORM_ID, signal, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteConfigService } from '../../core/services/site-config.service';
import { ProductService } from '../../core/services/product.service';
import { Product, PaginatedResponse } from '../../core/models/product.model';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private siteConfigService = inject(SiteConfigService);
  private productService = inject(ProductService);

  spottedProduct = signal<Product | null>(null);
  heroLoaded = signal(false);

  ngOnInit() {
    this.siteConfigService.loadConfig().then(() => {
      const slug = this.siteConfigService.spottedProductSlug();
      if (!slug) {
        this.heroLoaded.set(true);
        return;
      }

      this.productService.getProducts(0, 100).subscribe({
        next: (response: PaginatedResponse<Product>) => {
          const matched = response.products.find(p =>
            this.formatNameForUrl(p.name) === slug
          );
          if (matched) {
            this.spottedProduct.set(matched);
          }
          this.heroLoaded.set(true);

          // Run hero animations after Angular renders the @if block
          if (matched && isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.initHeroAnimations(), 50);
          }
        },
        error: () => {
          this.heroLoaded.set(true);
        }
      });
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  private initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (document.querySelector('.gsap-hero-title')) {
      tl.fromTo('.gsap-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2 }
      );
    }
    if (document.querySelector('.gsap-hero-cta')) {
      tl.fromTo('.gsap-hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.8"
      );
    }
    if (document.querySelector('.gsap-hero-image')) {
      tl.fromTo('.gsap-hero-image',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' },
        "-=1.2"
      );
    }
  }

  private initScrollAnimations() {
    const journalItems = gsap.utils.toArray('.gsap-journal-item');
    journalItems.forEach((item: any) => {
      gsap.fromTo(item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
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
