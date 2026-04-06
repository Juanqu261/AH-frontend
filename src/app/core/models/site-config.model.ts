export interface CollectionConfig {
    slug: string;
    name: string;
    description: string;
    products: string[];
}

export interface SiteConfig {
    spottedProduct: string;
    catalogRecommendations: string[];
    collections: CollectionConfig[];
}
