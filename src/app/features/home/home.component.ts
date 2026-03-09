import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';

import { gsap } from 'gsap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initHeroAnimations();
    }
  }

  private initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.gsap-hero-title',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, stagger: 0.2 }
    )
      .fromTo('.gsap-hero-text',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 },
        "-=1.0"
      )
      .fromTo('.gsap-hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.8"
      )
      .fromTo('.gsap-hero-image',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' },
        "-=1.2"
      );
  }
}
