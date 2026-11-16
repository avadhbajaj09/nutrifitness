# NutriFitness.ch — Phase 1 audit

Date: 17 November 2026 (Asia/Kolkata). Production observations were collected on 16 November UTC / 16–17 November IST. Repository: `nutrifitness-seo-system`, HEAD `baf016b`. Scope: Step 0 and read-only Phase 1 only. Status: **AWAITING OWNER APPROVAL; no fixes, migrations, deployment, credential rotation, or production business-data writes performed.** This report is the only added repository artifact.

## 1. Executive assessment and evidence boundaries

**Do not approve this site as production-ready.** Confirmed critical findings include committed database/service credentials, anonymous database access to orders, publicly executable privileged product-save RPC, and missing server authorization in administration APIs. There are multiple confirmed mechanisms for misleading or overwritten stock. The precise historical cause of the client's particular stock incident is **UNVERIFIED** without the affected SKU, time, request, and deployment logs.

The configured live database was inspected through `pg` using `DATABASE_URL` in a `BEGIN READ ONLY` transaction, ending with `ROLLBACK`. Only schema metadata, aggregate business counts, and product inventory were read; customer fields were not selected. A second read-only transaction used `SET LOCAL ROLE anon` solely to count visible orders. No mutating RPC was called. Public production checks used GET requests to product/stock and storefront routes. `/api/orders` GET was deliberately not requested because its implementation writes a `/tmp` cache (`src/app/api/orders/route.ts:153`). No email was sent, payment session created, order changed, upload attempted, or postage generated.

Evidence labels:

- **CONFIRMED CODE**: source defect, not a claim that a live exploit or incident occurred.
- **CONFIRMED LIVE**: HTTP or database output reproduced during this audit.
- **LOCAL REPRODUCTION**: actual source executed with injected database/cache dependencies, no network.
- **UNVERIFIED**: not tested, blocked, or needs writes/third-party access.

Local source and database schema can be correlated, but the exact Hostinger deployed commit is **UNVERIFIED**. Supabase's connector lists only an unrelated project; it was not queried further. Direct read-only access to the configured NutriFitness database succeeded. Vercel project inspection returned 403 for the configured team. No Hostinger account tools were available. Hosting configuration, logs, backups, preview secrets, and platform schedules remain UNVERIFIED.

## 2. Architecture map — actual code and observed hosting

```text
Browser → Hostinger hcdn → Next.js 14 App Router / Node.js
  Storefront: /, /boutique/, /produit/[slug]/, /categorie/[slug]/,
              /marque/[slug]/, /panier/, /commande/, /compte/
  Admin: /wp-admin/, /admin/products/, /admin/shipping/, /teamomar/, /mail/
  Public inventory hydration → /api/admin/stock/ → service-role Supabase client
  Inline administration → PATCH /api/admin/products → separate SQL REST writes
  Full product save → POST /api/admin/products → save_admin_product_full(jsonb)
  Checkout → /api/checkout → Stripe hosted checkout + pending orders
  Stripe webhook → orders + products/product_variants/fulfillment_stock
  Supabase PostgreSQL / Storage → catalog, inventory, orders, email, agents
  External: Stripe, TWINT/MameDev, Resend, Packlink, Sendcloud,
            Anthropic, DataForSEO, Google Analytics/GTM, Meta CAPI
  Intended Vercel cron: GET /api/cron/agents at 02:00 UTC daily
```

Evidence: `package.json:22`, `src/lib/supabase.ts:7`, `src/lib/supabase.ts:11`, `src/app/api/admin/products/route.ts:527`, `src/app/api/checkout/route.ts:140`, `src/app/api/checkout/route.ts:254`, `src/app/api/webhooks/stripe/route.ts:50`, `vercel.json:3`. Installed lockfile: Next 14.2.35, React 18.3.1, Stripe 23.0.0, Zod 3.25.76. The catalog is a hybrid of `src/lib/catalog.ts` and database overlays (`src/context/StoreContext.tsx:241`, `:286`; `src/app/produit/[slug]/page.tsx:142`). WooCommerce is historical import material; current checkout and inventory handlers use Supabase directly. `/wp-admin` is a Next.js route, not proof of a running WordPress backend.

Production HTTP headers: `platform: hostinger`, `server: hcdn`, `x-powered-by: Next.js`. Local `.vercel/project.json` names project `nutrifitness`; this does not establish that Vercel currently serves the custom domain. `vercel.json` schedules agents, but Hostinger execution of that cron is UNVERIFIED.

Auth: client password comparisons/localStorage flags in four admin clients; Omar's password endpoint returns JSON without establishing a server session (`src/app/api/teamomar/auth/route.ts:19`). No verified role-based admin session exists in the inspected flows. Customer account screen contains mock orders (`src/app/compte/AccountClient.tsx:11`).

Database groups: products, variants, normalized product_stock, legacy fulfillment_stock; orders and fulfillment shipments/events; delivery rules/settings/countries/holidays; emails, newsletter/coaching leads; SEO agent tasks/artifacts/approvals/costs. Complete table/policy inventory appears below.

### Environment matrix methodology

The matrix below includes all 43 distinct explicit `process.env.NAME` reads found in tracked JS/TS/config files, plus configured/example-only variables. Locations include tooling and tests; “no explicit read” does not prove an external platform never consumes it. Anthropic's SDK implicitly reads `ANTHROPIC_API_KEY` (`src/lib/agents/llm.ts:4`). Values are intentionally omitted. “Production file” means the local `.env.production`, **not verified deployed production**. Every deployed preview/production variable is UNVERIFIED without hosting access. Variables set in both local files compared equal during this scan; equal values do not prove correct credentials.

Notable gaps: local `CRON_SECRET`, `ADMIN_REVALIDATE_SECRET`, and `OMAR_ADMIN_PASSWORD` absent; Sendcloud variables present locally but absent from production file; `ALLOW_INDEXING` absent from both, while robots generation depends on `VERCEL_ENV` or that variable. Anthropic/DataForSEO credentials absent in both files. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured but tracking component uses hardcoded IDs (`src/components/GoogleAnalytics.tsx:6`). All requested `SWISSPOST_*` variables and modules are absent from the scanned implementation and local environment files; they belong to Phase 3.

## 3. Findings

Effort is an estimate for implementation plus relevant tests: S ≤ half day, M 1–2 days, L 3+ days. Migration/data reconciliation and provider access can add time. All findings remain OPEN.

