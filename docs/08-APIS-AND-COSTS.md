# APIs, Tools and Costs

Check current pricing on each provider's site before buying; figures change.

| Service | Used for | Required | Cost type |
|---|---|---|---|
| Anthropic API | Orchestrator + agents (Opus for planning, Sonnet for writing, Haiku for cheap checks) | Yes | Usage |
| OpenAI API | Second opinion / AI-visibility checks on ChatGPT-style answers | Optional | Usage |
| DataForSEO | Keyword volume/difficulty/suggestions, SERP snapshots, rank tracking | Yes | Pay-as-you-go |
| Google Search Console API | Real queries, clicks, positions, indexing | Yes | Free |
| Google Analytics 4 (Data API) | Traffic, conversions | Yes | Free |
| Google Merchant Center (Merchant API) | Product feed, diagnostics | Yes | Free |
| PageSpeed Insights API | Core Web Vitals checks | Yes | Free |
| Google Keyword Planner | Volume ranges | Optional | Free with Ads account |
| Supabase | Agent memory, tasks, approvals | Yes | Free tier or low monthly |
| Vercel | Hosting + cron | Yes | Free or Pro |
| Resend | Alert and report emails | Yes | Free tier |
| WooCommerce REST API keys | Product/order data (Option A) | Yes (A) | Free |
| Perplexity / Gemini API | AI-citation tracking | Optional | Usage |
| Review platform (Trustpilot / Avis Vérifiés) | Review markup + trust | Recommended | Subscription |

## Setup checklist
1. Verify `nutrifitness.ch` as a Domain property in Search Console; add the service account as a user (Restricted → Full).
2. GA4: add the service account as Viewer. Copy the Property ID.
3. Merchant Center: add the service account; copy the Merchant ID.
4. DataForSEO: create account, fund a small balance, copy login/password.
5. Supabase: new project; run the migration; copy URL + service-role key (server only).
6. Vercel: set env vars, enable cron, set `CRON_SECRET`.
7. WooCommerce: create read-only REST API keys.
8. Set `DAILY_COST_CAP_USD` (suggest low at first and raise after week 2).

## Cost control
Haiku for classification and checks; Sonnet for drafting; Opus only for the weekly plan. Cache SERP and keyword results for 7 days. Daily cap with automatic halt.
