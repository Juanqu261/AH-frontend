import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslatePipe } from '../../../core/i18n/t.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, CommonModule, TranslatePipe],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  public locale = inject(LocaleService);

  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