| ID | Severity | Area | Evidence | Impact | Recommended fix | Effort |
|---|---|---|---|---|---|---|
| SEC-01 | Critical | Secrets | Service-role JWTs: `scripts/sync-portugal-products.ts:7`, `scripts/update-swiss-inventory.mjs:6`; DB password: `scripts/run-migrations.mjs:6` and appendix | Repository readers can obtain privileged credentials; validity of each old literal not tested | Rotate DB/service credentials; remove literals; use env names; assess access logs; purge history after coordination | M |
| SEC-02 | Critical | RLS | Live `service_all_products`, `service_all_product_stock` etc. have roles `{public}`, cmd ALL, qual true; `003_catalog_and_locations.sql:174` | Anonymous role with granted table privileges can bypass intended published/active restrictions and mutate catalog/inventory | Replace public ALL policies with authorized access; restrict grants; staging negative tests | M |
| SEC-03 | Critical | Orders privacy | Live orders SELECT policy `{anon,authenticated}` qual true; `SET LOCAL ROLE anon; SELECT count(*) FROM public.orders` → 59 | All 59 order rows accessible without customer ownership restriction | Owner-based customer policy, admin role, revoke anonymous reads; assess exposure | M |
| SEC-04 | Critical | RPC | Live `save_admin_product_full`: SECURITY DEFINER; anon EXECUTE true; migration `006_harden_admin_variant_skus.sql:8` | Anonymous caller can invoke privileged catalog/stock writes; no admin check in function | Restrict EXECUTE, validate admin identity, fixed search_path; keep transactional save | M |
| SEC-05 | Critical | Admin APIs | Anonymous GET `/api/admin/stock` → 200, success true, 692 identifier entries; GET `/api/admin/products?limit=1` → 200; mutations start without auth (`admin/products/route.ts:216`, `:524`, `admin/stock/route.ts:186`); middleware exempts APIs `middleware.ts:41` | UI login provides no API protection; arbitrary inventory/product operations possible by source inspection | Real server-validated role sessions across pages/APIs; scoped public inventory endpoint; rate limits and CSRF/origin controls | L |
| SEC-06 | Critical | Payments | `api/checkout/route.ts:178` sets Stripe unit_amount from supplied item.price, shipping at :225; item.isEbook bypasses stock check at :44; unknown product fails open at :78 | Requester controls amount charged and may bypass inventory validation | Resolve canonical product/variant/price/tax/shipping/discount server-side; reject unknown items | M |
| SEC-07 | Critical | TWINT webhook | `api/webhooks/twint/route.ts:45` accepts missing secret; isSecretValid never gates writes at :65; defaults status to paid at :55 | Forged payment updates attempted; incorrect secret logged at :50 | Verify provider signature over raw body, reject before processing, validate amount/currency/order, dedupe events, redact logs | M |
| SEC-08 | High | Hardcoded admin login | `admin/products/ProductLocationManagerClient.tsx:29`, `admin/shipping/AdminShippingClient.tsx:34`, `wp-admin/AdminDashboardClient.tsx:62`, `mail/MailClient.tsx:35` | Credentials shipped as client code; localStorage flags forgeable; no revocable server session | Remove literals, rotate shared passwords, implement RBAC and session expiry/revocation | M |
| SEC-09 | Critical | Mail API | `api/mail/route.ts:7`, `:54` use admin client without server auth; outbound Resend call :121 | Source permits private-mail access and unauthorized mail sending on merchant account | Require admin authorization, scoped attachments, sending limits/audit | M |
| SEC-10 | High | Stored XSS | `lib/formatContent.ts:15` formats HTML without sanitization; used at `produit/[slug]/ProductDetailClient.tsx:525`; local test preserves onerror | Writable catalog HTML can execute code in browser; production exploit not attempted | Proven HTML allowlist sanitizer; escape JSON-LD closing-script sequences; CSP | M |
| SEC-11 | High | Upload/storage | `api/admin/upload-image/route.ts:6` no auth, trusts declared MIME, accepts SVG; mail upload :6 no auth; live mail-attachments public=true, MIME unrestricted | Public storage abuse, exposed attachments by URL, unsafe file content | Authenticate, private mail bucket/signed access, inspect file bytes, reject/sanitize SVG | M |
| SEC-12 | Critical | Provider credential | `lib/packlink/client.ts:8` contains non-placeholder API-key fallback | Repository disclosure of provider credential; validity UNVERIFIED | Rotate provider key, remove fallback, env only | S |
| STK-01 | High | Silent stock save | `api/admin/stock/route.ts:313`, :322, :338, :346 ignore returned errors; local forced-write-failure result 200/success true | User sees success with no persisted inventory | Check every DB error/row count; transactional stock RPC; durable audit | M |
| STK-02 | High | Optimistic admin | `admin/products/ProductLocationManagerClient.tsx:268` and :307 never check response.ok; API PATCH ignores stock upsert errors `admin/products/route.ts:322`, :369 | Failed write appears saved until refresh | Validate response and returned version; refresh authoritative state; explicit failure UI | S |
| STK-03 | High | Parent vs variant | Parent PATCH writes variant_id null `admin/products/route.ts:322`; trigger sums only variant rows when variants exist `005_stock_triggers_and_atomic_admin.sql:51`; PDP sums variants `produit/[slug]/page.tsx:308`; live 5 parent inconsistencies | Parent edit can have no effect on selected variant availability; conflicting read results | Edit variants for variable products; derive parent sums; one authoritative inventory representation | M |
| STK-04 | High | Stale full saves | `006_harden_admin_variant_skus.sql:30`, :115, :157, :211 overwrite stock from full payload, missing stock defaults to zero; no version check | Metadata save from stale editor can erase newer stock; omission may zero stock | Separate stock commands, optimistic concurrency version, preserve absent fields | M |
| STK-05 | High | Payment inventory consistency | Stripe stock deduction writes products/variants/fulfillment_stock, not product_stock (`webhooks/stripe/route.ts:87`, :100, :107); trigger flows the other way | Paid orders leave canonical rows stale; later stock write can restore stale totals; read-modify-write loses concurrent changes | Single inventory transaction and ledger keyed by order/event; lock rows; remove parallel counters | L |
| STK-06 | High | Webhook ordering/idempotency | Stripe existing.status read :260, order update :267 before stock call :295; errors swallowed :122; no unique event ledger in live tables | Concurrent deliveries can double-apply; partial failure acknowledged and skipped on retry; completed event has no payment_status gate before processing | Unique event/order transition transaction; only fulfilled paid state; retry failed durable work | L |
| STK-07 | High | Location changes | `admin/products/route.ts:271` and :280 explicitly zero other-origin variants; `scripts/sync-product-locations.mjs:19`, :31, :46, :52 also zero stock | Switching location or running sync can discard counted stock | Separate availability/location from stock transfers; require explicit audited transfer | M |
| DB-01 | High | Constraints | Live constraints appendix: no quantity nonnegative/reserved bounds or paired product+variant FK | Invalid or cross-product inventory allowed through direct API/RPC access | Add validated CHECKs, correct FK ownership, finite integer validation | M |
| DB-02 | High | Schema drift | Live COMMON location and NULLS NOT DISTINCT constraint absent from base migration; duplicate 001 prefixes; no supabase_migrations.schema_migrations; runner stops at 004 (`scripts/run-migrations.mjs:26`) | Fresh replay differs from live; release may miss hardening/stock functions | Baseline reviewed schema, ordered migrations, staging replay/diff and rollback plan | M |
| DB-03 | Medium | Audit integrity | RPC swallows audit failures `006_harden_admin_variant_skus.sql:243`; PATCH user supplied :234; stock endpoint lacks stock ledger | Cannot reliably reconstruct who changed stock; order deductions not fully logged | Transactional append-only ledger with server identity, old/new/source/correlation | M |
| INT-01 | High | Shipping admin | `api/admin/shipping/route.ts:27`, :32 query delivery_country_groups/delivery_holidays; live tables named country_groups/holidays | Holiday/group admin operations target missing tables | Align schema/table names and error handling; staging CRUD tests | S |
| INT-02 | High | Webhook authenticity | Resend webhook writes unverified request (`webhooks/resend/route.ts:8`); Sendcloud signature code only comment (`webhooks/sendcloud/route.ts:10`) | Spoofed inbound emails; Sendcloud silently acknowledges unimplemented fulfillment processing | Implement provider signature checks, dedupe/retries and real event handling | M |
| INT-03 | Medium | Failures/stubs | Resend missing key returns success stub (`email/resend.ts:24`); Sendcloud errors return stub rates (`sendcloud/client.ts:162`); Packlink fetch :85 no timeout | False integration success, fake rates, hanging requests | Fail closed in production, explicit preview mode, bounded timeouts/retry policy/monitoring | M |
| ORD-01 | High | Order persistence | `api/orders/route.ts:13`, :29, :166 use /tmp fallback; public POST :175 accepts supplied totals/status | Orders may disappear across restarts/instances; untrusted “processing” orders | Durable DB only, authenticated POS/admin path, validated public pending-order path, fail visibly | M |
| SEO-01 | High | Robots/hosting | Live robots: User-Agent:* Disallow:/; `app/robots.ts:32` assumes VERCEL_ENV production unless ALLOW_INDEXING=true | Entire public store blocked from crawling despite index/follow page metadata | Explicit environment indexing config for actual host; staging stays blocked | S |
| SEO-02 | Medium | Canonical redirects | HTTP → HTTPS 301 works; https://www and apex both return 200; no www redirect observed | Duplicate entry points; canonical tag alone does not meet requested redirect policy | Decide preferred apex; one permanent host redirect; test full URL map | S |
| PERF-01 | High | Payload | Homepage raw UTF-8 HTML 3,557,713 bytes, 125 images; boutique 715,433 bytes/154 images; images unoptimized `next.config.mjs:9`; home response s-maxage=31536000 | Large parse/hydration burden, stale cached storefront; Lighthouse impact UNVERIFIED | Reduce catalog/RSC serialization, paginate/lazy-load, optimize images, validate cache freshness | M |
| CMP-01 | High | Consent | `GoogleAnalytics.tsx:31` defaults analytics/ad consent granted without saved choice | Tracking enabled before opt-in; EU targeting risk; Swiss applicability requires qualified review | Default relevant storage denied, consent update on choice; validate network after reject/withdraw | M |
| CMP-02 | High | Product claims | Live homepage includes anti-inflammatory and glycemia/insulin-sensitivity claims; catalog contains those terms | Health claims need authorized wording/conditions evidence | Qualified Swiss food-law/content review per SKU, remove unsupported claims after approval | L |
| QA-01 | Medium | Account | `compte/AccountClient.tsx:11`, :61 hardcoded orders and customer identity | Customer order history is demonstration content, not authenticated real history | Real customer auth and scoped order history | L |
| QA-02 | Medium | Tooling | `tsconfig.json` strict=false; no lint script/config found; stock test only formats badges | Important defects pass current tests; type assumptions unchecked | Staged strictness, lint setup, meaningful stock/payment/auth regression tests | M |

The Stripe key-like literal in `src/lib/stripe.ts:3` is a build placeholder, **not a confirmed live Stripe credential**. The anonymous Supabase fallback key is a public-role key, not a service-role secret. The earlier scan's broad pattern match is excluded from secret findings. The public policies still make that anonymous role dangerous.

## 4. Stock lifecycle and ranked root-cause analysis

### Write/read trace

1. `/admin/products` parent inline input optimistically updates React state, PATCHes `{id,stock_geneva}` or `{id,stock_portugal}`, then always shows success when fetch resolves (`ProductLocationManagerClient.tsx:259–279`). HTTP 400/500 does not reject fetch.
2. API PATCH fetches current product (`api/admin/products/route.ts:243`), upserts **parent** product_stock row using `variant_id:null` (:322), ignores returned SQL errors, writes a best-effort audit record (:442), responds success (:476).
3. For products with variants, live `sync_product_stock_changes` derives products.stock_* from active **variant** rows only (migration 005:51–57). Writing parent stock alone cannot change variant quantities. For simple products it uses active parent rows (005:59–64).
4. Variant PATCH separately writes product_variants and product_stock (:366–386), without a transaction or checked outcomes. Full `/wp-admin` save calculates totals (:772), serializes all variant stock (:823), POSTs to an atomic RPC (:833). RPC defaults omitted quantities to zero and overwrites existing rows (migration 006:30–31, :157–158, :211–218).
5. Admin product GET reads parent stock first and sums variants only when parent equals zero (`api/admin/products/route.ts:111–141`). Public stock GET also mixes variant columns and product_stock (`admin/stock/route.ts:74–84`). StoreContext fetches that **admin** endpoint (`StoreContext.tsx:241`). PDP instead uses product columns and sums variants (`produit/[slug]/page.tsx:280–319`). Checkout uses products/product_variants columns (:86–91).
6. Stripe paid-order processing directly decrements product and variant counters and legacy fulfillment_stock, leaving product_stock unchanged. A subsequent canonical stock write fires a trigger that can restore stale counters. There is no transactional inventory reservation lifecycle established in the inspected checkout path.

### Ranking (mechanisms confirmed; historical attribution not proven)

