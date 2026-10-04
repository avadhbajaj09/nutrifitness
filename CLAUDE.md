# CLAUDE.md — nutrifitness.ch project instructions

## Mission
Rebuild nutrifitness.ch (French-language Swiss sports-nutrition store, physical shop in Geneva, ships across Switzerland and nearby countries) as a fast Next.js site, then run an agent system that grows organic visibility on Google Search, Google Shopping free listings, Google AI Overviews / AI Mode, ChatGPT Search, Perplexity and Gemini. Never promise rankings; report measured data only.

## Stack
Next.js 14 App Router, TypeScript strict, Supabase (agent memory), Vercel (hosting + cron), Resend (alerts). Product/order backend: WooCommerce REST (Option A) unless Phase 0 approves Option B. Language/locale: `fr-CH`, currency CHF.

## Non-negotiables
1. Staging is `noindex`, password-protected, blocked in robots. Only production is indexable.
2. 1:1 URL map old → new; every changed URL gets a single 301. No chains, no 302.
3. One GA4 property, one GTM container, consent mode v2.
4. `<html lang="fr-CH">`, `og:locale = fr_CH`, schema `inLanguage: "fr-CH"`. No English schema on French pages.
5. Exactly one H1 per page. No H1 inside product descriptions.
6. Price/stock in JSON-LD must equal visible price/stock. Validate in CI.
7. No health or medical claims. Supplements are foods under Swiss law. Flag every claim for human review. Never invent nutrition facts: unknown = `[À VÉRIFIER]`.
8. Never copy manufacturer text. Every page is unique.
9. Agents never publish to production without an approved row in `approvals`.
10. Respect the daily cost cap (`DAILY_COST_CAP_USD`). Halt on breach.

## Workflow
- Work phase by phase from `docs/01-MASTER-PROMPT.md`. Stop at each gate and wait for approval.
- Use the sub-agents in `.claude/agents/`. They exchange work through the Supabase `tasks` and `artifacts` tables, never through free chat.
- Decision rules live in `docs/09-DECISION-RULES.md` and `src/lib/agents/decisions.ts`. Change both together.

## Style
Polished professional French (Swiss) for site content; English for code, docs and reports. Short, direct reports with headers and bullets.
