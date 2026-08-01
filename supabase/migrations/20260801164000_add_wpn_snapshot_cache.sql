create table if not exists public.wpn_snapshot_cache (
  id text primary key,
  retrieved_at timestamptz not null,
  origin_label text not null,
  origin_latitude double precision not null,
  origin_longitude double precision not null,
  radius_miles numeric(6, 2) not null check (radius_miles > 0),
  all_event_count integer not null check (all_event_count >= 0),
  commander_candidate_count integer not null check (commander_candidate_count >= 0),
  organization_count integer not null check (organization_count >= 0),
  metadata jsonb not null check (jsonb_typeof(metadata) = 'object'),
  events_all jsonb not null check (jsonb_typeof(events_all) = 'array'),
  events_commander jsonb not null check (jsonb_typeof(events_commander) = 'array'),
  organizations jsonb not null check (jsonb_typeof(organizations) = 'array'),
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists wpn_snapshot_cache_set_updated_at on public.wpn_snapshot_cache;
create trigger wpn_snapshot_cache_set_updated_at
before update on public.wpn_snapshot_cache
for each row execute function public.set_updated_at();

alter table public.wpn_snapshot_cache enable row level security;

revoke all on table public.wpn_snapshot_cache from anon, authenticated;
grant all on table public.wpn_snapshot_cache to service_role;

comment on table public.wpn_snapshot_cache is
  'Replace-in-place cache of the rich normalized Wizards/EventLink feed. This is source inventory, not promoted canonical app events.';

