alter table public.wpn_snapshot_cache
  add column if not exists enriched_events jsonb not null default '[]'::jsonb,
  add column if not exists enriched_organizations jsonb not null default '[]'::jsonb,
  add column if not exists event_observation_state jsonb not null default '{}'::jsonb,
  add column if not exists field_inventory jsonb not null default '{}'::jsonb,
  add column if not exists delta_summary jsonb not null default '{}'::jsonb;

alter table public.wpn_snapshot_cache
  add constraint wpn_snapshot_cache_enriched_events_array
    check (jsonb_typeof(enriched_events) = 'array'),
  add constraint wpn_snapshot_cache_enriched_organizations_array
    check (jsonb_typeof(enriched_organizations) = 'array'),
  add constraint wpn_snapshot_cache_event_observation_state_object
    check (jsonb_typeof(event_observation_state) = 'object'),
  add constraint wpn_snapshot_cache_field_inventory_object
    check (jsonb_typeof(field_inventory) = 'object'),
  add constraint wpn_snapshot_cache_delta_summary_object
    check (jsonb_typeof(delta_summary) = 'object');

comment on column public.wpn_snapshot_cache.enriched_events is
  'Current WPN events with stable source URLs, fingerprints, normalized planning fields, and canonical venue matches when exact.';
comment on column public.wpn_snapshot_cache.enriched_organizations is
  'Current WPN organizations with identity fingerprints and canonical venue matches when exact.';
comment on column public.wpn_snapshot_cache.event_observation_state is
  'Compact cross-snapshot state keyed by WPN event ID for first/last seen and consecutive missing checks.';
comment on column public.wpn_snapshot_cache.field_inventory is
  'Observed WPN response field paths used to detect upstream schema drift.';
comment on column public.wpn_snapshot_cache.delta_summary is
  'Machine-readable counts and IDs for the latest cache comparison; not a user-facing Updates record.';
