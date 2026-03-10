# Adagioz & Harmonie Frontend Context

*   **Architecture**: Angular 19 frontend application with a "Flacon Brut" (Modern Avant-Garde) dark mode design system (`#121212` background, `#2B1B3D` purple accents, `#E5E4E2` text).
*   **Business Model**: E-commerce catalog and discovery platform only. Direct sales are not handled natively; users are redirected to official external retailers via affiliate/referral links.
*   **Key Components**: `HomeComponent` (brand presentation + spotted product hero), `CollectionListComponent` (config-driven collection cards), `CollectionDetailComponent` (individual collection product grid), `CatalogComponent` (curated max 10 "open book" showcase), and `ProductDetailComponent` (pinned flacon image with editorial copy and olfactory structure).
*   **Config System**: `public/site.config.json` is the single source of truth for merchandising. It controls the spotted product on the home page, the catalog recommendation list (max 10), and all collection definitions. Adding/removing a collection entry automatically creates/removes the view.
*   **Styling & Animation**: Custom raw CSS with Tailwind CSS utilities. Animations powered by GSAP (GreenSock) and ScrollTrigger for cinematic fade-ins.
