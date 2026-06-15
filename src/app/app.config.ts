import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { routes } from './app.routes';

// Needed so the currency pipe can format COP with Colombian conventions ($25.000).
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(
            routes,
            withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
            withRouterConfig({ onSameUrlNavigation: 'reload' })
        ),
        provideHttpClient()
    ]
};
