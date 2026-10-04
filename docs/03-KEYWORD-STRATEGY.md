# Keyword Strategy (measure, do not guess)

## Data sources (no Ahrefs needed)
1. **Google Search Console** (free): real queries, impressions, positions. Highest value: queries at positions 8–30 ("almost ranking").
2. **Google Keyword Planner** (free with an Ads account): volume ranges.
3. **DataForSEO API** (pay-as-you-go): volume, difficulty, suggestions, SERP results, rank tracking. Switzerland `location_code=2756`, `language_code=fr`. Verify endpoints in the DataForSEO docs.
4. SERP features by hand: autocomplete, People Also Ask, related searches.

## Method
1. **Seed list** (hypotheses to validate, French + Swiss): whey protéine, protéine végétale, créatine, créatine monohydrate, BCAA, EAA, pré-workout, gainer, barres protéinées, magnésium bisglycinate, ashwagandha, oméga 3, zinc, collagène, caféine, électrolytes, compléments alimentaires sport, magasin nutrition sportive Genève, acheter {produit} Suisse, {marque} {produit} prix, {marque} Suisse.
2. **Brand + product queries first.** Catalogue has 101 branded products (Marvelous, Bigman, Pronutrition, Dirty Squads, Applied Nutrition, Ghost, Optimum Nutrition, Dymatize, etc.). "{brand} {product} Suisse/prix/avis" is usually the easiest win and exactly what Shopping listings serve.
3. **Expand** with suggestions, related terms and competitor keywords (top 5 Swiss competitors).
4. **Filter wave 1**: difficulty ≤ 25–30, volume ≥ 20/month, intent matches a page we can build, Swiss-French or French variant.
5. **Cluster by intent**: transactional (product/category), commercial investigation (comparison/best), informational (guide/FAQ), local (Genève).
6. **One primary keyword per URL.** Detect and fix cannibalisation (two URLs competing for one query).
7. **Output** `keywords` table / CSV: keyword → URL (existing/new) → intent → volume → difficulty → priority → owner agent → status.
8. **Refresh monthly**; recheck positions weekly for the top 100.

## Page-type targeting
| Page type | Target pattern | Example (hypothesis) |
|---|---|---|
| Product | brand + product + size/flavour | "créatine monohydrate applied nutrition 250 g" |
| Category | generic product term + Suisse | "protéine whey Suisse", "créatine Genève" |
| Brand | brand + Suisse | "Marvelous Nutrition Suisse" |
| Guide | question/comparison | "créatine : quand la prendre", "whey vs protéine végétale" |
| Local | shop + city | "magasin nutrition sportive Genève" |

## Quality gates for a keyword
Intent is clear · we can credibly satisfy it · a page for it exists or is planned · not already served by another of our pages · not a prohibited health claim.
