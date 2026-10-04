# Quickstart

## Architecture decision (make this first)
- **Option A (recommended for 60 days): headless.** Next.js 14 App Router front-end; WooCommerce stays as product/order backend (REST API). Lowest risk: orders, stock and payments untouched.
- **Option B: full rebuild** on Supabase + Stripe/TWINT. Only if the client wants to leave WordPress completely. Adds roughly 3–4 weeks.
Phase 0 of the master prompt makes the agent confirm this with evidence before any code is written.

## What runs where
- **Claude Code** builds the website and works as the interactive team.
- **Agent runtime** (`src/lib/agents/`) is a small TypeScript service run by Vercel Cron. It runs the agents on a schedule, stores everything in Supabase, and asks for human approval before anything goes live.
- **Humans** (you + client): approve content, supply product label data, run off-site tasks, Google Business Profile, reviews.

## Rhythm
- Daily (automatic): technical crawl, Merchant diagnostics, Search Console pull, issue triage.
- Weekly (automatic + you): ranking and AI-citation report; the orchestrator proposes the next sprint; you approve.
- Human time: about 3–5 hours per week (approvals, label data, off-site tasks).

## Order of work
Week 1 diagnose + keywords → Weeks 2–3 build → Week 4 content + launch prep → Week 5 launch → Weeks 6–8 scale content, links, optimise from data.
