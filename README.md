# AH-Frontend

Angular 19 (standalone components) catalog UI for Adagioz & Harmonie. Editorial styling with Tailwind + raw CSS; cinematic motion via GSAP/ScrollTrigger. Catalog-mode only — outbound links to Shopify, no in-app checkout.

## Modules

```
src/app/
  app.routes.ts            # Standalone routing (home, catalog, collections, PDP, admin)
  app.config.ts            # Providers: router, HttpClient
  core/
    models/                # Product, SiteConfig DTOs
    services/
      product.service.ts   # /api/products wrappers
      site-config.service.ts # Loads /api/config, exposes signals
    guards/
      admin.guard.ts       # Backend-validated /admin/config gate (calls /api/admin/verify)
    utils/
      slug.util.ts         # Shared formatNameForUrl()
  features/
    home/                  # Hero (spotted product) + philosophy + journal sections
    catalog/
      catalog/             # "Open book" curated recommendations view
      collection-list/     # Grid of collection cards
      collection-detail/   # Products inside one collection
      product-detail/      # PDP — pinned image, notes, outbound CTA
    admin-config/          # Site-config JSON editor (admin-only)
    legal/                 # Privacy, ToS
  shared/                  # Navbar, Footer (mounted globally)
```

## Config-driven merchandising

`public/site.config.json` controls all curated lists:
- `spottedProduct` — slug shown on the home hero
- `catalogRecommendations` — slugs for the `/catalog` view
- `collections[]` — `{ slug, name, description, products[] }` for `/collections` and `/collections/:slug`

Slugs must match `formatNameForUrl(product.name)` (or `product.shopifyHandle`). Editing this file at runtime is done via `/admin/config`, which calls `PUT /api/admin/config` on the backend.

## Admin gate

`/admin/config` is protected by `core/guards/admin.guard.ts`:
1. Reads `adagioz_admin_key` from `localStorage`.
2. Calls `GET /api/admin/verify` with that key.
3. On 401 or missing, prompts the user, re-verifies, and stores on success.
4. On verification failure: alerts and redirects to `/`.

The backend's `SYNC_ADMIN_KEY` is the real source of truth; the guard is a thin UX layer over the same key check.

## Run locally

```bash
cd frontend
npm install
npm start                  # ng serve at http://localhost:4200
```

The backend must be running at `http://localhost:3000` — `proxy.conf.json` forwards `/api/*` to it during dev. Production builds go through `npm run build` (Tailwind + Angular AOT) and are served by Nginx (see root `Dockerfile` and `nginx.conf`).

## Tests

```bash
npm test                   # Karma + Jasmine
```

## Security

- **Static analysis**: `npm run lint` runs `@angular-eslint` + `@typescript-eslint` across all `.ts` and `.html` files.
- **Template linting**: `@angular-eslint/template` rules catch unsafe bindings and accessibility issues at build time.
- **Dependency audit**: `npm run audit:check` surfaces high/critical CVEs via `npm audit`.
- Admin route (`/admin/config`) is protected by a backend-verified key guard; no credentials in the bundle.

## Performance

- **Lazy routes**: all feature routes use `loadComponent()` — initial bundle ships only what the first route needs.
- **OnPush change detection**: all components use `ChangeDetectionStrategy.OnPush`; signals trigger updates automatically with zero extra check cycles.
- **Deferred content**: home page Journal section uses `@defer (on viewport)` — rendered only when scrolled into view.
- **Preconnect**: `<link rel="preconnect">` hints in `index.html` for Google Fonts and Cloudinary reduce DNS + TLS handshake time.
- **Audit**: run Lighthouse against `http://localhost:8080` (prod build). Target LCP < 2.5s, CLS < 0.1, TBT < 200ms.
- **Change detection profiling**: Angular DevTools (Chrome extension) → Profiler tab while navigating the catalog.
