# Catalog Import, Location Management & Location Badges

## 1. Overview
This system extends NutriFitness (`nutrifitness.ch`) with automated multi-origin stock tracking, catalog ingestion from WooCommerce exports, dynamic origin & stock badges on every product card, and an intuitive admin location manager.

---

## 2. WooCommerce Catalog Ingestion (`scripts/import-woocommerce.ts`)

### How to Run the Import Safely
The import script is 100% idempotent and can be safely re-run at any time without creating duplicate products or overwriting non-CSV data.

```bash
# Run using the default local WooCommerce CSV export
npm run import:woo

# Or with a custom file path
WOO_CSV_PATH="/path/to/export.csv" npm run import:woo
```

### Match Key Hierarchy & Deduplication
To ensure zero duplicate products in the database:
1. **Priority 1: SKU (`products.sku`)** — Matches product by unique SKU code.
2. **Priority 2: WooCommerce ID (`products.woo_id`)** — Matches product by its native WooCommerce ID.
3. **Priority 3: Normalized Name (`products.normalized_name`)** — Lowercase, trimmed, unicode accent diacritics removed, spaces normalized.

If a match is found, the product is **updated in place** (`UPDATE products`). If not, it is inserted as a new product.

### Variations & Flavors Architecture
- **Parents**: Simple and variable parent products are inserted into `products`.
- **Variations**: Child rows (with a `Parent` reference `id:<woo_id>` or `<sku>`) are mapped into `product_variants`:
  - `attribute_name`: 'flavor', 'poids', etc.
  - `attribute_value`: e.g. "Chocolat", "Cookies", "Love Hearts"
  - `stock_geneva`: initial quantity from CSV (Marco's shop in Geneva)
  - `stock_portugal`: initial quantity set to 0 (Omar's factory in Portugal)
  - `image_url`: flavor-specific image URL
  - `price`: variant-specific price

---

## 3. Product Location Manager (`/admin/products`)

Accessible at:
`https://nutrifitness-bice.vercel.app/admin/products` (Protected with password: `Geneva@03564`)
Or via the top navigation in `/wp-admin/` -> **📍 Emplacements**.

### Features:
1. **Instant Location Toggles (🇨🇭 Genève & 🇵🇹 Portugal)**:
   - Activating both locations automatically marks the product as **COMMON**.
   - Activating only Geneva -> **GENEVA_ONLY**.
   - Activating only Portugal -> **PORTUGAL_ONLY**.
2. **Main Location Selector**:
   - Sets the default card badge location when a product is single-location. For COMMON products, the card badge always displays Geneva.
3. **Inline Stock Editing**:
   - Instant editable quantity inputs for Geneva and Portugal stock.
   - Expandable variants row to edit stock numbers per flavor.
4. **Optimistic UI with 10-Second Undo**:
   - Every toggle and stock change saves instantly and presents an on-screen toast notification with an **"Annuler" (Undo)** button valid for 10 seconds.
5. **Soft Delete (= Move to Draft)**:
   - Clicking delete never destroys data; it sets `status = 'draft'` and `deleted_at = now()`.
   - Excluded from the sitemap (`/sitemap.xml`) and returns `404 Not Found` on public URLs.
   - The **"Brouillons & Retirés"** tab allows restoring products with 1 click or permanently deleting with double-confirmation.
6. **Bulk Actions**:
   - Multi-select products to set locations, activate both (COMMON), publish, or move to draft in bulk.
7. **Audit Log (`product_audit_log`)**:
   - Every modification is tracked with user, timestamp, previous state, and updated payload.

---

## 4. Location Badge (`<ProductLocationBadge />`)

Rendered on every product card across the store (`ProductCard.tsx`):
- **COMMON Products (Geneva + Portugal active)**:
  - Badge: `🇨🇭 En stock à Genève` with Geneva stock count.
- **Geneva Only Products**:
  - Badge: `🇨🇭 En stock à Genève` with Geneva stock count.
- **Portugal Only Products**:
  - Badge: `🇵🇹 Expédié du Portugal` with Portugal stock count.
- **Stock Urgency Counts**:
  - `> 5`: `{count} en stock` (Green indicator)
  - `1 – 5`: `Plus que {count} en stock` (Amber pulsing urgency indicator)
  - `0`: `Rupture de stock` (Red indicator)
- **i18n**: Fully localized across French (`fr`), German (`de`), Italian (`it`), and English (`en`).

---

## 5. Instant Cache Revalidation

Every admin update triggers Next.js on-demand revalidation:
- Revalidated paths: `/`, `/boutique`, `/categorie`, `/produit/[slug]`, `/sitemap.xml`
- Revalidated tags: `products`, `product:{id}`
- Dedicated API: `POST /api/revalidate` with `secret: "Geneva@03564"`

---

## 6. Acceptance Testing (`scripts/verify-acceptance.ts`)

Run the full automated integrity and acceptance suite:
```bash
npm run test:acceptance
```

Verifies:
- 0 duplicate SKUs and 0 duplicate normalized names
- All 138 variations attached to parent products with dedicated images
- Published product completeness (category, image, price, stock)
- Stock consistency with CSV
- 98 published vs 8 draft products
- 15 normalized tags
- 100% idempotent re-run
- Soft delete and restore lifecycle with audit logs
- Badge logic across COMMON, GENEVA_ONLY, and PORTUGAL_ONLY types
