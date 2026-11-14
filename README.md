# Omarió — storefront concept

A minimal, editorial perfume storefront, made for client review. Dark olive, antique gold and warm ivory type, Cormorant Garamond with Manrope, campaign photography and restrained motion.

## Run locally

Requires Node.js 20 or later. No dependencies or installation required.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Build static output with `npm run build`; validate with `npm run check`. Rebuild after source changes and refresh the browser. The `dist/` directory can be served by any static web server with directory-index support and `404.html` handling.

## Included

- Storytelling homepage, nine fragrance families/products, 17 size/concentration variant pages, four collection pages and collection index.
- Our story, gifting, fragrance guide with interactive recommendations, house services, FAQ, contact, tracking, delivery, returns, privacy, terms, checkout and 404.
- Search by name/note, collection filtering, product sorting, variant selection, quantities, local shopping bag, removal, subtotal and checkout demonstration.
- Responsive layouts, keyboard focus, native dialogs, reduced-motion support, scroll reveals, progressive scroll-linked editorial image motion and hover transitions.
- Statically rendered page content, unique titles/descriptions, canonical URLs, Open Graph, Twitter card, Product/Organization/Breadcrumb/FAQ structured data and sitemap.

## Frontend boundaries

There is no backend, account system, live payment, order submission, email subscription, contact submission or live order tracking. Forms explicitly explain their preview behavior. Bag state uses browser localStorage; form values are never sent. Prices, details and collection assignments are a review dataset, informed by the public client storefront and requiring client sign-off. Campaign images are generated concepts based on the client photographs and shared between size variants. Size and concentration microprint has been removed from the new campaign portraits to avoid presenting a conflicting format. Obtain approved format-specific photography for launch.

Policies are clearly labeled preview information and require client approval; no new shipping/refund guarantees or legal policies are invented. Public business contacts are retained. The wordmark is a proposed typographic treatment, not a replacement for approved brand assets.

## Source map

- `scripts/catalog.mjs`: fragrance content, pricing, notes, collection assignments and variants.
- `scripts/build.mjs`: page templates, content and metadata; emits 37 static pages.
- `public/styles.css`: design system, responsive layout, motion and reduced-motion fallback.
- `public/app.js`: browser-only shopping and discovery interactions.
- `public/transitions.js`: early native cross-document shared-element transitions and navigation cleanup.
- `public/motion.css`: product journey, desktop image on the right, mobile composition and interaction motion.
- `public/assets/`: client images downloaded from omarioperfumes.com.
- `scripts/serve.mjs`: local static preview server.
- `scripts/check.mjs`: links/assets, unique metadata, single-H1, JSON-LD and catalog validation.

## SEO and launch

The client preview uses `noindex, follow` and blocks crawling in robots.txt. This prevents the mock storefront competing with the current live site. The page content and metadata are ready for search review; indexing stays off until approval.

Only after client approval, `OMARIO_PRODUCTION=1 npm run build` enables indexing and emits production robots.txt. This is a build switch, not a launch/deployment command. Before using that output, confirm the deployment domain, approved copy, pricing, photography, legal policies and live operations. Implement 301 redirects from existing product/category URLs to the new routes, connect production services, and update any structured offers/availability using real commerce data. Social image and canonical URLs currently assume the existing brand domain; adjust `base` in the build script for a different domain.

Fonts are served locally, with their OFL licenses retained in `public/fonts/`. No analytics or tracking scripts are included.

## Verification

Build and structural checks cover all generated routes. `npm test` covers shared image/name/price pairing, duplicate presentations, back navigation, related products, cleanup, missing navigation APIs and reduced-motion behavior. Browser review confirmed the Dubai collection-to-detail journey, the desktop image on the right, the 393 × 852 iPhone preset with image above the details, and the mobile menu. No application errors were shown in the browser console during that review. Complete physical-device and production integration checks before launch.

## Product transitions

Product cards, names and prices share a native View Transition with the product detail page. On desktop the image settles on the right; on mobile it expands into the image area above the details. Back navigation reverses the journey when the matching card is available. Native transitions retain standard links, browser history, modified-click behavior and static SEO. Browsers without cross-document View Transition support use normal navigation. Reduced-motion preferences disable transitions.

Motion is timed at 780 ms on desktop and 650 ms on mobile, with shorter responses for filters, sorting, menus, drawers, buttons and form fields. No animation library or client-side router is required.

## Hero campaign 02

The homepage now opens with a full-width dark olive campaign, golden lighting, an overlaid masthead and a masked two-line headline. The featured Al-Sheikh image, name and price retain shared-element transitions into the product page. The mobile composition moves the photograph below the headline and keeps the featured-fragrance link at the foot of the campaign. Reduced motion disables entrance effects.

The new campaign art was created with the built-in image generation tool using the client’s original Al-Sheikh photograph as its product reference. See `docs/hero-campaign-prompt.md` for the exact prompt, master and optimized asset paths, and production review notes.

## The house theme

The approved hero art direction now continues across every page. `scripts/atelier.mjs` contains the new landing-page and product storytelling chapters; `public/atelier.css` contains the full responsive house theme. The hero header divider and lower decorative rule are removed. All catalog, collection, service, policy, form, bag and checkout surfaces use the same palette.

Eight new campaign portraits were created with the built-in image generation tool, using each client bottle as an identity reference. Final JPEGs are in `public/assets/campaign/`; full prompts and correction prompts are retained in `docs/campaign-portraits.json`. Original photographs and generation masters are preserved. Generation masters are excluded from the built static site. These images are concept assets for client review, requiring packaging/label fidelity approval before production.
