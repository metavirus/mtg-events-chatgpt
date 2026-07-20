-- Minimal public Signals receiving model.
-- Signals are reviewable observations, not canonical events or research truth.
-- Browser clients may read signals but may not create or change them.

create table public.signals (
  id text primary key,
  category text not null
    check (category in (
      'operational',
      'mention',
      'event_opportunity',
      'community_activity',
      'venue_fit',
      'registration',
      'source_health',
      'needs_judgment'
    )),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'new'
    check (status in (
      'new', 'reviewed', 'promoted', 'dismissed', 'stale', 'needs_followup'
    )),
  source_id text references public.sources(id) on delete restrict,
  captured_at timestamptz not null default timezone('utc', now()),
  observed_at timestamptz,
  expires_at timestamptz,
  related_entity_type text
    check (related_entity_type is null or related_entity_type in (
      'venue', 'community', 'event_series', 'event_occurrence', 'source'
    )),
  related_entity_id text,
  summary text not null check (length(btrim(summary)) > 0),
  details text,
  evidence_url text,
  confidence text not null default 'low'
    check (confidence in ('low', 'medium', 'high')),
  suggested_action text,
  promotion_target text
    check (promotion_target is null or promotion_target in (
      'event_proposal',
      'update',
      'places_assessment',
      'community_note',
      'personal_reminder',
      'no_action'
    )),
  dedupe_key text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (related_entity_type is null and related_entity_id is null)
    or (related_entity_type is not null and related_entity_id is not null)
  ),
  check (expires_at is null or expires_at >= coalesce(observed_at, captured_at))
);

create unique index signals_dedupe_key_unique
  on public.signals(dedupe_key)
  where dedupe_key is not null;

create index signals_attention_idx
  on public.signals(status, priority, captured_at desc);

create index signals_related_entity_idx
  on public.signals(related_entity_type, related_entity_id)
  where related_entity_type is not null;

create index signals_source_idx
  on public.signals(source_id)
  where source_id is not null;

create index signals_expiry_idx
  on public.signals(expires_at)
  where expires_at is not null;

create trigger signals_set_updated_at before update on public.signals
for each row execute function public.set_updated_at();

alter table public.signals enable row level security;

create policy "Public signals are readable"
on public.signals for select to anon, authenticated using (true);

revoke all on table public.signals from anon, authenticated;
grant select on table public.signals to anon, authenticated;
