import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SiteConfigService } from '../services/site-config.service';

/**
 * Formats a raw USD `priceCents` value for display, applying the site's
 * configured currency conversion (e.g. USD → COP).
 *
 * Products are stored in raw USD cents from Shopify; the admin can configure a
 * single manual rate (`usdToCop`), a display `currencyCode`, and a `roundTo`
 * step via the admin dashboard. With the default config (rate 1, USD) prices
 * are shown unchanged in USD.
 *
 * Marked impure because the site config loads asynchronously after bootstrap:
 * the pipe must re-evaluate once the rate arrives. Price lists are small, so the
 * per-change-detection cost is negligible.
 */
@Pipe({ name: 'displayPrice', standalone: true, pure: false })
export class DisplayPricePipe implements PipeTransform {
    private siteConfig = inject(SiteConfigService);
    // Locale is supplied per-call below; the constructor locale is just a base.
    private currency = new CurrencyPipe('en-US');

    transform(priceCents: number | null | undefined): string {
        if (priceCents == null || isNaN(priceCents)) return '';

        const { usdToCop, currencyCode, roundTo } = this.siteConfig.pricing();

        let amount = (priceCents / 100) * usdToCop;
        if (roundTo > 0) {
            amount = Math.round(amount / roundTo) * roundTo;
        }

        const isCop = currencyCode.toUpperCase() === 'COP';
        const locale = isCop ? 'es-CO' : 'en-US';
        const digitsInfo = isCop ? '1.0-0' : '1.2-2';

        return this.currency.transform(amount, currencyCode, 'symbol', digitsInfo, locale) ?? '';
    }
}
