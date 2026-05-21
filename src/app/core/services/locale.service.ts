import { Injectable, signal, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Lang } from '../i18n/strings';

@Injectable({ providedIn: 'root' })
export class LocaleService {
    private router = inject(Router);

    private readonly _lang = signal<Lang>('es');
    readonly lang = this._lang.asReadonly();

    constructor() {
        // Sync immediately with the current URL (covers initial navigation).
        this.syncFromUrl(this.router.url);
        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe((e) => this.syncFromUrl((e as NavigationEnd).urlAfterRedirects));
    }

    private syncFromUrl(url: string) {
        const first = url.split('?')[0].split('/').filter(Boolean)[0];
        this._lang.set(first === 'en' ? 'en' : 'es');
    }

    /**
     * Returns a locale-prefixed path: localized('/catalog') -> '/es/catalog'.
     * Locale-free routes (e.g. /privacy, /admin) should not use this helper.
     */
    localized(path: string): string {
        const clean = path.startsWith('/') ? path : `/${path}`;
        if (clean === '/') return `/${this._lang()}`;
        return `/${this._lang()}${clean}`;
    }

    /**
     * Swaps the first URL segment to `target` (es↔en) while preserving the rest.
     * If the current path has no locale prefix, prepends one.
     */
    switchTo(target: Lang): string {
        const parts = this.router.url.split('?')[0].split('/').filter(Boolean);
        if (parts[0] === 'es' || parts[0] === 'en') {
            parts[0] = target;
        } else {
            parts.unshift(target);
        }
        return '/' + parts.join('/');
    }
}
