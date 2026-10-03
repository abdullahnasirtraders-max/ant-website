# ANT — Abdullah Nasir Traders

MERN e-commerce for air filters (buses, vehicles, industrial). Pakistan only, PKR.
Luxury-minimal storefront (Poppins, warm neutrals, hairline borders), COD checkout, admin dashboard. No animation libraries.

> **Status:** this code was written without the ability to install packages or run a browser, so it has **not been executed yet**. Expect a short first-run shake-down (typos, version quirks). The Playwright suite is included precisely to find them: see *Verify it* below.

```
ant-store/
├─ client/   React + Vite + TypeScript + Tailwind (Vercel)
├─ server/   Express + Mongoose API (Railway)
├─ e2e/      Playwright specs      playwright.config.ts
└─ package.json   root scripts (dev, seed, test:e2e)
```

## Run locally

Requirements: Node 20+, a MongoDB URI (Atlas free tier or local).

```bash
npm run install:all                 # root + server + client
cp server/.env.example server/.env  # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cp client/.env.example client/.env  # optional, leave empty in dev
npm run seed                        # creates admin user, settings, 6 placeholder products
npm run dev                         # API :5000, site :5173
```

Open http://localhost:5173 · admin at http://localhost:5173/admin (the credentials from `server/.env`).

## Verify it

```bash
npm run test:e2e:install   # once: downloads Chromium
npm run test:e2e           # desktop + mobile; screenshots land in e2e/screenshots/
```
Covers: homepage (sections, console errors, horizontal overflow), filter finder, navigation, products → detail → cart (add/qty/remove/persistence) → COD checkout, server-side price enforcement, admin login, product create/edit/deactivate/delete, delivery fee, announcements, order status and order deletion. Use a **separate test database** (it creates and deletes records). Then open the screenshots and check the look against your design.

## Environment variables

`server/.env`

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string (include db name) |
| `JWT_SECRET` | 32+ random chars (required in production) |
| `CLIENT_ORIGIN` | Comma-separated allowed browser origins (your Vercel URL) |
| `SITE_URL` | Public site URL (sitemap) |
| `COOKIE_SAMESITE` | `lax` (default; use with the Vercel `/api` proxy) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin, created by `npm run seed` |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Admin image uploads. Without them, admin can paste image URLs |
| `PAYMENT_PROVIDER`, `PAYMENT_MERCHANT_ID`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` | Online payments (see below). Empty = disabled |

`client/.env`: `VITE_API_URL` (leave empty when using the proxy) and `VITE_SITE_URL` (canonical URL for Open Graph tags).

## Deploy

1. **Atlas**: create a cluster, a DB user, allow Railway's egress (or 0.0.0.0/0 with a strong password), copy the URI.
2. **Railway** (service root `server/`): start command `npm start`; set the server env vars above with `NODE_ENV=production`. Run `npm run seed` once (Railway shell) to create the admin and settings.
3. **Vercel** (project root `client/`): framework Vite. Edit `client/vercel.json` and replace `YOUR-RAILWAY-APP.up.railway.app` with your Railway domain. The `/api` rewrite makes the API same-origin for the browser, so the admin cookie is first-party and Safari-safe. Set `VITE_SITE_URL`. Update `client/public/robots.txt` with your domain.
4. Back on Railway set `CLIENT_ORIGIN` and `SITE_URL` to the Vercel URL.
5. Log in at `/admin`, replace placeholder products/images, set delivery fee and contact details in **Settings**.

## Online payments (not connected, by design)

Nothing fakes a payment. Online checkout is disabled until a provider is registered and configured:
1. Copy `server/src/services/payments/template.provider.js` and implement `isConfigured`, `createSession(order)` and `verifyWebhook(req)` for your gateway (PayFast, JazzCash, Easypaisa, etc.), reading the `PAYMENT_*` variables.
2. Register it in `services/payments/index.js` and set `PAYMENT_PROVIDER`.
3. Point the gateway's webhook at `POST /api/payments/webhook/<provider-name>`. The provider must verify the signature (`req.rawBody` is available). Only a verified webhook sets an order to *Paid*.

## How it is built

- **Prices are server-side only.** The browser stores product ids + quantities. `POST /api/cart/quote` and `POST /api/orders` price everything from the database (`server/src/services/pricing.js`); client-sent prices are ignored. Orders snapshot name/price at purchase.
- **Delivery fee** lives in the `Settings` document, edited in admin; no hard-coded fee in the frontend.
- **Admin security**: bcrypt (cost 12), JWT in an httpOnly cookie (8h), Zod validation on every write, helmet, CORS allow-list, rate limits (login 10/15 min, orders 20/h, global 600/15 min), CSRF header check on all admin writes.
- **Admin**: dashboard layout (sidebar, overview with counts and recent orders), white theme with colourful action buttons. Styles are scoped under `.admin` in `client/src/index.css`. Orders can be deleted (confirmation prompt, permanent): `DELETE /api/admin/orders/:id`.
- **Design**: Poppins, warm paper background, near-black sections, hairline borders, square buttons, small uppercase labels. Tokens live in `client/tailwind.config.js` and `client/src/index.css`; copy and image slots in `client/src/content/site.ts`.
- **Filter finder** (homepage): navigates to `/products` with `category`, `brand`, `model` and `q` query params and filters client-side. Products have no brand/model fields, so *Brand* is read from a specification row labelled **Brand** (add it in admin) and *Vehicle model* / *part number* match against name, SKU, description and spec values.
- **Site photos**: `client/public/images/{hero,about,finder,assist}.jpg` are soft placeholders cropped from the design mockup. Drop real photos in with the same names. Missing files show a quiet labelled panel, never a broken image.
- **Product photos**: every image goes through `ProductImage`: flat plate, multiply blend (white photo backgrounds vanish), contained crop, soft contact shadow. Replace a photo in admin (Cloudinary upload or URL) and the treatment applies automatically. Placeholders are in `client/public/placeholders/` (`npm run seed -- --reset` loads the six placeholder products that use them; this wipes existing products).
- **Copy**: Product names, brand names, prices, specs and the 300 Rs. delivery fee are placeholders from `server/src/seed.js`; the homepage "why ANT" and about copy are placeholders in `site.ts`. No certifications or performance figures anywhere.

## Known limitations

- Untested as delivered (see Status). Library versions are caret-pinned from memory; run `npm run typecheck --prefix client`.
- One image per product; no inventory, analytics, coupons or customer accounts (not requested).
- Order confirmation emails are not sent (needs an email provider).
- SEO is client-rendered (Seo component + JSON-LD); Google renders JS, but social-card scrapers may not see per-product Open Graph tags. If that matters, add prerendering later.
