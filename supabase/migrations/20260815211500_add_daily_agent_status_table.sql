drop view if exists public.daily_agent_status;

create table if not exists public.daily_agent_status (
  id text primary key,
  label text not null,
  surface_group text not null,
  last_checked_at timestamptz,
  primary_count integer not null default 0,
  useful_count integer not null default 0,
  quiet_count integer not null default 0,
  stale_count integer not null default 0,
  attention_count integer not null default 0,
  latest_result text not null default 'unknown',
  summary text not null default '',
  route text not null,
  action_label text not null,
  updated_at timestamptz not null default now()
);

alter table public.daily_agent_status enable row level security;

drop policy if exists "daily_agent_status_public_read" on public.daily_agent_status;
create policy "daily_agent_status_public_read"
  on public.daily_agent_status
  for select
  to anon, authenticated
  using (true);

revoke all on table public.daily_agent_status from public;
grant select on table public.daily_agent_status to anon, authenticated;
grant select, insert, update, delete on table public.daily_agent_status to service_role;

comment on table public.daily_agent_status is
  'Safe public aggregate for app-facing daily automation status. Refreshed by service-side daily agents; raw operational rows, Discord URLs, message cursors, and source text remain in their owner tables.';
