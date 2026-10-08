# Dynamic Delivery Date Engine — nutrifitness.ch

## 1. Overview

The **Dynamic Delivery Date Engine** replaces all hardcoded shipping texts (such as "Shipped from Geneva (2-4 days)" or "Shipped from Portugal (3-5 days)") with live, deterministic, working-day delivery promises calculated per product, origin, and destination country.

Nothing is hardcoded in storefront components: every date is computed dynamically from configurable rules, official calendars, and working-day logic.

---

## 2. Core Architecture & The Three Inputs

Every delivery estimate is computed from exactly three inputs:

1. **Fulfilment Location per Product or Variant (`GENEVA` or `PORTUGAL`)**:
   - Single-location products derive directly from active stock (`stock_geneva > 0` or `stock_portugal > 0`).
   - `COMMON` products (stocked at both locations) resolve based on the customer destination:
     - Customer in **Switzerland (`CH`) or Liechtenstein (`LI`)** $\rightarrow$ **`GENEVA`** (Marco).
     - Customer in **European Union, UK, Norway, Iceland** $\rightarrow$ **`PORTUGAL`** (Omar, direct factory, avoiding Swiss export customs/VAT for EU buyers).
     - Out-of-stock fallback: if preferred location has 0 stock and the other has stock, it falls back to the other origin.
   - The resolved value is saved on each cart line and shipment record (`fulfilment_location`).

2. **Lead Time per Origin & Destination (`delivery_rules` table)**:
   - Handling days (`handling_days`, e.g. 0 for Geneva, 1 for Portugal).
   - Transit working days (`transit_min_days`, `transit_max_days`).
   - Customs buffer (`customs_buffer_days`, e.g. for Portugal $\rightarrow$ CH/LI/UK/NO/IS).
   - Saturday delivery flag (`delivers_saturday`).

3. **Order Cutoff Time per Origin**:
   - Default **14:00 Zurich/Geneva time** for Geneva (`GENEVA`).
   - Default **12:00 Lisbon time** for Portugal (`PORTUGAL`).
   - Orders placed before cutoff on an origin working day are dispatched the same day (plus handling days).
   - Orders placed after cutoff, or on weekends/holidays, dispatch on the next working day.

---

## 3. Pure Calculation Algorithm (`src/lib/delivery/estimate.ts`)

The date calculation is implemented as a pure function with zero network access:

```typescript
export function estimateDelivery(input: EstimateDeliveryInput): EstimateDeliveryResult
```

### Steps:
1. **Rule Matching**:
   1. Exact match: `(origin, country, shipping_method)`
   2. Default method: `(origin, country, shipping_method = null)`
   3. Country group: `(origin, country_group)` (e.g. `EU_NEAR`, `EU_IBERIA`, `EU_EAST`)
   4. None matched or `is_allowed = false` $\rightarrow$ **BLOCKED** (`isAllowed = false`, Add to Cart disabled).
2. **Dispatch Date**:
   - Evaluates current time in the origin's timezone (`Europe/Zurich` or `Europe/Lisbon`).
   - If after cutoff, dispatch starts on next working day.
   - Handling days (`handling_days`) are added using origin working days (skipping weekends and origin holidays).
3. **Transit Window**:
   - Earliest Date: add `transit_min_days` working days using destination calendar (skipping weekends and destination holidays).
   - Latest Date: add `transit_max_days + customs_buffer_days + extra_delay_days` working days.
4. **Guaranteed Promise**:
   - `displayDate = latestDate` (the safe, deliverable promise presented to the customer).

---

## 4. City & Postal Code Country Intelligence

To eliminate customer confusion (e.g. entering "Lisbon" with "Suisse" selected in checkout):
- **Smart City Detection**: Detects Portuguese cities (`lisbon`, `lisboa`, `porto`, `coimbra`, `braga`, `faro`, etc.) and European capitals/cities.
- **Auto-Country Correction**: Automatically switches checkout destination country to Portugal (`PT`) or respective country.
- **Immediate Cost & Origin Recalculation**: Instantly re-routes `COMMON` products to Portugal, recalculates Sendcloud rates, and updates postal validation format.
- **Storefront Deliverability Filter**: Products that cannot be delivered to the selected country (e.g. Geneva-only products for non-allow-listed destinations) are automatically hidden in `/boutique/` and `/recherche`. On product detail pages, the Add-to-Cart and TWINT buttons are disabled.

---

## 5. Components & API Endpoints

### Universal Component: `<DeliveryEstimate />`
Located at `src/components/delivery/DeliveryEstimate.tsx`:
- **Card mode (`mode="card"`)**:
  - Primary line: SVG flag (`<FlagIcon />`) + bold delivery promise date (e.g. 🇨🇭 *Mardi 13 oct*).
  - Secondary line: muted "Expédié de Genève" / "Expédié du Portugal".
  - Independent stock pill: *En stock · 20* or *Plus que 3 en stock*.
- **Detail mode (`mode="detail"`)**:
  - Full detail box on product pages with expandable drawer:
    - Transit lead time: *X–Y jours ouvrables*
    - Handling time: *Z jour(s)*
    - Order cutoff: *14:00 (Genève)* / *12:00 (Lisbonne)*
    - Fulfilment center: *🇨🇭 Genève, Suisse* / *🇵🇹 Oliveira de Azeméis, Portugal*
    - Customs notification: when destination requires customs declarations.
- **Cart & Checkout mode (`mode="compact"` / `CartShipmentGroups`)**:
  - Displays dynamic dates per shipment group.
  - Cart shows unified bottom promise: *"Tous vos articles arrivent d'ici le [date]"*.

### API Endpoints
- `POST /api/delivery/estimates`: Batch estimation endpoint with client memory cache (`3 min TTL`).
- `GET /api/admin/shipping`: Fetch all rules, country groups, holidays, delay settings, and shipments.
- `POST /api/admin/shipping`: Actions: `update_rule`, `toggle_rule`, `bulk_update_rules`, `add_holiday`, `delete_holiday`, `update_settings`, `import_rules_csv`.

---

## 6. Admin Dashboard (`/admin/shipping`)

Accessible with administrator credentials (`Geneva@03564`):
1. **Règles de Livraison**:
   - Filter by origin (Genève / Portugal) and status.
   - One-click active/inactive toggle.
   - Inline/modal editing of handling days, cutoff, and transit windows.
   - Bulk edit selected rules.
   - CSV export and import.
2. **Calendrier des Jours Fériés**:
   - Manage national and regional holidays (Genève, Portugal, France, etc.) for 2026/2027.
   - Automatically highlights upcoming holidays in the next 30 days.
3. **Simulateur de Délais (Delivery Preview Tool)**:
   - Live testing of any origin, destination, and mock order date/time without placing orders.
   - Shows step-by-step breakdown (cutoff, handling, transit, holidays bypassed).
4. **Suivi Promesse vs Réel**:
   - Measures promised delivery date against actual carrier delivery timestamp (`delivered_at`).
   - Tracks on-time delivery rates per origin.
5. **Tampon de Retard**:
   - Add temporary extra delay days (`extra_delay_days`) during postal strikes or peak seasons with zero code changes.

---

## 7. Testing & Verification

Run the dedicated test suite:
```bash
npm run test:delivery
npm run test:routing
```
Both test suites verify:
- Order cutoff before/after transitions
- Weekend skipping
- Public holiday shifts
- Switzerland $\rightarrow$ Geneva priority for common products
- EU $\rightarrow$ Portugal priority for common products
- Non-supported destination blocking
