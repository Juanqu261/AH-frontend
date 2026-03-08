import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

import { gsap } from 'gsap';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);

  product: Product | null = null;
  isLoading = true;

  // Create a naive shopify handle based on product name
  shopifyBaseUrl = environment.shopifyBaseUrl;
  shopifyHandle = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const nameSlug = params.get('name');
      if (nameSlug) {
        const searchQuery = nameSlug.replace(/-/g, ' ');

        this.productService.searchProducts(searchQuery, 0, 1).subscribe({
          next: (response: any) => {
            if (response.products && response.products.length > 0) {
              this.product = response.products[0];
              this.shopifyHandle = nameSlug;
              this.isLoading = false;

              if (isPlatformBrowser(this.platformId)) {
                setTimeout(() => {
                  this.initEntranceAnimation();
                }, 50);
              }
            } else {
              this.isLoading = false;
            }
          },
          error: (err) => {
            console.error("Product search failed", err);
            this.isLoading = false;
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    // Handled in subscription callback to ensure DOM is ready
  }

  private initEntranceAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. The Sticky Image softly scales down and fades in
    tl.fromTo('.gsap-pdp-image',
      { scale: 1.05, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5 }
    )
      // 2. The Title & Price slide up
      .fromTo('.gsap-pdp-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
        "-=1.0"
      )
      // 3. The Details/Notes fade in
      .fromTo('.gsap-pdp-details',
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.5"
      )
      // 4. The External Action Button slides up
      .fromTo('.gsap-pdp-action',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      );
  }

  getOutboundUrl(): string {
    return `${this.shopifyBaseUrl}${this.shopifyHandle}`;
  }
}
