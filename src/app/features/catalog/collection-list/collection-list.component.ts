import { Component, OnInit, inject, PLATFORM_ID, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product, PaginatedResponse } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  products: Product[] = [];
  pageTitle = 'The Collection';
  shopifyBaseUrl = environment.shopifyBaseUrl;

  @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

  ngOnInit() {
    this.route.url.subscribe(url => {
      const path = url[0]?.path;
      if (path === 'collections') {
        this.pageTitle = 'Curated Collections';
      } else {
        this.pageTitle = 'The Catalog';
      }
    });

    // Fetch products
    this.productService.getProducts(0, 50).subscribe((response: PaginatedResponse<Product>) => {
      this.products = response.products;

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          ScrollTrigger.refresh();
          this.initScrollAnimations();
        }, 100);
      }
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

    this.productCards.forEach((card, index) => {
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

  // Format the product name to be URL-safe (e.g., 'Obsidian Ash' -> 'obsidian-ash')
  formatNameForUrl(name: string): string {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
}
