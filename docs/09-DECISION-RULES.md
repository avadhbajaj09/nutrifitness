# Decision Rules (how the agents decide from results)

The Orchestrator runs this loop weekly (and the technical subset daily). Rules are deterministic first; the LLM only plans wording and effort. Mirrors `src/lib/agents/decisions.ts`.

## Per-URL classification (last 28 days from GSC + indexation status)
| Condition | Diagnosis | Action (task → agent) |
|---|---|---|
| Not indexed after 14 days | Technical/crawl | Inspect URL, fix canonical/robots/links, request indexing → Technical Auditor |
| Indexed, impressions < 10 | No visibility | Check keyword fit and cannibalisation; add internal links; strengthen intro → Internal Linking + Content Writer |
| Impressions ≥ 100, avg position 4–20 | Close to page 1 / top 3 | Expand content, add FAQ/table, add 3 internal links, refresh title → Content Writer |
| Position ≤ 10, CTR below expected for position | Weak snippet | Rewrite title + meta description (test 2 variants) → Content Writer |
| Position ≤ 3, clicks growing | Winner | Protect: refresh date, add related guide, build links to it → Off-Site |
| Position dropped ≥ 5 vs prior 28 days | Regression | Check changes, competitors, schema, speed; revert or refresh → Technical Auditor + Analyst |
| Two URLs rank for same query | Cannibalisation | Consolidate/canonicalise or re-target → Keyword Researcher |
| Product page disapproved in Merchant | Feed issue | Fix attribute/image, resubmit → Schema & Feed + Image |
| AI-citation absent for a priority prompt while competitors cited | GEO gap | Add direct-answer block, comparison table, third-party mention plan → GEO + Off-Site |

## Sprint planning
1. Rank open tasks by `impact × confidence ÷ effort`.
2. Max 12 content tasks per week; max 3 revision loops each.
3. Any task touching production content, redirects, robots, schema templates or the feed needs an approved `approvals` row.
4. If an action worsened a metric two weeks in a row, auto-create a revert task and email the owner.

## Stop conditions
Daily cost cap hit · critical technical issue (site down, staging indexed, robots blocking, redirect loop) → pause publishing, email immediately.
