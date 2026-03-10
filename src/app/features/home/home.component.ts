import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
      this.initScrollAnimations();
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

  private initScrollAnimations() {
    const journalItems = gsap.utils.toArray('.gsap-journal-item');
    journalItems.forEach((item: any, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: "top 85%", // Trigger animation when top of element hits 85% of screen height
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }
}