| Rank | Mechanism | Why supported | Incident likelihood boundary |
|---|---|---|---|
| 1 | Success reported despite failed persistence | Local execution of actual stock handler with all writes returning errors → HTTP 200 success true; both UI and PATCH ignore relevant errors | Strongest match for “saved, disappears after refresh”; need client's actual failing request to attribute |
| 2 | Parent edit on variable product vs variant-driven availability | Confirmed conflicting write/read rules and live parent inconsistencies | Strong match when client edits parent quantity but buys a flavor; does not mean DB row itself vanished |
| 3 | Stale full-product save or explicit location switch overwrites stock | Full RPC overwrite/default-zero and location zeroing are visible code paths; live function body matches migration 006 | Deterministic risk on those operations; actual execution/time UNVERIFIED |
| 4 | Payment path creates diverging counters, retries/concurrency compound it | Canonical product_stock not decremented; status and stock operations are separate | Relevant to order-time stock anomalies; no claim that a specific webhook caused this incident |
| 5 | Manual sync scripts replace quantities | Location script explicitly zeros stock; import/sync scripts assign fixed values | Execution schedule/history UNVERIFIED; no evidence redeploy automatically invokes them |

### Safe reproduction procedures

**Already reproduced, no network:** transpile the actual `api/admin/stock/route.ts` using TypeScript in an isolated VM, inject NextResponse JSON, no-op cache functions, and a Supabase query builder. Product lookup resolves a fixture. Every insert/update/upsert resolves `{data:null,error:{message:'injected database write failure'}}`. POST fixture product quantity 10. Exact observed result:

```json
{"writes":2,"status":200,"body":{"success":true,"productId":"00000000-0000-4000-8000-000000000001","slug":"fixture","stockGeneva":0,"stockPortugal":0,"totalStock":0,"inStock":false},"networkCalls":0}
```

This proves ignored-error success handling, not that a particular production write failed.

**Staging-only next reproduction, not executed:** create a variable product with variant Geneva quantity 2; edit parent inline quantity to 10; inspect parent row, variant row, derived product columns, admin display and PDP before/after refresh. Trigger continues to derive quantity 2 from the variant. Then use two editors: A loads stock 2, B changes variant to 10, A saves only a description through the full-product form with stale stock 2. RPC overwrites back to 2. Finally inject a PATCH DB failure or HTTP 500 and verify current UI still announces success. Do not perform these writes in production without explicit approval.

### Live inventory snapshot

Aggregate output: products=161, variants=278, product_stock rows=875, fulfillment_stock rows=327, product_audit_log rows=580. Variant-stock comparison: 556 variant stock rows, 0 mismatches at this snapshot. Parent Geneva derived-stock check: 5 mismatched products.

| Slug | products.stock_geneva | Active variant-row sum | Parent row Geneva |
|---|---:|---:|---:|
| infected-pre-workout-sans-stim-500g | 15 | 5 | 0 |
| iso-whey-zero-907g | 0 | 4 | 0 |
| marvelous-nad-cell-rejuvenation-longevite | 12 | 6 | 0 |
| nutry-nuts-cups | 0 | 2 | 0 |
| pancake-proteines-800g | 0 | 1 | 0 |

Live stock duplicate-parent groups=0; negative quantities=0; null quantities=0; reserved_quantity>quantity=0. Those checks do not prove historical correctness. NULLS NOT DISTINCT uniqueness exists live: the expression-index-only migration risk does **not** establish a current upsert conflict. Live trigger/RPC installed. No pg_cron extension or cron.job table found. Edge Functions and host-side jobs UNVERIFIED. No automatic seed-on-build command in package build script (`next build`). Inventory is PostgreSQL-backed; ephemeral storage applies to the order fallback, not proven stock storage.

Proposed stock fix after approval: choose product_stock as authoritative, use an atomic version-checked stock command for all admin/POS/payment paths, derive parent totals from variants, prohibit stale metadata saves from touching stock, and insert an immutable stock ledger in the same transaction. Record actor, timestamp, old/new, origin, variant, reason/source and event/request ID. Add regression tests for failed saves, zero vs missing, stale editor conflicts, parent edits, concurrent payments, duplicate/reordered events, failed payment and order cancellation. Reconcile existing discrepancies only from a reviewed inventory count; never blindly pick the maximum.

## 5. Database, RLS and schema review

All 34 public tables and 10 inspected storage tables have RLS enabled. **Enabled RLS is not effective isolation when permissive ALL policies apply to PUBLIC.** Full policy inventory below. Tables with no policies deny ordinary access through RLS, subject to owner/bypass roles. Live anon/authenticated grants include broad table privileges on public tables; orders anon SELECT was verified with a count only. The live function has no configured search_path and executes as definer; anon EXECUTE was checked through `has_function_privilege`.

Storage: product-images public, 10,485,760 bytes, png/jpeg/webp/svg MIME types. mail-attachments public, 26,214,400 bytes, MIME unrestricted. No storage.objects policies returned. Service-role upload handlers bypass RLS; public bucket object URLs are still public. No shipping-labels bucket exists.

Schema: product/variant foreign keys and unique SKU/woo_id indexes exist. Stock has separate product and variant FKs without enforcing that a variant belongs to that same product. No quantity/reserved checks were found. Orders use JSON items/address, unique order_number, no stock movement/event ledger. Orders created_at/status/customer lookup indexes are absent from inspected index definitions; product_stock product_id and variants product_id indexes exist. Audit indexes exist. Performance significance of missing indexes remains UNVERIFIED without query plans/load metrics. Inventory GET builds multiple maps/filter loops and loads all stock/variants; it is not a per-product SQL N+1, but payload and full-table scale are concerns.

Migrations: versioned SQL exists, but duplicate 001 prefix, no live migration ledger, live constraint drift, missing live orders/emails creation in the migration set, and runner only applies through 004. A fresh baseline replay is UNVERIFIED. Existing SQL and scripts must not be executed against production during this audit.

Backup/PITR, retention, RPO/RTO and restore success are **UNVERIFIED**. After approval, verify current provider plan/snapshots, agree acceptable data loss and recovery time, and perform an isolated restore drill. Recommend managed PITR where available plus encrypted off-provider exports and separate storage-object backup; a database-only backup does not establish recovery of label PDFs or attachments.

## 6. Functional and integration coverage

PASS means only the specific read/test listed passed; it is not an end-to-end certification. Mutating production tests were withheld to respect Phase 1.

| Flow/check | Result | Evidence / remaining verification |
|---|---|---|
| Browse homepage/boutique | PASS HTTP only | 200; one H1, canonical and description present in each sampled response |
| Product stock persistence error handling | FAIL local | Forced failures still return success; above reproduction |
| Admin product/stock authorization | FAIL code + live reads | Anonymous data reads 200; mutating routes have no role check; writes not attempted |
| Product create/update/delete/restore | UNVERIFIED end-to-end | Full RPC and PATCH inspected; failure/error and auth defects above; need staging CRUD fixtures |
| Variant CRUD/stock and bulk actions | FAIL source authorization; UNVERIFIED E2E | Variant IDs accepted without product ownership checks at PATCH :366/:393; no production writes |
| Price edits | FAIL response/error handling in source | ProductLocationManagerClient :329 ignores HTTP status; staging save/read needed |
| Orders/customer administration | FAIL source authorization; UNVERIFIED E2E | Orders API has no auth and accepts totals/status; account mock data; no customer record mutations |
| Coupons | UNVERIFIED E2E | `api/coupons/validate/route.ts:12` has fallback coupons; Stripe redemption/amount reconciliation requires sandbox checkout |
| Shipping CRUD | FAIL schema consistency | Missing delivery_holidays/delivery_country_groups targets; need corrected staging CRUD |
| Image upload | FAIL authorization/security review | MIME/size limits exist, no auth, no content inspection; no upload attempted |
| Search/filter/cart interaction | UNVERIFIED | Chrome browser stopped at Hostinger challenge; source alone insufficient |
| Cart/checkout pages | PASS HTTP only | 200/noindex; no purchase or session creation |
| Customer history | FAIL source functionality | Mock orders at compte/AccountClient.tsx:11 |
| Supabase connection | PASS read-only | Schema and inventory aggregate queries succeeded |
| Stripe signature implementation | PRESENT, E2E UNVERIFIED | Handler verifies raw-body signature; concurrency/paid-state defects above |
| Stripe sandbox payment/webhook/retry/refund | UNVERIFIED | No external payment or signed success event sent; local webhook suite has business effects and env loading, so was not run |
| TWINT webhook | FAIL source | Secret never gates update; live orders columns do not include payment_status, so attempted update may fail silently; need sandbox contract test |
| Resend sending/delivery | UNVERIFIED | Configured key names only; no email sent; unsigned inbound handler confirmed |
| Sendcloud | FAIL implementation completeness | Signature placeholder and event-handling comments; stub fallback |
| Packlink | UNVERIFIED live | Client/route present; no provider operation attempted; embedded-key issue |
| Swiss Post direct API | NOT IMPLEMENTED in scanned source | Requested modules/routes/env variables absent; existing carriers do not prove direct Swiss Post capability |
| Agent cron | UNVERIFIED production schedule | Vercel config present; current host differs, missing local agent credentials |
| Analytics | FAIL consent default; collection UNVERIFIED | Default granted source; property/container delivery and duplication need account/network inspection |
| HTTP→HTTPS | PASS | 301 to HTTPS, then 200; curl certificate verification succeeded |
| www canonical redirect | FAIL requested behavior | www returned 200 rather than canonical host redirect |
| SSL | PASS sampled curl handshake only | Python urllib failed local trust-store validation; curl succeeded without -k; full chain/expiry/DNS not independently audited |
| 404 | PASS sampled HTTP | Random nonexistent URL returns 404; privacy candidate route also 404 |
| Error boundaries | PRESENT | src/app/error.tsx and global-error.tsx; induced 500 rendering UNVERIFIED |
| Mobile/Chrome/Safari/printing | UNVERIFIED | Chrome hit anti-bot challenge, Safari/printer not tested |

## 7. SEO, performance, security and compliance detail

