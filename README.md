# nutrifitness.ch — Next.js Rebuild + Autonomous SEO / AEO / GEO Agent System

Everything needed to (1) rebuild nutrifitness.ch in Next.js and (2) run a team of AI agents that research, write, check, publish, measure and decide what to do next.

## Start here (in this order)

1. Read `docs/00-QUICKSTART.md` (15 minutes).
2. Create the accounts and API keys listed in `docs/08-APIS-AND-COSTS.md`; copy `.env.example` to `.env.local`.
3. Run `supabase/migrations/001_agent_system.sql` in your Supabase project.
4. Open Claude Code in this folder. It loads `CLAUDE.md` and the agents in `.claude/agents/` automatically (Codex: `AGENTS.md`).
5. Paste the prompt from `docs/01-MASTER-PROMPT.md` (Phase 0 first). Do not skip approval gates.

## Folder map

| Path | What it is |
|---|---|
| `CLAUDE.md`, `AGENTS.md` | Standing instructions for Claude Code / Codex |
| `docs/` | Master prompt, SEO/AEO/GEO playbook, keyword method, content standards, image spec, off-site tasks, 8-week plan, APIs, decision rules |
| `.claude/agents/` | 12 sub-agent definitions (roles, tools, rules) |
| `supabase/migrations/` | Shared agent memory, tasks, approvals, rankings |
| `src/lib/schema/` | JSON-LD generators (Product, Category, FAQ, Breadcrumb, Organization, LocalBusiness) |
| `src/lib/agents/` | Orchestrator, agent runner, decision rules, DataForSEO client |
| `src/app/` | `robots.ts`, `sitemap.ts` templates |
| `public/llms.txt` | Optional AI-crawler guide |
| `scripts/` | Redirect-map builder |
| `prompts/` | Product rewrite system prompt, weekly report prompt |
| `data/` | WooCommerce export, catalogue audit + rewrite workbook, product data collection sheet |

## Honest expectations

No one can guarantee rankings. This system maximises the odds: correct technical foundation, unique helpful content, structured data, local signals, third-party mentions, and a weekly measure-decide-act loop. Report only measured results.
