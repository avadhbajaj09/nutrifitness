# NutriFitness security rollout — November 2026

**Do not deploy the staff-authentication PR before configuring the following server-side variables.** Login deliberately fails closed when credentials are absent. Never commit secret values or share them in chats or issues.

## 1. Revoke and rotate historical passwords

Previous versions included administrator and Portugal warehouse passwords in browser-facing code and a hard-coded revalidation secret. Assume these historic passwords are compromised, including Git history. Replace credentials in every place where they were reused.

Required on the *actual NutriFitness production host*:

| Variable | Required value |
| --- | --- |
| ADMIN_SESSION_SECRET | Cryptographically random, at least 32 characters |
| NUTRIFITNESS_ADMIN_PASSWORD | New, unique administrator password of at least 12 characters |
| OMAR_ADMIN_PASSWORD | Different new warehouse password of at least 12 characters |
| MAINTENANCE_PREVIEW_SECRET | Optional random preview-bypass token of at least 24 characters |
| ADMIN_REVALIDATE_SECRET | New revalidation secret; required by separate PR #1 |
| CRON_SECRET | Secret used to authenticate the agents cron endpoint |

Update any cache-revalidation callers to send the new ADMIN_REVALIDATE_SECRET, because the historical fallback is removed by PR #1.

## 2. Staging checks

Set these variables in a secure **preview** deployment first. Verify that preview robots.txt blocks indexing but production robots.txt allows search crawlers.

Run:
- npm run typecheck
- npm run test:middleware
- npm run test:cart-restore
- npm run test:order-auth
- npm run test:delivery
- npm run test:gating
- npm run test:stock
- npm run test:routing

Functional checks:
1. Anonymous admin, warehouse, mail and order endpoints return HTTP 401.
2. Admin, inventory manager, mail console and Portugal warehouse logins function with distinct passwords.
3. Staff cookies are HttpOnly, Secure over HTTPS, and SameSite=Strict. Logout removes the cookie.
4. Store browsing, public stock display, cart, checkout and real paid Stripe orders still work.
5. POS sales work only for authenticated administrators. Forged unpaid customer orders fail.
6. Repeat Stripe success-page visits do not duplicate orders or confirmation emails.
7. Contact form, legitimate incoming email and transactional webhooks continue working.
8. Fresh abandoned-cart recovery emails contain an expiring signed link. Old unsigned links intentionally no longer reveal personal data; resend a new link as needed.
9. Packlink shipping, warehouse workflow, delivery and stock operations work correctly when authenticated.
10. Products, robots.txt, sitemap and structured data remain consistent with production.

## 3. Release protocol

Record a rollback point, verify backups, test a preview, and deploy only to the confirmed NutriFitness host. Monitor server logs and checkout processing following deployment. Recheck Google Search Console and Merchant Center indexing and feed diagnostics.

## Follow-up security improvements

- Storefront stock currently reads a public GET endpoint under /api/admin/stock; migrate it to a dedicated public inventory representation.
- Public contact and abandoned-cart endpoints need distributed login/abuse rate limiting at the host or WAF layer.
- Dependency audit has reported multiple vulnerabilities. Upgrade frameworks and libraries in a separately tested compatibility release.
- Verify the provenance of customer review data and product claims; do not publish invented ratings or guarantees.