Production `robots.txt` returns `User-Agent: *` and `Disallow: /`. Homepage metadata says index/follow, so crawl policy conflicts with the intended public store. Sitemap index returns 200 (780 bytes); full child sitemap URL coverage, redirects, feed/stock equality and schema validation remain UNVERIFIED. Homepage and boutique have one H1 and all sampled img elements have alt attributes; quality of each alt remains UNVERIFIED. Homepage canonical is apex; no alternate hreflang tags were observed in sampled markup. Multilingual hreflang strategy needs verification against actual localized URLs; adding fabricated URLs is not recommended.

HTTP sample: home raw HTML 3,557,713 UTF-8 bytes /125 images; boutique 715,433 bytes/154 images. These are uncompressed source bytes, not Lighthouse transfer totals. Homepage headers include `x-nextjs-cache:HIT`, `s-maxage=31536000, stale-while-revalidate`; one earlier response Age=613426. Dynamic product page source declares force-dynamic/revalidate=0, while browser inventory is hydrated through no-store API calls. Thus stale presentation is plausible, but caching alone is not proof of lost persisted stock.

**Lighthouse/Web Vitals/bundle totals UNVERIFIED.** No Lighthouse binary was installed; no dependencies were installed. Headless Chrome at 390×844 reached a Hostinger browser challenge (title “Checking your browser…”), so its measurements would describe the challenge, not the store. Do not use those as store performance scores. Need authorized browser access through the challenge, a representative mobile run and field CrUX/RUM data. No full production build was run because build-time code can contact live integrations and modifies build output.

Security headers observed: HSTS, nosniff, SAMEORIGIN, referrer and permissions policies. CSP is only `upgrade-insecure-requests`; it does not restrict scripts or mitigate the demonstrated HTML sanitizer failure. Auth/checkout/admin handlers inspected have no application rate limiting. Hostinger WAF/rate-limit configuration UNVERIFIED. CSRF, SQLi and SSRF exploit tests were not performed. PostgREST filter strings interpolate untrusted IDs in several routes (admin stock :211; checkout :61); replace with validated identifiers and explicit lookup logic. This is not proof of arbitrary raw SQL injection. Mail iframe has sandbox attributes; that alone does not make unsanitized product HTML safe.

