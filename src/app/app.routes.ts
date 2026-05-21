import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CollectionListComponent } from './features/catalog/collection-list/collection-list.component';
import { ProductDetailComponent } from './features/catalog/product-detail/product-detail.component';
import { adminGuard } from './core/guards/admin.guard';
import { langMatchGuard } from './core/guards/lang-match.guard';

const PUBLIC_CHILDREN: Routes = [
    { path: '', component: HomeComponent, title: 'Adagioz & Harmonie' },
    { path: 'collections', component: CollectionListComponent, title: 'Collections | Adagioz & Harmonie' },
    {
        path: 'collections/:slug',
        loadComponent: () =>
            import('./features/catalog/collection-detail/collection-detail.component').then(m => m.CollectionDetailComponent),
        title: 'Collection | Adagioz & Harmonie'
    },
    {
        path: 'catalog',
        loadComponent: () =>
            import('./features/catalog/catalog/catalog.component').then(m => m.CatalogComponent),
        title: 'Catalog | Adagioz & Harmonie'
    },
    { path: 'products/:name', component: ProductDetailComponent, title: 'Product Details | Adagioz & Harmonie' },
];

export const routes: Routes = [
    // Locale-prefixed public catalog routes.
    {
        path: ':lang',
        canMatch: [langMatchGuard],
        children: PUBLIC_CHILDREN,
    },

    // Locale-free pages (single-language for now).
    {
        path: 'privacy',
        loadComponent: () =>
            import('./features/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        title: 'Privacy Policy | Adagioz & Harmonie'
    },
    {
        path: 'terms',
        loadComponent: () =>
            import('./features/legal/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
        title: 'Terms of Service | Adagioz & Harmonie'
    },
    {
        path: 'admin/config',
        canActivate: [adminGuard],
        loadComponent: () =>
            import('./features/admin-config/admin-config.component').then(m => m.AdminConfigComponent),
        title: 'Edit Config | Adagioz & Harmonie'
    },

    // Defaults — bare `/` and anything that didn't match goes to Spanish home.
    { path: '', pathMatch: 'full', redirectTo: '/es' },
    { path: '**', redirectTo: '/es' },
];
