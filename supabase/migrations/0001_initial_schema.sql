-- MTG Events operational schema.
-- Apply through the Supabase SQL editor or migration tooling.
-- Never place a service-role key in browser code or this repository.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.dataset_metadata (
  id text primary key,
  schema_version integer not null check (schema_version > 0),
  snapshot_at timestamptz not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.venues (
  id text primary key,
  name text not null,
  city text,
  address text,
  phone text,
  website text,
  events_url text,
  instagram text,
  wpn_premium boolean not null default false,
  distance_miles numeric(6, 2) check (distance_miles is null or distance_miles >= 0),
  operating_status text not null default 'unknown'
    check (operating_status in ('open', 'closed', 'temporary_closed', 'unknown')),
  research_status text not null default 'discovery'
    check (research_status in ('discovery', 'reviewed', 'deepened')),
  last_verified date,
  assessment_notes text,
  assessment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.communities (
  id text primary key,
  name text not null,
  region text,
  research_status text not null default 'discovery'
    check (research_status in ('discovery', 'reviewed', 'deepened')),
  formats text[] not null default '{}',
  primary_channel text,
  summary text,
  signal text,
  next_question text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sources (
  id text primary key,
  label text not null,
  url text,
  source_type text not null,
  health_status text not null default 'unknown'
    check (health_status in (
      'current', 'stale', 'broken', 'login_required', 'blocked',
      'superseded', 'unknown'
    )),
  last_checked date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.entity_sources (
  entity_type text not null
    check (entity_type in ('venue', 'community')),
  entity_id text not null,
  source_id text not null references public.sources(id) on delete restrict,
  relationship text not null default 'evidence',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (entity_type, entity_id, source_id)
);

create table public.event_series (
  id text primary key,
  venue_id text references public.venues(id) on delete restrict,
  community_id text references public.communities(id) on delete restrict,
  title text not null,
  format text,
  event_type text,
  bracket text,
  recurrence jsonb,
  default_start_time time,
  start_date date,
  end_date date,
  entry_fee numeric(10, 2) check (entry_fee is null or entry_fee >= 0),
  currency text not null default 'USD',
  details text,
  confidence text not null default 'low'
    check (confidence in ('low', 'medium', 'high')),
  event_status text not null default 'active'
    check (event_status in ('active', 'inactive', 'cancelled', 'unknown')),
  last_verified date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (venue_id is not null or community_id is not null)
);

create table public.event_occurrences (
  id text primary key,
  series_id text not null references public.event_series(id) on delete cascade,
  occurrence_date date not null,
  start_time time,
  end_time time,
  evidence_state text not null default 'single_source'
    check (evidence_state in (
      'corroborated', 'single_source', 'projected', 'needs_confirmation'
    )),
  occurrence_status text not null default 'confirmed'
    check (occurrence_status in (
      'confirmed', 'projected', 'cancelled', 'moved', 'at_risk'
    )),
  entry_fee numeric(10, 2) check (entry_fee is null or entry_fee >= 0),
  capacity integer check (capacity is null or capacity > 0),
  details text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (series_id, occurrence_date, start_time)
);

create table public.event_sources (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id) on delete restrict,
  series_id text references public.event_series(id) on delete cascade,
  occurrence_id text references public.event_occurrences(id) on delete cascade,
  relationship text not null default 'evidence',
  created_at timestamptz not null default timezone('utc', now()),
  check (
    (series_id is not null and occurrence_id is null)
    or (series_id is null and occurrence_id is not null)
  )
);

create unique index event_sources_series_unique
  on public.event_sources (source_id, series_id)
  where series_id is not null;

create unique index event_sources_occurrence_unique
  on public.event_sources (source_id, occurrence_id)
  where occurrence_id is not null;

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('venue', 'community')),
  entity_id text not null,
  research_status text not null
    check (research_status in ('discovery', 'reviewed', 'deepened')),
  candidate_status text
    check (candidate_status is null or candidate_status in ('promoted', 'neutral', 'deprioritized')),
  fit_grade text check (fit_grade is null or fit_grade ~ '^[A-F][+-]?$'),
  fit_score numeric(2, 1) check (fit_score is null or fit_score between 1 and 5),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  positives text[] not null default '{}',
  cautions text[] not null default '{}',
  open_questions text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (entity_type, entity_id)
);

create table public.research_changes (
  id text primary key,
  detected_at timestamptz not null,
  change_type text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  review_status text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.user_field_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('venue', 'community', 'event_series', 'event_occurrence')),
  entity_id text not null,
  note_type text not null default 'observation'
    check (note_type in ('observation', 'visit', 'correction', 'lead', 'assessment')),
  note_text text not null check (length(btrim(note_text)) > 0),
  source_url text,
  review_status text not null default 'submitted'
    check (review_status in ('submitted', 'accepted', 'needs_clarification', 'rejected')),
  observed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.entity_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('venue', 'community', 'event_series', 'event_occurrence')),
  entity_id text not null,
  is_favorite boolean not null default false,
  visibility_preference text not null default 'normal'
    check (visibility_preference in ('normal', 'deprioritize', 'hide')),
  rating smallint check (rating is null or rating between 1 and 5),
  planning_state text
    check (planning_state is null or planning_state in (
      'interested', 'attended', 'skipped'
    )),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, entity_type, entity_id)
);

create table public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text
    check (entity_type is null or entity_type in (
      'venue', 'community', 'event_series', 'event_occurrence'
    )),
  entity_id text,
  note_text text not null check (length(btrim(note_text)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (entity_type is null and entity_id is null)
    or (entity_type is not null and entity_id is not null)
  )
);