`npm audit --json --ignore-scripts` exit 1: **4 affected package entries: 1 critical, 2 high, 1 moderate** (Next, nested PostCSS, Zod, postcss-selector-parser). This is package advisory severity; applicability of each exploit to current hosting/features is UNVERIFIED. Next 14.2.35 installed. See emitted advisory references, including [Next advisory](https://github.com/advisories/GHSA-q4gf-8mx6-v5v3), [PostCSS advisory](https://github.com/advisories/GHSA-r28c-9q8g-f849), [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). Do not blindly run npm audit fix --force; review supported upgrades and regression coverage.

Local secret scan found committed privileged JWTs and database-password URLs. A selected history scan covered 3,374 object entries, inspecting text blobs ≤2 MB and skipping binary assets; three blobs matched service-role JWT/Stripe-live patterns (two script paths and historical src/lib/supabase.ts). This scan was **not exhaustive** across all secret formats, unreachable objects, remotes or deleted branches. Provider-key validity and all historical exposures remain UNVERIFIED. No service-role environment value has been proven present in the browser bundle. Client Supabase module has no server-only guard; its non-public env use normally stays server-side, but built bundle scanning is still required. Hardcoded client admin passwords are confirmed source exposure.

CGV and mentions légales return 200. The guessed privacy URL `/politique-de-confidentialite/` returns 404; this alone does not establish absence of all privacy disclosures. Footer links the two legal routes (`Footer.tsx:117`). Legal content sufficiency, controller/contact/retention/cross-border disclosure and nLPD/GDPR applicability require qualified review. Consent source grants analytics/ad storage by default until an explicit saved false choice. See current [PFPDT cookie guidance](https://www.edoeb.admin.ch/fr/mise-a-jour-du-guide-sur-les-cookies); Swiss and EU obligations differ, so this report does not pronounce a legal violation solely from that default.

Product claims such as “Action Anti-Inflammatoire” and glycemia/insulin-sensitivity benefits appeared on the homepage. Treat them as **review risks**, not automatically adjudicated violations. [OSAV claims guidance](https://www.blv.admin.ch/fr/allegations-nutritionnelles-et-de-sante) and [Geneva supplement requirements](https://www.ge.ch/fabriquer-importer-vendre-complements-alimentaires/exigences-specifiques-complements-alimentaires) require appropriate authorized claims and conditions. Evidence of those conditions per product was not provided. Global “100% stock Suisse” wording should also be reconciled with actual Portugal fulfillment support.

VAT source config has reduced 2.6% and standard 8.1% categories (`lib/tax.ts:10`); order fallback estimates reduced VAT universally (`api/orders/route.ts:40`) and tax helpers round components to CHF .05 (`lib/tax.ts:33`, :43). Mixed baskets/accessory VAT, shipping allocation, CHF cent-vs-cash rounding and Stripe totals reconciliation are UNVERIFIED and need accountant-reviewed fixtures. No future VAT-rate assumption was used to recommend a change.

Code checks: `tsc --noEmit --incremental false` exit 0. Routing, delivery estimate, storefront gating, stock badge formatting and middleware scripts each exit 0. TypeScript strict=false. These tests do not cover persistence, RLS, authorization, concurrent payment, provider failures or full browser purchase. No lint command configured; lint not run. Dead-code and duplicate-logic removal should wait until functional baselines exist.

## 8. Prioritized fix plan — approval required

1. **Contain critical exposure:** agree maintenance/access containment on actual Hostinger deployment; rotate confirmed committed privileged credentials and Packlink key; preserve incident evidence; close PUBLIC ALL policies/privileged RPC and unauthenticated admin/mail/fulfillment/order routes. Prepare and test staging policies before production. Public storefront needs a deliberate read-only stock API rather than relying on an admin route.
2. **Stock correctness:** transactional inventory authority, error propagation, UI persisted-state verification, version protection, stock ledger; resolve parent/variant editing contract; move every paid-order/POS path to it. Review physical counts before reconciling existing stock. Regression tests cover all ranked paths.
3. **Payment/integration reliability:** canonical pricing, fail-closed inventory validation, verified TWINT/Resend/Sendcloud signatures; unique event ledger and atomic order transitions; durable retries and monitoring; remove production stubs; fix shipping table targets and ephemeral order fallback.
4. **High/medium remediation:** private attachments, upload validation, real customer history, supported dependency upgrades, quantity/ownership constraints, reproducible migrations and restore rehearsal, sanitizer/CSP, targeted rate limits, appropriate auth/CSRF controls.
5. **SEO/performance/compliance:** actual-host indexing configuration, canonical host redirects, verified sitemap/feed/schema equality; reduce payload/images and run genuine mobile Lighthouse/field metrics; qualified claims/privacy/VAT review with French fr-CH copy preserved.
6. **Swiss Post feature only after earlier gates:** implement approved label schema/bucket and admin-only flows, preview/live isolation, idempotency and explicit paid-label regeneration. Separate outside label from packing slip. No Phase 3 files/dependencies/migrations added now.

Each approved issue gets a small commit explaining what/why/verification, with report status updated. Production data reconciliation, credential changes, migration execution, deployment and billable label generation require explicit scope approval. Approval of this report alone should specify whether it authorizes local fixes only or also staging/production operations.

Phase 3 design constraint to resolve with Swiss Post documentation: a client-rendered label must not fabricate a billable IdentCode or present an unallocated QR/barcode as valid postage. Confirm the official barcode/QR allocation and acceptance requirements before producing Solution A. Keep it preview/packing-identification-only unless supplied identifiers are valid. Any real postage billing must have visible confirmation, including regeneration. Future `shipping_label_url` should reference a private storage object; generate fresh signed download URLs rather than depending on a persisted URL that expires. Need order batch/bin data before a truthful packing slip can include those fields.

## 9. UNVERIFIED register and required evidence

| Item | Needed to verify |
|---|---|
| Exact client's stock incident | Affected SKU/variant/origin, approximate time, which admin screen/action, request/response and server/DB logs; staging reproduction |
| Hostinger deployed commit/build/env and runtime logs | Read-only hPanel/MCP access or redacted deployment metadata and variable-name presence; do not paste secret values |
| Vercel relevance/preview parity | Correct team-scoped read access (current request 403); identify active previews and host protections |
| Supabase management advisors/logs/backups/Edge Functions | Correct project-scoped read access; connector currently lists unrelated project |
| All deployed environment values/consistency | Name-only environment inventories and private in-process target comparisons; local production file is not hosting truth |
| Complete migration replay/drift and constraints | Isolated staging DB built from baseline, automated schema diff, migrations ledger |
| Backup/PITR and recovery | Plan/retention configuration and isolated restore drill including storage |
| Stock concurrent/rollback/retry behavior | Staging transaction fixtures and controlled fault injection; no production writes |
| Admin CRUD/auth/CSRF/rate limits end-to-end | Staging admins/non-admin users, read/write tests and middleware/API checks |
| Payment/card/TWINT/refund/cancel/email lifecycle | Provider sandbox, controlled test users/inbox, verified webhook delivery/replay and order reconciliation |
| Search/filter/mobile/cart interactive behavior | Browser session through Hostinger challenge; Chrome/Safari/mobile manual/automated fixtures |
| Lighthouse/LCP/INP/CLS/bundle size | Store-loaded browser run, bundle stats from isolated build, field CrUX/RUM if available |
| Complete DNS/SSL/security-header coverage | DNS records, TLS expiry/chain across hosts, platform headers/WAF configuration |
| SEO metadata/schema/feeds at SKU level | Full URL crawl and current visible-stock/price parity fixtures; Search Console access for indexing effects |
| Credential validity/history/client bundle exposure | Rotation/access log review, broader redacted secret scanner, authenticated artifact scan; avoid testing leaked credentials |
| Privacy/claims/VAT conformity | Qualified Swiss/EU review, business registration/VAT treatment, ingredient/claim substantiation and tax fixtures |
| Direct Swiss Post labels | API contract/credentials/franking-license permissions, sandbox, physical printer and barcode scanner, Chrome/Safari one-page print tests |

## 10. Evidence appendices

### A. Read-only SQL evidence and inventory

The following query results contain schema/aggregates only. RLS and role privileges were read, never modified persistently. SET LOCAL ROLE was within a read-only transaction and rolled back.

```sql
SELECT schemaname, tablename, rowsecurity FROM pg_tables
WHERE schemaname IN ('public','storage') ORDER BY 1,2;
SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY 1,2;
SELECT has_function_privilege('anon','public.save_admin_product_full(jsonb)','EXECUTE');
-- true
SELECT to_regclass('supabase_migrations.schema_migrations'),to_regclass('cron.job');
-- null, null
-- In a separate READ ONLY transaction:
SET LOCAL ROLE anon;
SELECT count(*) visible_orders FROM public.orders;
-- 59
```

### B. Environment variable matrix

| Name | Local | Production file | Explicit references (sample) |
|---|---|---|---|
| `ADMIN_NOTIFICATION_EMAIL` | set | set | `src/lib/email/resend.ts:75`, `src/lib/email/resend.ts:740` |
| `ADMIN_REVALIDATE_SECRET` | absent/empty | set | `src/app/api/revalidate/route.ts:11` |
| `ALERT_EMAIL` | absent/empty | set | No explicit read found |
| `ALLOW_INDEXING` | absent/empty | absent/empty | `src/app/robots.ts:32` |
| `ANTHROPIC_API_KEY` | absent/empty | absent/empty | No explicit read found |
| `BING_SITE_VERIFICATION` | set | set | `src/app/layout.tsx:16` |
| `CHEAP_MODEL` | absent/empty | absent/empty | `src/lib/agents/llm.ts:10` |
| `CRON_SECRET` | absent/empty | set | `src/app/api/cron/agents/route.ts:7` |
| `DAILY_COST_CAP_USD` | absent/empty | set | `src/lib/agents/runner.ts:24` |
| `DATABASE_URL` | set | set | `scripts/import-woocommerce.ts:8`, `scripts/verify-acceptance.ts:7` |
| `DATAFORSEO_LOGIN` | absent/empty | absent/empty | `src/lib/agents/dataforseo.ts:7` |
| `DATAFORSEO_PASSWORD` | absent/empty | absent/empty | `src/lib/agents/dataforseo.ts:7` |
| `GA4_PROPERTY_ID` | set | set | No explicit read found |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | absent/empty | absent/empty | No explicit read found |
| `GOOGLE_SITE_VERIFICATION` | set | set | `src/app/layout.tsx:15` |
| `GSC_SITE_URL` | absent/empty | set | No explicit read found |
| `MAINTENANCE_MODE` | set | set | `src/middleware.ts:34` |
| `MARCO_EMAIL` | set | set | `src/lib/email/resend.ts:76`, `src/lib/email/resend.ts:740` |
| `MERCHANT_CENTER_ID` | set | set | No explicit read found |
| `META_CAPI_TOKEN` | absent/empty | absent/empty | `src/lib/meta-capi.ts:41` |
| `META_PIXEL_ID` | absent/empty | absent/empty | `src/lib/meta-capi.ts:40` |
| `NEXT_PUBLIC_FACEBOOK_URL` | absent/empty | set | `src/lib/schema/index.ts:6` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | set | set | No explicit read found |
| `NEXT_PUBLIC_GOOGLE_BUSINESS_URL` | set | set | `src/lib/schema/index.ts:7` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | set | set | `src/lib/schema/index.ts:5` |
| `NEXT_PUBLIC_MERCHANT_CENTER_ID` | set | set | `src/components/GoogleCustomerReviewsOptIn.tsx:28` |
| `NEXT_PUBLIC_SITE_URL` | set | set | `src/app/api/checkout/route.ts:172`, `src/app/feeds/merchant.xml/route.ts:59`, `src/app/robots.ts:31` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | set | set | No explicit read found |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | set | set | `scripts/update_label_transcription_db.js:4`, `src/lib/supabase.ts:4` |
| `NEXT_PUBLIC_SUPABASE_URL` | set | set | `scripts/update_label_transcription_db.js:3`, `src/lib/supabase.ts:3` |
| `NEXT_PUBLIC_TWINT_STORE_UUID` | set | set | `src/lib/twint.ts:7` |
| `NODE_ENV` | absent/empty | absent/empty | `src/app/api/webhooks/stripe/route.ts:25`, `src/lib/analytics.ts:61` |
| `OMAR_ADMIN_PASSWORD` | absent/empty | set | `src/app/api/teamomar/auth/route.ts:5` |
| `OMAR_EMAIL` | set | set | No explicit read found |
| `OPENAI_API_KEY` | absent/empty | absent/empty | No explicit read found |
| `ORCHESTRATOR_MODEL` | absent/empty | absent/empty | `src/lib/agents/llm.ts:8` |
| `PACKLINK_API_KEY` | set | set | `src/lib/packlink/client.ts:8`, `src/lib/packlink/client.ts:83` |
| `PAGESPEED_API_KEY` | absent/empty | absent/empty | No explicit read found |
| `PORT` | absent/empty | absent/empty | `scripts/check-geo-invariance.ts:4`, `scripts/check-sitemap.ts:8` |
| `RESEND_API_KEY` | set | set | `src/app/api/mail/route.ts:103`, `src/lib/email/resend.ts:23` |
| `RESEND_FROM_EMAIL` | set | set | `src/lib/email/resend.ts:29` |
| `SENDCLOUD_PUBLIC_KEY` | set | absent/empty | `src/lib/sendcloud/client.ts:73`, `src/lib/sendcloud/client.ts:108` |
| `SENDCLOUD_SECRET_KEY` | set | absent/empty | `src/lib/sendcloud/client.ts:109` |
| `SENDCLOUD_WEBHOOK_SECRET` | set | absent/empty | `src/app/api/webhooks/sendcloud/route.ts:8`, `src/app/api/webhooks/sendcloud/route.ts:8` |
| `STRIPE_SECRET_KEY` | set | set | `src/app/api/checkout/route.ts:8`, `src/app/api/checkout/session/route.ts:13`, `src/lib/stripe.ts:3` |
| `STRIPE_WEBHOOK_SECRET` | set | set | `src/app/api/webhooks/stripe/route.ts:130` |
| `SUPABASE_SERVICE_ROLE_KEY` | set | set | `scripts/update-swiss-inventory.mjs:6`, `scripts/update_label_transcription_db.js:4`, `src/lib/agents/db.ts:7` |
| `SUPABASE_URL` | set | set | `scripts/update-swiss-inventory.mjs:5`, `src/lib/agents/db.ts:7` |
| `TWINT_MAME_TOKEN` | set | set | `src/lib/twint.ts:11` |
| `TWINT_STORE_UUID` | set | set | `src/lib/twint.ts:7` |
| `TWINT_WEBHOOK_SECRET` | set | set | `src/lib/twint.ts:12` |
| `VERCEL_ENV` | absent/empty | absent/empty | `src/app/layout.tsx:50`, `src/app/robots.ts:32` |
| `WOOCOMMERCE_KEY` | absent/empty | absent/empty | No explicit read found |
| `WOOCOMMERCE_SECRET` | absent/empty | absent/empty | No explicit read found |
| `WOOCOMMERCE_URL` | absent/empty | set | No explicit read found |
| `WOO_CSV_PATH` | absent/empty | absent/empty | `scripts/import-woocommerce.ts:7`, `scripts/verify-acceptance.ts:6` |
| `WORKER_MODEL` | absent/empty | absent/empty | `src/lib/agents/llm.ts:9` |

The example-only OPENAI_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON, PAGESPEED_API_KEY, WOOCOMMERCE_KEY/SECRET have no explicit tracked reads in this scan. Some configured reporting IDs likewise have no explicit runtime reads. NODE_ENV/PORT/VERCEL_ENV are platform-provided candidates, not secrets; absence in local files is not itself a bug. Variables are not declared missing from deployed production without provider evidence. No dynamic bracket-style process.env reads found in scanned source.

### C. Complete live RLS inventory

| Schema.table | RLS | Policies |
|---|---|---|
| `public.approvals` | True | None |
| `public.artifacts` | True | None |
| `public.categories` | True | public_read_categories (SELECT, roles {public}); service_all_categories (ALL, roles {public}) |
| `public.citations` | True | None |
| `public.coaching_leads` | True | Allow public insert on coaching_leads (INSERT, roles {anon,authenticated}) |
| `public.cost_log` | True | None |
| `public.country_groups` | True | service_all_country_groups (ALL, roles {public}); public_read_country_groups (SELECT, roles {public}) |
| `public.delivery_rules` | True | public_read_delivery_rules (SELECT, roles {public}); service_all_delivery_rules (ALL, roles {public}) |
| `public.delivery_settings` | True | public_read_delivery_settings (SELECT, roles {public}); service_all_delivery_settings (ALL, roles {public}) |
| `public.emails` | True | service_role_all_emails (ALL, roles {service_role}) |
| `public.fulfillment_countries` | True | public_read_countries (SELECT, roles {public}) |
| `public.fulfillment_events` | True | service_all_events (ALL, roles {public}) |
| `public.fulfillment_origins` | True | public_read_origins (SELECT, roles {public}) |
| `public.fulfillment_shipments` | True | service_all_shipments (ALL, roles {public}) |
| `public.fulfillment_stock` | True | public_read_stock (SELECT, roles {public}) |
| `public.hero_banners` | True | Public can view active banners (SELECT, roles {public}); Service role full access on hero_banners (ALL, roles {public}) |
| `public.holidays` | True | service_all_holidays (ALL, roles {public}); public_read_holidays (SELECT, roles {public}) |
| `public.issues` | True | None |
| `public.keywords` | True | None |
| `public.newsletter_subscribers` | True | Allow public insert on newsletter_subscribers (INSERT, roles {anon,authenticated}) |
| `public.orders` | True | Allow public insert on orders (INSERT, roles {anon,authenticated}); Allow public read on own orders (SELECT, roles {anon,authenticated}) |
| `public.origin_country_rules` | True | public_read_rules (SELECT, roles {public}) |
| `public.outreach` | True | None |
| `public.pages` | True | None |
| `public.product_audit_log` | True | service_all_product_audit_log (ALL, roles {public}) |
| `public.product_categories` | True | service_all_product_categories (ALL, roles {public}); public_read_product_categories (SELECT, roles {public}) |
| `public.product_stock` | True | public_read_active_stock (SELECT, roles {public}); service_all_product_stock (ALL, roles {public}) |
| `public.product_tags` | True | service_all_product_tags (ALL, roles {public}); public_read_product_tags (SELECT, roles {public}) |
| `public.product_variants` | True | public_read_published_variants (SELECT, roles {public}); service_all_product_variants (ALL, roles {public}) |
| `public.products` | True | service_all_products (ALL, roles {public}); public_read_published_products (SELECT, roles {public}) |
| `public.rankings` | True | None |
| `public.serp_snapshots` | True | None |
| `public.tags` | True | service_all_tags (ALL, roles {public}); public_read_tags (SELECT, roles {public}) |
| `public.tasks` | True | None |
| `storage.bucket_lifecycle_states` | True | None |
| `storage.buckets` | True | None |
| `storage.buckets_analytics` | True | None |
| `storage.buckets_vectors` | True | None |
| `storage.lifecycle_abandoned_artifacts` | True | None |
| `storage.migrations` | True | None |
| `storage.objects` | True | None |
| `storage.s3_multipart_uploads` | True | None |
| `storage.s3_multipart_uploads_parts` | True | None |
| `storage.vector_indexes` | True | None |

Full policy predicates, verbatim schema metadata:

```json
[
  {
    "schemaname": "public",
    "tablename": "categories",
    "policyname": "public_read_categories",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "categories",
    "policyname": "service_all_categories",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "coaching_leads",
    "policyname": "Allow public insert on coaching_leads",
    "roles": "{anon,authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "country_groups",
    "policyname": "service_all_country_groups",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "country_groups",
    "policyname": "public_read_country_groups",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "delivery_rules",
    "policyname": "public_read_delivery_rules",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "delivery_rules",
    "policyname": "service_all_delivery_rules",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "delivery_settings",
    "policyname": "public_read_delivery_settings",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "delivery_settings",
    "policyname": "service_all_delivery_settings",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "emails",
    "policyname": "service_role_all_emails",
    "roles": "{service_role}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "fulfillment_countries",
    "policyname": "public_read_countries",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "fulfillment_events",
    "policyname": "service_all_events",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "fulfillment_origins",
    "policyname": "public_read_origins",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "fulfillment_shipments",
    "policyname": "service_all_shipments",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "fulfillment_stock",
    "policyname": "public_read_stock",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "hero_banners",
    "policyname": "Public can view active banners",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "hero_banners",
    "policyname": "Service role full access on hero_banners",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "holidays",
    "policyname": "service_all_holidays",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "holidays",
    "policyname": "public_read_holidays",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "newsletter_subscribers",
    "policyname": "Allow public insert on newsletter_subscribers",
    "roles": "{anon,authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "orders",
    "policyname": "Allow public insert on orders",
    "roles": "{anon,authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "orders",
    "policyname": "Allow public read on own orders",
    "roles": "{anon,authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "origin_country_rules",
    "policyname": "public_read_rules",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_audit_log",
    "policyname": "service_all_product_audit_log",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_categories",
    "policyname": "service_all_product_categories",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_categories",
    "policyname": "public_read_product_categories",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_stock",
    "policyname": "public_read_active_stock",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((is_active = true) AND (product_id IN ( SELECT products.id\n   FROM products\n  WHERE ((products.status = 'published'::text) AND (products.deleted_at IS NULL)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_stock",
    "policyname": "service_all_product_stock",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_tags",
    "policyname": "service_all_product_tags",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_tags",
    "policyname": "public_read_product_tags",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_variants",
    "policyname": "public_read_published_variants",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(product_id IN ( SELECT products.id\n   FROM products\n  WHERE ((products.status = 'published'::text) AND (products.deleted_at IS NULL))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "product_variants",
    "policyname": "service_all_product_variants",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "products",
    "policyname": "service_all_products",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "products",
    "policyname": "public_read_published_products",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((status = 'published'::text) AND (deleted_at IS NULL))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "tags",
    "policyname": "service_all_tags",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "tags",
    "policyname": "public_read_tags",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  }
]
```

### D. Live schema fields, constraints and indexes

Column inventory uses `?` for nullable; defaults omitted from this compact view. Review is metadata only, without customer row data.

- **approvals**: `id:uuid`, `artifact_id:uuid`, `status:text`, `reviewer:text?`, `comment:text?`, `decided_at:timestamp with time zone?`, `created_at:timestamp with time zone?`
- **artifacts**: `id:uuid`, `task_id:uuid?`, `agent:text`, `kind:text`, `url:text?`, `content:jsonb`, `version:integer?`, `created_at:timestamp with time zone?`
- **categories**: `id:uuid`, `name:text`, `slug:text`, `created_at:timestamp with time zone?`
- **citations**: `id:uuid`, `prompt:text`, `engine:text`, `brand_cited:boolean?`, `our_url_cited:text?`, `cited_domains:jsonb?`, `answer_excerpt:text?`, `captured_on:date?`
- **coaching_leads**: `id:uuid`, `first_name:text`, `last_name:text`, `email:text`, `phone:text?`, `goal:text?`, `current_activity:text?`, `dietary_habits:text?`, `message:text?`, `status:text`, `created_at:timestamp with time zone?`
- **cost_log**: `id:uuid`, `agent:text?`, `model:text?`, `input_tokens:integer?`, `output_tokens:integer?`, `cost_usd:numeric?`, `logged_at:timestamp with time zone?`
- **country_groups**: `code:text`, `name:text`, `countries:ARRAY`, `updated_at:timestamp with time zone?`
- **delivery_rules**: `id:uuid`, `origin:text`, `country_code:character?`, `country_group:text?`, `shipping_method:text?`, `is_allowed:boolean`, `handling_days:integer`, `cutoff_time:text`, `transit_min_days:integer`, `transit_max_days:integer`, `requires_customs:boolean`, `customs_buffer_days:integer`, `delivers_saturday:boolean`, `is_active:boolean`, `needs_verification:boolean`, `updated_at:timestamp with time zone?`
- **delivery_settings**: `id:text`, `extra_delay_days:integer`, `banner_text:text?`, `updated_at:timestamp with time zone?`
- **emails**: `id:uuid`, `resend_id:text?`, `message_id:text?`, `folder:text`, `from_name:text?`, `from_email:text`, `to_emails:ARRAY`, `cc_emails:ARRAY?`, `bcc_emails:ARRAY?`, `reply_to:text?`, `subject:text`, `snippet:text?`, `body_text:text?`, `body_html:text?`, `attachments:jsonb?`, `is_read:boolean`, `is_starred:boolean`, `is_deleted:boolean`, `deleted_at:timestamp with time zone?`, `metadata:jsonb?`, `created_at:timestamp with time zone`, `updated_at:timestamp with time zone`
- **fulfillment_countries**: `code:character`, `name:text`, `is_eu:boolean`, `is_supported:boolean`, `requires_customs_from_portugal:boolean`, `requires_customs_from_geneva:boolean`
- **fulfillment_events**: `id:uuid`, `shipment_id:uuid?`, `event_type:text`, `payload:jsonb?`, `created_at:timestamp with time zone?`
- **fulfillment_origins**: `id:text`, `name:text`, `contact_email:text`, `company:text`, `street:text`, `city:text`, `postal_code:text`, `country_code:character`, `sendcloud_sender_address_id:text?`, `is_active:boolean`, `created_at:timestamp with time zone?`
- **fulfillment_shipments**: `id:uuid`, `order_id:text`, `origin_id:text?`, `status:text`, `carrier:text?`, `carrier_code:text?`, `sendcloud_parcel_id:text?`, `tracking_number:text?`, `tracking_url:text?`, `shipping_cost:numeric?`, `requires_customs:boolean`, `label_url:text?`, `items:jsonb`, `shipping_address:jsonb?`, `customs_data:jsonb?`, `notes:text?`, `needs_attention:boolean`, `attention_reason:text?`, `created_at:timestamp with time zone?`, `updated_at:timestamp with time zone?`, `promised_date:date?`, `delivered_at:timestamp with time zone?`, `fulfilment_location:text?`
- **fulfillment_stock**: `id:uuid`, `product_id:text`, `product_sku:text`, `variant_sku:text?`, `origin_id:text?`, `quantity:integer`, `reserved_quantity:integer`, `hs_code:text?`, `country_of_manufacture:character?`, `weight_grams:integer?`, `updated_at:timestamp with time zone?`
- **hero_banners**: `id:uuid`, `product_name:text`, `brand:text`, `tag:text?`, `badge:text`, `wide_image:text`, `mobile_image:text?`, `link:text`, `cta_text:text`, `sort_order:integer`, `is_active:boolean`, `created_at:timestamp with time zone`, `updated_at:timestamp with time zone`
- **holidays**: `id:uuid`, `calendar:text`, `date:date`, `name:text`
- **issues**: `id:uuid`, `url:text?`, `kind:text`, `severity:text`, `details:jsonb?`, `status:text?`, `first_seen:timestamp with time zone?`, `resolved_at:timestamp with time zone?`
- **keywords**: `id:uuid`, `keyword:text`, `country:text?`, `language:text?`, `volume:integer?`, `difficulty:integer?`, `intent:text?`, `cluster:text?`, `target_url:text?`, `priority:integer?`, `status:text?`, `updated_at:timestamp with time zone?`
- **newsletter_subscribers**: `id:uuid`, `email:text`, `subscribed_at:timestamp with time zone?`
- **orders**: `id:uuid`, `order_number:text`, `customer_name:text`, `customer_email:text`, `customer_phone:text?`, `shipping_address:jsonb`, `items:jsonb`, `total_amount:numeric`, `currency:text`, `payment_method:text`, `status:text`, `created_at:timestamp with time zone?`, `fulfilled_by:text?`, `fulfillment_origin:text?`
- **origin_country_rules**: `id:uuid`, `origin_id:text?`, `country_code:character?`, `is_allowed:boolean`, `preferred_for_common:boolean`, `estimated_days_min:integer`, `estimated_days_max:integer`, `free_shipping_threshold:numeric?`
- **outreach**: `id:uuid`, `target_name:text?`, `target_url:text?`, `kind:text?`, `contact:text?`, `status:text?`, `brief:jsonb?`, `owner:text?`, `updated_at:timestamp with time zone?`
- **pages**: `id:uuid`, `url:text`, `page_type:text`, `primary_keyword:text?`, `status:text?`, `indexed:boolean?`, `last_published_at:timestamp with time zone?`, `last_audited_at:timestamp with time zone?`
- **product_audit_log**: `id:uuid`, `product_id:uuid?`, `user_id:text?`, `action:text`, `old_values:jsonb?`, `new_values:jsonb?`, `created_at:timestamp with time zone?`
- **product_categories**: `product_id:uuid`, `category_id:uuid`
- **product_stock**: `id:uuid`, `product_id:uuid`, `variant_id:uuid?`, `origin_id:text`, `quantity:integer`, `is_active:boolean`, `reserved_quantity:integer`, `updated_at:timestamp with time zone?`
- **product_tags**: `product_id:uuid`, `tag_id:uuid`
- **product_variants**: `id:uuid`, `product_id:uuid`, `woo_id:text?`, `sku:text?`, `attribute_name:text`, `attribute_value:text`, `price:numeric`, `compare_at_price:numeric?`, `image_url:text?`, `stock_geneva:integer`, `stock_portugal:integer`, `weight_grams:integer?`, `created_at:timestamp with time zone?`, `updated_at:timestamp with time zone?`, `gtin13:text?`
- **products**: `id:uuid`, `woo_id:text?`, `sku:text?`, `normalized_name:text`, `name:text`, `slug:text`, `type:text`, `status:text`, `main_location:text`, `brand:text?`, `base_price:numeric`, `compare_at_price:numeric?`, `weight_grams:integer?`, `weight_kg:numeric?`, `short_description:text?`, `description:text?`, `images:jsonb`, `is_featured:boolean`, `deleted_at:timestamp with time zone?`, `created_at:timestamp with time zone?`, `updated_at:timestamp with time zone?`, `gtin13:text?`, `nutrition:jsonb?`, `ingredients:text?`, `allergens:text?`, `usage_instructions:text?`, `stock_geneva:integer?`, `stock_portugal:integer?`
- **publishable_artifacts**: `id:uuid?`, `task_id:uuid?`, `agent:text?`, `kind:text?`, `url:text?`, `content:jsonb?`, `version:integer?`, `created_at:timestamp with time zone?`
- **rankings**: `id:uuid`, `keyword:text`, `url:text?`, `position:numeric?`, `impressions:integer?`, `clicks:integer?`, `ctr:numeric?`, `source:text?`, `captured_on:date`
- **serp_snapshots**: `id:uuid`, `keyword:text`, `captured_at:timestamp with time zone?`, `results:jsonb`
- **tags**: `id:uuid`, `name:text`, `slug:text`, `created_at:timestamp with time zone?`
- **tasks**: `id:uuid`, `agent:text`, `type:text`, `payload:jsonb`, `status:text`, `priority:integer?`, `attempts:integer?`, `max_attempts:integer?`, `parent_task_id:uuid?`, `requires_approval:boolean?`, `result_artifact_id:uuid?`, `error:text?`, `cost_usd:numeric?`, `created_by:text?`, `created_at:timestamp with time zone?`, `updated_at:timestamp with time zone?`

Live constraint definitions:

```text
approvals.approvals_artifact_id_fkey: FOREIGN KEY (artifact_id) REFERENCES artifacts(id)
approvals.approvals_pkey: PRIMARY KEY (id)
artifacts.artifacts_pkey: PRIMARY KEY (id)
artifacts.artifacts_task_id_fkey: FOREIGN KEY (task_id) REFERENCES tasks(id)
categories.categories_name_key: UNIQUE (name)
categories.categories_pkey: PRIMARY KEY (id)
categories.categories_slug_key: UNIQUE (slug)
citations.citations_pkey: PRIMARY KEY (id)
coaching_leads.coaching_leads_pkey: PRIMARY KEY (id)
cost_log.cost_log_pkey: PRIMARY KEY (id)
country_groups.country_groups_pkey: PRIMARY KEY (code)
delivery_rules.delivery_rules_country_group_fkey: FOREIGN KEY (country_group) REFERENCES country_groups(code) ON DELETE SET NULL
delivery_rules.delivery_rules_origin_check: CHECK ((origin = ANY (ARRAY['GENEVA'::text, 'PORTUGAL'::text])))
delivery_rules.delivery_rules_pkey: PRIMARY KEY (id)
delivery_rules.target_check: CHECK (((country_code IS NOT NULL) OR (country_group IS NOT NULL)))
delivery_settings.delivery_settings_pkey: PRIMARY KEY (id)
emails.emails_folder_check: CHECK ((folder = ANY (ARRAY['inbox'::text, 'sent'::text, 'trash'::text, 'drafts'::text, 'archive'::text])))
emails.emails_pkey: PRIMARY KEY (id)
fulfillment_countries.fulfillment_countries_pkey: PRIMARY KEY (code)
fulfillment_events.fulfillment_events_pkey: PRIMARY KEY (id)
fulfillment_events.fulfillment_events_shipment_id_fkey: FOREIGN KEY (shipment_id) REFERENCES fulfillment_shipments(id) ON DELETE CASCADE
fulfillment_origins.fulfillment_origins_id_check: CHECK ((id = ANY (ARRAY['GENEVA'::text, 'PORTUGAL'::text])))
fulfillment_origins.fulfillment_origins_pkey: PRIMARY KEY (id)
fulfillment_shipments.fulfillment_shipments_origin_id_fkey: FOREIGN KEY (origin_id) REFERENCES fulfillment_origins(id)
fulfillment_shipments.fulfillment_shipments_pkey: PRIMARY KEY (id)
fulfillment_shipments.fulfillment_shipments_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'label_created'::text, 'label_printed'::text, 'in_transit'::text, 'delivered'::text, 'exception'::text, 'needs_attention'::text, 'cancelled'::text])))
fulfillment_stock.fulfillment_stock_origin_id_fkey: FOREIGN KEY (origin_id) REFERENCES fulfillment_origins(id) ON DELETE CASCADE
fulfillment_stock.fulfillment_stock_pkey: PRIMARY KEY (id)
fulfillment_stock.fulfillment_stock_product_id_variant_sku_origin_id_key: UNIQUE (product_id, variant_sku, origin_id)
hero_banners.hero_banners_pkey: PRIMARY KEY (id)
holidays.holidays_calendar_date_key: UNIQUE (calendar, date)
holidays.holidays_pkey: PRIMARY KEY (id)
issues.issues_pkey: PRIMARY KEY (id)
keywords.keywords_keyword_key: UNIQUE (keyword)
keywords.keywords_pkey: PRIMARY KEY (id)
newsletter_subscribers.newsletter_subscribers_email_key: UNIQUE (email)
newsletter_subscribers.newsletter_subscribers_pkey: PRIMARY KEY (id)
orders.orders_order_number_key: UNIQUE (order_number)
orders.orders_pkey: PRIMARY KEY (id)
origin_country_rules.origin_country_rules_country_code_fkey: FOREIGN KEY (country_code) REFERENCES fulfillment_countries(code) ON DELETE CASCADE
origin_country_rules.origin_country_rules_origin_id_country_code_key: UNIQUE (origin_id, country_code)
origin_country_rules.origin_country_rules_origin_id_fkey: FOREIGN KEY (origin_id) REFERENCES fulfillment_origins(id) ON DELETE CASCADE
origin_country_rules.origin_country_rules_pkey: PRIMARY KEY (id)
outreach.outreach_pkey: PRIMARY KEY (id)
pages.pages_pkey: PRIMARY KEY (id)
pages.pages_url_key: UNIQUE (url)
product_audit_log.product_audit_log_pkey: PRIMARY KEY (id)
product_audit_log.product_audit_log_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
product_categories.product_categories_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
product_categories.product_categories_pkey: PRIMARY KEY (product_id, category_id)
product_categories.product_categories_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
product_stock.product_stock_origin_id_fkey: FOREIGN KEY (origin_id) REFERENCES fulfillment_origins(id) ON DELETE CASCADE
product_stock.product_stock_pkey: PRIMARY KEY (id)
product_stock.product_stock_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
product_stock.product_stock_product_variant_origin_uniq: UNIQUE NULLS NOT DISTINCT (product_id, variant_id, origin_id)
product_stock.product_stock_variant_id_fkey: FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
product_tags.product_tags_pkey: PRIMARY KEY (product_id, tag_id)
product_tags.product_tags_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
product_tags.product_tags_tag_id_fkey: FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
product_variants.product_variants_pkey: PRIMARY KEY (id)
product_variants.product_variants_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
products.products_main_location_check: CHECK ((main_location = ANY (ARRAY['GENEVA'::text, 'PORTUGAL'::text, 'COMMON'::text])))
products.products_pkey: PRIMARY KEY (id)
products.products_slug_key: UNIQUE (slug)
products.products_status_check: CHECK ((status = ANY (ARRAY['published'::text, 'draft'::text])))
products.products_type_check: CHECK ((type = ANY (ARRAY['simple'::text, 'variable'::text])))
rankings.rankings_keyword_url_source_captured_on_key: UNIQUE (keyword, url, source, captured_on)
rankings.rankings_pkey: PRIMARY KEY (id)
serp_snapshots.serp_snapshots_pkey: PRIMARY KEY (id)
tags.tags_name_key: UNIQUE (name)
tags.tags_pkey: PRIMARY KEY (id)
tags.tags_slug_key: UNIQUE (slug)
tasks.tasks_parent_task_id_fkey: FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
tasks.tasks_pkey: PRIMARY KEY (id)
```

Live index definitions:

```sql
CREATE UNIQUE INDEX approvals_pkey ON public.approvals USING btree (id);
CREATE UNIQUE INDEX artifacts_pkey ON public.artifacts USING btree (id);
CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);
CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);
CREATE UNIQUE INDEX citations_pkey ON public.citations USING btree (id);
CREATE UNIQUE INDEX coaching_leads_pkey ON public.coaching_leads USING btree (id);
CREATE UNIQUE INDEX cost_log_pkey ON public.cost_log USING btree (id);
CREATE UNIQUE INDEX country_groups_pkey ON public.country_groups USING btree (code);
CREATE UNIQUE INDEX delivery_rules_pkey ON public.delivery_rules USING btree (id);
CREATE INDEX idx_delivery_rules_lookup ON public.delivery_rules USING btree (origin, country_code, shipping_method, is_active);
CREATE UNIQUE INDEX delivery_settings_pkey ON public.delivery_settings USING btree (id);
CREATE UNIQUE INDEX emails_pkey ON public.emails USING btree (id);
CREATE INDEX idx_emails_created_at ON public.emails USING btree (created_at DESC);
CREATE INDEX idx_emails_folder ON public.emails USING btree (folder);
CREATE INDEX idx_emails_from_email ON public.emails USING btree (from_email);
CREATE INDEX idx_emails_is_deleted ON public.emails USING btree (is_deleted);
CREATE UNIQUE INDEX fulfillment_countries_pkey ON public.fulfillment_countries USING btree (code);
CREATE UNIQUE INDEX fulfillment_events_pkey ON public.fulfillment_events USING btree (id);
CREATE UNIQUE INDEX fulfillment_origins_pkey ON public.fulfillment_origins USING btree (id);
CREATE UNIQUE INDEX fulfillment_shipments_pkey ON public.fulfillment_shipments USING btree (id);
CREATE UNIQUE INDEX fulfillment_stock_pkey ON public.fulfillment_stock USING btree (id);
CREATE UNIQUE INDEX fulfillment_stock_product_id_variant_sku_origin_id_key ON public.fulfillment_stock USING btree (product_id, variant_sku, origin_id);
CREATE UNIQUE INDEX hero_banners_pkey ON public.hero_banners USING btree (id);
CREATE INDEX idx_hero_banners_active_sort ON public.hero_banners USING btree (is_active, sort_order);
CREATE UNIQUE INDEX holidays_calendar_date_key ON public.holidays USING btree (calendar, date);
CREATE UNIQUE INDEX holidays_pkey ON public.holidays USING btree (id);
CREATE INDEX idx_holidays_cal_date ON public.holidays USING btree (calendar, date);
CREATE UNIQUE INDEX issues_pkey ON public.issues USING btree (id);
CREATE UNIQUE INDEX keywords_keyword_key ON public.keywords USING btree (keyword);
CREATE UNIQUE INDEX keywords_pkey ON public.keywords USING btree (id);
CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);
CREATE UNIQUE INDEX newsletter_subscribers_pkey ON public.newsletter_subscribers USING btree (id);
CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);
CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);
CREATE UNIQUE INDEX origin_country_rules_origin_id_country_code_key ON public.origin_country_rules USING btree (origin_id, country_code);
CREATE UNIQUE INDEX origin_country_rules_pkey ON public.origin_country_rules USING btree (id);
CREATE UNIQUE INDEX outreach_pkey ON public.outreach USING btree (id);
CREATE UNIQUE INDEX pages_pkey ON public.pages USING btree (id);
CREATE UNIQUE INDEX pages_url_key ON public.pages USING btree (url);
CREATE INDEX product_audit_log_created_at_idx ON public.product_audit_log USING btree (created_at DESC);
CREATE UNIQUE INDEX product_audit_log_pkey ON public.product_audit_log USING btree (id);
CREATE INDEX product_audit_log_product_id_idx ON public.product_audit_log USING btree (product_id);
CREATE UNIQUE INDEX product_categories_pkey ON public.product_categories USING btree (product_id, category_id);
CREATE INDEX product_stock_origin_idx ON public.product_stock USING btree (origin_id);
CREATE UNIQUE INDEX product_stock_pkey ON public.product_stock USING btree (id);
CREATE INDEX product_stock_product_id_idx ON public.product_stock USING btree (product_id);
CREATE UNIQUE INDEX product_stock_product_variant_origin_uniq ON public.product_stock USING btree (product_id, variant_id, origin_id) NULLS NOT DISTINCT;
CREATE UNIQUE INDEX product_stock_uniq_idx ON public.product_stock USING btree (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id);
CREATE UNIQUE INDEX product_tags_pkey ON public.product_tags USING btree (product_id, tag_id);
CREATE UNIQUE INDEX product_variants_pkey ON public.product_variants USING btree (id);
CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);
CREATE UNIQUE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku) WHERE ((sku IS NOT NULL) AND (sku <> ''::text));
CREATE UNIQUE INDEX product_variants_woo_id_idx ON public.product_variants USING btree (woo_id) WHERE ((woo_id IS NOT NULL) AND (woo_id <> ''::text));
CREATE INDEX products_deleted_at_idx ON public.products USING btree (deleted_at);
CREATE INDEX products_normalized_name_idx ON public.products USING btree (normalized_name);
CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);
CREATE UNIQUE INDEX products_sku_idx ON public.products USING btree (sku) WHERE ((sku IS NOT NULL) AND (sku <> ''::text));
CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);
CREATE INDEX products_status_idx ON public.products USING btree (status);
CREATE UNIQUE INDEX products_woo_id_idx ON public.products USING btree (woo_id) WHERE ((woo_id IS NOT NULL) AND (woo_id <> ''::text));
CREATE UNIQUE INDEX rankings_keyword_url_source_captured_on_key ON public.rankings USING btree (keyword, url, source, captured_on);
CREATE UNIQUE INDEX rankings_pkey ON public.rankings USING btree (id);
CREATE UNIQUE INDEX serp_snapshots_pkey ON public.serp_snapshots USING btree (id);
CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);
CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);
CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);
CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);
CREATE INDEX tasks_status_idx ON public.tasks USING btree (status, priority, created_at);
```

### E. Secret locations (values excluded)

- `scripts/sync-portugal-products.ts:7`: jwt_role_service_role.
- `scripts/update-swiss-inventory.mjs:6`: jwt_role_service_role.
- `src/app/admin/products/ProductLocationManagerClient.tsx:29`: hardcoded_admin_credential.
- `src/app/admin/shipping/AdminShippingClient.tsx:34`: hardcoded_admin_credential.
- `src/app/mail/MailClient.tsx:35`: hardcoded_admin_credential.
- `src/app/wp-admin/AdminDashboardClient.tsx:62`: hardcoded_admin_credential.
- `scripts/add-missing-products-to-catalog.mjs:5`: embedded database credential.
- `scripts/download_product_images.js:20`: embedded database credential.
- `scripts/fix-broken-images.mjs:5`: embedded database credential.
- `scripts/import-woocommerce.ts:8`: embedded database credential.
- `scripts/migrate-images-to-supabase.mjs:22`: embedded database credential.
- `scripts/reassign-brands.mjs:5`: embedded database credential.
- `scripts/run-migrations.mjs:6`: embedded database credential.
- `scripts/sync-catalog-with-db.mjs:5`: embedded database credential.
- `scripts/sync-common-db.mjs:4`: embedded database credential.
- `scripts/sync-gtin-barcodes.mjs:7`: embedded database credential.
- `scripts/sync-prices-to-db.mjs:5`: embedded database credential.
- `scripts/sync-product-locations.mjs:4`: embedded database credential.
- `scripts/verify-acceptance.ts:7`: embedded database credential.
- `src/lib/packlink/client.ts:8`: embedded provider-key fallback.

Source-read tool outputs inadvertently exposed database and provider credential literals. They are not repeated here; include those credentials in the rotation and exposure review. No credentials were committed by this audit.

### F. Local checks

| Command | Exit | Scope |
|---|---:|---|
| `tsc --noEmit --incremental false` | 0 | Current TypeScript configuration (strict disabled) |
| `./node_modules/.bin/tsx src/lib/fulfillment/__tests__/routing.test.ts` | 0 | Existing local suite; no production writes |
| `./node_modules/.bin/tsx src/lib/delivery/__tests__/estimate.test.ts` | 0 | Existing local suite; no production writes |
| `./node_modules/.bin/tsx src/lib/delivery/__tests__/gating.test.ts` | 0 | Existing local suite; no production writes |
| `./node_modules/.bin/tsx src/lib/delivery/__tests__/stock.test.ts` | 0 | Existing local suite; no production writes |
| `./node_modules/.bin/tsx src/middleware.test.ts` | 0 | Existing local suite; no production writes |
| `npm audit --json --ignore-scripts` | 1 | 4 package entries: 1 critical/2 high/1 moderate |

Local fault-injection stock test and formatter injection test were executed in-memory. Stock test returned success despite two injected write errors. Formatter retained an onerror attribute. Neither contacted production.

**Approval gate:** Stop here. No Phase 2 or Phase 3 work is authorized by this report. Await the owner’s approval and operational scope.
