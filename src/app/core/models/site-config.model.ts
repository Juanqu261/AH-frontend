export interface CollectionConfig {
    slug: string;
    name: string;
    description: string;
    products: string[];
}

export interface PricingConfig {
    /** Multiplier applied to the raw USD price. 1 USD = `usdToCop` display-currency units. */
    usdToCop: number;
    /** ISO currency code used to format the displayed price (e.g. 'COP', 'USD'). */
    currencyCode: string;
    /** Round the displayed amount to the nearest N (0 = no rounding). */
    roundTo: number;
}

export interface SiteConfig {
    spottedProduct: string;
    catalogRecommendations: string[];
    collections: CollectionConfig[];
    pricing?: PricingConfig;
}
