import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { formatNameForUrl } from '../../../core/utils/slug.util';
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
        this.isLoading = true;

        this.productService.getProductByHandle(nameSlug).subscribe({
          next: (matchedProduct: Product) => {
            this.product = matchedProduct;
            this.shopifyHandle = matchedProduct.shopifyHandle ?? this.formatNameForUrl(matchedProduct.name);
            this.isLoading = false;

            if (isPlatformBrowser(this.platformId)) {
              setTimeout(() => {
                this.initEntranceAnimation();
              }, 50);
            }
          },
          error: (err) => {
            if (err?.status === 404) {
              console.warn(`Product not found for slug: ${nameSlug}`);
            } else {
              console.error("Product fetch failed", err);
            }
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

  formatNameForUrl = formatNameForUrl;
}
