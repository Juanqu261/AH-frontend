import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

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
