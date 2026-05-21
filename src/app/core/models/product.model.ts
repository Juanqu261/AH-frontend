export interface PaginatedResponse<T> {
    products: T[];
    skip: number;
    take: number;
    total: number;
}

export interface ProductImage {
    cloudinaryUrl: string | null;
    url: string;
}

export interface ProductVariant {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    shopifyHandle?: string;
    description?: string;
    priceCents: number;
    compareAtPriceCents?: number;
    images: ProductImage[];
    variants?: ProductVariant[];
    principalNotes?: {
        top?: string;
        heart?: string;
        base?: string;
    };

    // Spanish translations (populated server-side via Claude — see backend translation.service.ts).
    nameEs?: string;
    descriptionEs?: string;
    principalNotesEs?: {
        top?: string;
        heart?: string;
        base?: string;
    };
}
