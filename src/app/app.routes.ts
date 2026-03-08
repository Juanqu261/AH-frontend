import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CollectionListComponent } from './features/catalog/collection-list/collection-list.component';
import { ProductDetailComponent } from './features/catalog/product-detail/product-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'Adagioz & Harmonie' },
    { path: 'collections', component: CollectionListComponent, title: 'Collections | Adagioz & Harmonie' },
    { path: 'catalog', component: CollectionListComponent, title: 'Catalog | Adagioz & Harmonie' },
    { path: 'products/:name', component: ProductDetailComponent, title: 'Product Details | Adagioz & Harmonie' },
    { path: '**', redirectTo: '' }
];
