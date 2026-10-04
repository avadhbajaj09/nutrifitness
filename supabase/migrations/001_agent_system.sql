-- nutrifitness.ch agent system. Run in Supabase SQL editor.
create extension if not exists "pgcrypto";

create table if not exists keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  country text default 'ch', language text default 'fr',
  volume int, difficulty int, intent text, cluster text,
  target_url text, priority int default 3, status text default 'new',
  updated_at timestamptz default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  url text not null unique, page_type text not null,
  primary_keyword text, status text default 'draft',   -- draft | approved | published
  indexed boolean, last_published_at timestamptz, last_audited_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  agent text not null, type text not null,
  payload jsonb not null default '{}',
  status text not null default 'queued',  -- queued | running | needs_review | needs_approval | done | failed | cancelled
  priority int default 3, attempts int default 0, max_attempts int default 3,
  parent_task_id uuid references tasks(id),
  requires_approval boolean default false,
  result_artifact_id uuid, error text, cost_usd numeric(10,4) default 0,
  created_by text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists tasks_status_idx on tasks(status, priority, created_at);

create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id), agent text not null, kind text not null,
  url text, content jsonb not null, version int default 1, created_at timestamptz default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid references artifacts(id) not null,
  status text not null default 'pending',   -- pending | approved | rejected
  reviewer text, comment text, decided_at timestamptz, created_at timestamptz default now()
);

create table if not exists serp_snapshots (
  id uuid primary key default gen_random_uuid(),
  keyword text not null, captured_at timestamptz default now(), results jsonb not null
);

create table if not exists rankings (
  id uuid primary key default gen_random_uuid(),
  keyword text not null, url text, position numeric, impressions int, clicks int, ctr numeric,
  source text default 'gsc', captured_on date not null default current_date,
  unique (keyword, url, source, captured_on)
);

create table if not exists citations (
  id uuid primary key default gen_random_uuid(),
  prompt text not null, engine text not null,     -- chatgpt | perplexity | gemini | ai_overview | ai_mode
  brand_cited boolean, our_url_cited text, cited_domains jsonb, answer_excerpt text,
  captured_on date default current_date
);

create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  url text, kind text not null, severity text not null,  -- critical | high | medium | low
  details jsonb, status text default 'open', first_seen timestamptz default now(), resolved_at timestamptz
);

create table if not exists outreach (
  id uuid primary key default gen_random_uuid(),
  target_name text, target_url text, kind text, contact text,
  status text default 'idea',  -- idea | briefed | sent | replied | won | lost
  brief jsonb, owner text default 'client', updated_at timestamptz default now()
);

create table if not exists cost_log (
  id uuid primary key default gen_random_uuid(),
  agent text, model text, input_tokens int, output_tokens int, cost_usd numeric(10,4),
  logged_at timestamptz default now()
);

-- Publishing guard: an artifact may be published only if an approved approval exists.
create or replace view publishable_artifacts as
select a.* from artifacts a
join approvals p on p.artifact_id = a.id and p.status = 'approved';

alter table keywords enable row level security; alter table pages enable row level security;
alter table tasks enable row level security; alter table artifacts enable row level security;
alter table approvals enable row level security; alter table serp_snapshots enable row level security;
alter table rankings enable row level security; alter table citations enable row level security;
alter table issues enable row level security; alter table outreach enable row level security;
alter table cost_log enable row level security;
-- No policies: only the service-role key (server side) can read or write.
