# Adagioz & Harmonie Frontend

This is the Angular 19 frontend application for the Adagioz & Harmonie luxury fragrance catalog. It serves as an ultra-premium, editorial-style showcase designed to capture the essence of a high-end reseller boutique.

## Architectural & Style Election

The design direction follows the **"Flacon Brut" (Modern Avant-Garde)** concept to evoke an exclusive luxury feel. 
Key design pillars include:

*   **Color Protocol (60-30-10 Dark Mode)**:
    *   **60% Charcoal Foundation**: `#121212` / `#1A1A1A` for deep, mysterious backgrounds.
    *   **30% Deep Purple**: `#2B1B3D` for subtle, abstract organic shapes and visual depth.
    *   **10% Brushed Silver**: `#E5E4E2` for sharp, architectural text styling and structural accents.
*   **Typography**: A mix of *Cormorant Garamond* (massive, italicized headers) and *Outfit* (clean, legible body copy).
*   **Animations**: Powered by **GSAP** (GreenSock) and ScrollTrigger to deliver slow, elegant cinematic fade-ins and staggered scroll reveals.
*   **Styling**: Customized raw CSS paired with Tailwind CSS utilities.

## Core Features & Components

This application operates strictly under a **"Catalog Mode"** business rule. Direct sales are not handled natively; instead, users are seamlessly funneled to official external boutique endpoints via safe, SEO-friendly routing (`/products/:name`).

Important modules include:

*   **`HomeComponent`**: A dedicated landing page focusing purely on brand presentation ("Uncompromising Sourcing", "Curated Excellence"), introducing the user to the aesthetic.
*   **`CollectionListComponent`**: The main catalog gallery, featuring an asymmetrical, staggered masonry layout for fragrance discovery.
*   **`ProductDetailComponent` (PDP)**: A deep-dive experience utilizing an "Extreme Tension" layout. The flacon image is pinned to the screen while editorial copy scrolls. Includes visual representations of the fragrance's distinct Olfactory Structure (Top, Heart, and Base notes).
*   **`NavbarComponent` / `FooterComponent`** *(shared)*: Both are standalone components mounted globally in `app.component.html`, above and below the `<router-outlet>`. They persist across all routes — do **not** add them to individual page templates.

## Key Implementation Decisions

*   **Product routing** uses `/products/:name` (SEO-friendly slugs). The PDP does **not** call a backend search endpoint. Instead, it fetches a batch of products and maps the URL slug to the correct product in-memory via `formatNameForUrl(product.name)`. This is intentional — the backend search had lossy string matching.

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files. Note: The backend API must be running concurrently to serve catalog data.
