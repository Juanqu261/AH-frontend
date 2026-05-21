import { Product } from '../models/product.model';
import { Lang } from './strings';

export interface LocalizedProductView {
    name: string;
    description?: string;
    notes?: {
        top?: string;
        heart?: string;
        base?: string;
    };
}

/**
 * Picks the right language-specific fields off a Product.
 * Falls back to the English source if the Spanish translation is missing,
 * so the UI never renders empty when a single product hasn't been translated.
 */
export function localizedProduct(p: Product, lang: Lang): LocalizedProductView {
    if (lang === 'en') {
        return {
            name: p.name,
            description: p.description,
            notes: p.principalNotes,
        };
    }
    return {
        name: p.nameEs ?? p.name,
        description: p.descriptionEs ?? p.description,
        notes: p.principalNotesEs ?? p.principalNotes,
    };
}
