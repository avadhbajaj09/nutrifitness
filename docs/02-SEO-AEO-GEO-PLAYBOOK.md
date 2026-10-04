# SEO + AEO + GEO Playbook (what actually matters)

## 1. How the three layers relate
- **SEO**: earn rankings in Google's classic results and Shopping free listings.
- **AEO (answer engine optimisation)**: be the source for featured snippets, People Also Ask, voice and AI answers.
- **GEO (generative engine optimisation)**: be cited or recommended inside AI Overviews / AI Mode, ChatGPT Search, Perplexity, Gemini.
Google has said there is no separate algorithm for AI-search optimisation; sources that get cited in AI answers mostly already rank well and are clear, factual and well structured. Treat AEO/GEO as SEO done to a higher standard, plus third-party reputation. Several vendor studies (treat as directional, not exact): most e-commerce AI recommendations draw heavily on third-party sources (reviews, forums, media), and AI citations skew to recent content.

## 2. Technical SEO requirements
- Server-rendered or statically generated indexable pages (ISR). Price, stock, specs, reviews in HTML, not JS-only.
- Core Web Vitals (mobile): LCP < 2.0 s, INP < 200 ms, CLS < 0.05.
- Canonicals on every page; filter/sort/pagination parameters `noindex,follow` or canonicalised.
- `robots.txt`: allow Googlebot, Googlebot-Image, Bingbot. Decide explicitly about AI crawlers (OAI-SearchBot, PerplexityBot, Google-Extended). Block staging entirely.
- Split XML sitemaps (products, categories, blog, pages) with real `lastmod`. IndexNow ping on publish/update.
- One H1, logical H2/H3, breadcrumbs everywhere, descriptive internal anchors, no orphan pages, every product within 3 clicks.
- Locale: `fr-CH` signals everywhere. `hreflang` only if more than one language exists.
- Custom 404; 410 for permanently removed products; every moved URL gets one 301.
- One GA4 property, one GTM container, consent mode v2.

## 3. Structured data (JSON-LD, generated from typed code, validated in CI)
- Organization + WebSite (home), LocalBusiness/Store (Geneva shop page; NAP identical to Google Business Profile).
- Product + Offer (price in CHF, availability, `priceValidUntil` only when real), brand, GTIN where available, AggregateRating/Review only from real reviews, shipping details, MerchantReturnPolicy.
- BreadcrumbList on every page; ItemList on categories; FAQPage only for genuine visible Q&A; Article/BlogPosting with author and dates on guides.
- Rule: schema must match visible content exactly. A mismatch can cost eligibility.

## 4. Google Shopping / Merchant Center
- Free listings need a feed (Merchant API) with: id, title, description, link, image_link, additional_image_link, price, availability, brand, GTIN/MPN, condition, shipping, return policy, product_type, google_product_category.
- Images: minimum 500 × 500 px for all products (enforced from 31 Jan 2027; undersized images get disapproved); Google recommends 1500 × 1500 px or larger. Max 64 MP / 16 MB. No watermarks or promo overlays; do not upscale or use thumbnails. Allow Googlebot-Image in robots.
- Optional `video_link` attribute now exists for product videos.
- Title pattern: Brand + product type + variant + size. Monitor Diagnostics weekly; agents alert on any disapproval.

## 5. Content standards (SEO + AEO)
- Answer-first: the first 40–60 words answer the page's main question.
- Unique, helpful, experience-based content beats volume. Add information gain: price-per-serving, dosage guides, comparison tables, in-shop staff advice, real customer questions.
- E-E-A-T: named authors/reviewers with credentials, "reviewed on" dates, sources (EFSA, Swiss FSVO, studies), real shop photos and address.
- Question-style H2/H3, short paragraphs, tables, lists. Update top pages every 60–90 days with a visible "last updated".
- Compliance: no medical or disease claims; health/nutrition claims reviewed against Swiss food-law rules by the client.

## 6. GEO / AI-visibility tactics
- Consistent entity data: same brand name, address, hours, description everywhere (site, GBP, directories, social).
- Clear, declarative, fact-dense product pages and comparison guides (AI engines cite guides and FAQs more than single product pages).
- Third-party mentions: reviews, forum/Reddit participation (disclosed), media, partner pages, creator reviews.
- Freshness: update pages and publish regularly.
- `llms.txt` at the root is cheap to add but unproven; keep it, do not rely on it.
- Track weekly: run 50–100 target prompts on ChatGPT, Perplexity, Gemini, Google AI Mode; log whether the brand or URL is cited, who is, and which sources are used (table `citations`).

## 7. Local SEO (Geneva shop)
- Complete Google Business Profile: correct categories, hours, products, photos weekly, posts, Q&A, review requests.
- Local landing page `/magasin-geneve/` with NAP, map, transport/parking, photos, reviews, LocalBusiness schema.
- Swiss directories (local.ch, search.ch and relevant sports/health listings), consistent NAP.

## 8. Authority / off-site
See `docs/06`. Quality over volume: 15–30 genuine referring domains in 60 days. No PBNs, no bought link packages.

## 9. What not to do
Duplicate manufacturer text · keyword stuffing · fake reviews · schema that does not match the page · indexable staging · redirect chains · AI text published without fact-check and human approval · health claims.