create table public.agent_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null default 'general'
    check (request_type in (
      'general', 'research', 'data_correction', 'product', 'watch'
    )),
  entity_type text
    check (entity_type is null or entity_type in (
      'venue', 'community', 'event_series', 'event_occurrence'
    )),
  entity_id text,
  instruction text not null check (length(btrim(instruction)) > 0),
  source_url text,
  request_status text not null default 'queued'
    check (request_status in (
      'queued', 'in_progress', 'waiting_for_user', 'completed', 'declined'
    )),
  agent_response text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (entity_type is null and entity_id is null)
    or (entity_type is not null and entity_id is not null)
  )
);

create table public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updates_seen_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  entity_type text,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index event_series_venue_idx on public.event_series(venue_id);
create index event_series_community_idx on public.event_series(community_id);
create index event_occurrences_date_idx on public.event_occurrences(occurrence_date, start_time);
create index research_changes_detected_idx on public.research_changes(detected_at desc);
create index agent_requests_status_idx on public.agent_requests(user_id, request_status, created_at);
create index user_activity_user_date_idx on public.user_activity(user_id, created_at desc);

create trigger dataset_metadata_set_updated_at before update on public.dataset_metadata
for each row execute function public.set_updated_at();
create trigger venues_set_updated_at before update on public.venues
for each row execute function public.set_updated_at();
create trigger communities_set_updated_at before update on public.communities
for each row execute function public.set_updated_at();
create trigger sources_set_updated_at before update on public.sources
for each row execute function public.set_updated_at();
create trigger event_series_set_updated_at before update on public.event_series
for each row execute function public.set_updated_at();
create trigger event_occurrences_set_updated_at before update on public.event_occurrences
for each row execute function public.set_updated_at();
create trigger evaluations_set_updated_at before update on public.evaluations
for each row execute function public.set_updated_at();
create trigger user_field_notes_set_updated_at before update on public.user_field_notes
for each row execute function public.set_updated_at();
create trigger entity_preferences_set_updated_at before update on public.entity_preferences
for each row execute function public.set_updated_at();
create trigger personal_notes_set_updated_at before update on public.personal_notes
for each row execute function public.set_updated_at();
create trigger agent_requests_set_updated_at before update on public.agent_requests
for each row execute function public.set_updated_at();
create trigger user_state_set_updated_at before update on public.user_state
for each row execute function public.set_updated_at();

alter table public.dataset_metadata enable row level security;
alter table public.venues enable row level security;
alter table public.communities enable row level security;
alter table public.sources enable row level security;
alter table public.entity_sources enable row level security;
alter table public.event_series enable row level security;
alter table public.event_occurrences enable row level security;
alter table public.event_sources enable row level security;
alter table public.evaluations enable row level security;
alter table public.research_changes enable row level security;
alter table public.user_field_notes enable row level security;
alter table public.entity_preferences enable row level security;
alter table public.personal_notes enable row level security;
alter table public.agent_requests enable row level security;
alter table public.user_state enable row level security;
alter table public.user_activity enable row level security;

create policy "Public research metadata is readable"
on public.dataset_metadata for select to anon, authenticated using (true);
create policy "Public venues are readable"
on public.venues for select to anon, authenticated using (true);
create policy "Public communities are readable"
on public.communities for select to anon, authenticated using (true);
create policy "Public sources are readable"
on public.sources for select to anon, authenticated using (true);
create policy "Public entity-source links are readable"
on public.entity_sources for select to anon, authenticated using (true);
create policy "Public event series are readable"
on public.event_series for select to anon, authenticated using (true);
create policy "Public event occurrences are readable"
on public.event_occurrences for select to anon, authenticated using (true);
create policy "Public event-source links are readable"
on public.event_sources for select to anon, authenticated using (true);
create policy "Public evaluations are readable"
on public.evaluations for select to anon, authenticated using (true);
create policy "Public research changes are readable"
on public.research_changes for select to anon, authenticated using (true);

create policy "Users read their field notes"
on public.user_field_notes for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Users create their field notes"
on public.user_field_notes for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Users update their submitted field notes"
on public.user_field_notes for update to authenticated
using ((select auth.uid()) = user_id and review_status in ('submitted', 'needs_clarification'))
with check ((select auth.uid()) = user_id);

create policy "Users manage their preferences"
on public.entity_preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users manage their private notes"
on public.personal_notes for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users read their agent requests"
on public.agent_requests for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Users create their agent requests"
on public.agent_requests for insert to authenticated
with check ((select auth.uid()) = user_id and request_status = 'queued');
create policy "Users update their open agent requests"
on public.agent_requests for update to authenticated
using ((select auth.uid()) = user_id and request_status in ('queued', 'waiting_for_user'))
with check ((select auth.uid()) = user_id);
create policy "Users manage their state"
on public.user_state for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users read their activity"
on public.user_activity for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Users create their activity"
on public.user_activity for insert to authenticated
with check ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.dataset_metadata, public.venues, public.communities,
  public.sources, public.entity_sources, public.event_series,
  public.event_occurrences, public.event_sources, public.evaluations,
  public.research_changes to anon, authenticated;
grant select, insert, update on public.user_field_notes to authenticated;
grant select, insert, update, delete on public.entity_preferences,
  public.personal_notes, public.user_state to authenticated;
grant select, insert, update on public.agent_requests to authenticated;
grant select, insert on public.user_activity to authenticated;
grant usage, select on sequence public.user_activity_id_seq to authenticated;

insert into public.dataset_metadata (
  id, schema_version, snapshot_at, description
) values (
  'primary', 1, timezone('utc', now()),
  'Initial MTG Events Supabase schema; file-backed app remains active pending verified import.'
);
