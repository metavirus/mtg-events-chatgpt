create table if not exists public.coordination_capability_probes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phase text not null check (
    phase in ('assignment', 'finding', 'follow_up', 'disposition')
  ),
  origin text not null check (
    origin in ('user', 'chatgpt', 'codex', 'steward')
  ),
  target text not null check (
    target in ('user', 'chatgpt', 'codex', 'steward', 'shared')
  ),
  title text not null check (
    char_length(title) between 1 and 200
  ),
  payload jsonb not null default '{}'::jsonb check (
    jsonb_typeof(payload) = 'object'
    and pg_column_size(payload) <= 16384
  ),
  parent_id uuid references public.coordination_capability_probes(id),
  deduplication_key text unique check (
    deduplication_key is null
    or char_length(deduplication_key) between 1 and 200
  )
);

comment on table public.coordination_capability_probes is
  'Temporary append-only capability proof for the ChatGPT-Codex coordination round trip. Not canonical research truth.';

create index if not exists coordination_capability_probes_target_created_idx
  on public.coordination_capability_probes (target, created_at desc);

create index if not exists coordination_capability_probes_parent_idx
  on public.coordination_capability_probes (parent_id, created_at);

alter table public.coordination_capability_probes enable row level security;

revoke all on table public.coordination_capability_probes from public;
revoke all on table public.coordination_capability_probes from anon;
revoke all on table public.coordination_capability_probes from authenticated;
grant select, insert on table public.coordination_capability_probes to service_role;

