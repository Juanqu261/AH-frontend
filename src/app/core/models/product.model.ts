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
    description?: string;
    priceCents: number;
    compareAtPriceCents?: number;
    images: ProductImage[];
    variants?: ProductVariant[];
}
