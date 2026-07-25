create or replace function public.venue_candidates_for_user(
  p_user_id uuid,
  p_queue text default 'baseline'
)
returns table (
  queue text,
  venue_id text,
  venue_name text,
  city text,
  distance_miles numeric,
  lifecycle_state text,
  lifecycle_reason text,
  baseline_pass_count integer,
  selection_reason text,
  coverage_id uuid,
  surface_type text,
  source_id text,
  surface_url text,
  monitoring_mode text,
  latest_disposition text,
  next_eligible_check_at timestamptz
)
language sql
stable
set search_path = public
as $$
  with suppressed as (
    select ep.entity_id as venue_id
    from public.entity_preferences ep
    where ep.user_id = p_user_id
      and ep.entity_type = 'venue'
      and ep.visibility_preference in ('deprioritize', 'hide')
  ),
  candidates as (
    select
      'baseline'::text as queue,
      c.id as venue_id,
      c.name as venue_name,
      c.city,
      c.distance_miles,
      c.lifecycle_state,
      c.lifecycle_reason,
      c.baseline_pass_count,
      c.selection_reason,
      null::uuid as coverage_id,
      null::text as surface_type,
      null::text as source_id,
      null::text as surface_url,
      null::text as monitoring_mode,
      null::text as latest_disposition,
      null::timestamptz as next_eligible_check_at
    from public.venue_baseline_candidates c
    where p_queue in ('baseline', 'all')

    union all

    select
      'discovery'::text as queue,
      c.id as venue_id,
      c.name as venue_name,
      c.city,
      c.distance_miles,
      c.lifecycle_state,
      c.lifecycle_reason,
      c.baseline_pass_count,
      'unreviewed venue baseline needed'::text as selection_reason,
      null::uuid as coverage_id,
      null::text as surface_type,
      null::text as source_id,
      null::text as surface_url,
      null::text as monitoring_mode,
      null::text as latest_disposition,
      null::timestamptz as next_eligible_check_at
    from public.venue_discovery_candidates c
    where p_queue in ('discovery', 'all')

    union all

    select
      'identity_resolution'::text as queue,
      c.id as venue_id,
      c.name as venue_name,
      c.city,
      c.distance_miles,
      c.lifecycle_state,
      c.lifecycle_reason,
      null::integer as baseline_pass_count,
      'identity or attribution boundary needs resolution'::text as selection_reason,
      null::uuid as coverage_id,
      null::text as surface_type,
      null::text as source_id,
      null::text as surface_url,
      null::text as monitoring_mode,
      null::text as latest_disposition,
      null::timestamptz as next_eligible_check_at
    from public.venue_identity_resolution_candidates c
    where p_queue in ('identity_resolution', 'all')

    union all

    select
      'surface_retry'::text as queue,
      c.venue_id,
      c.venue_name,
      v.city,
      v.distance_miles,
      v.lifecycle_state,
      v.lifecycle_reason,
      v.baseline_pass_count,
      'finite surface retry is due'::text as selection_reason,
      c.coverage_id,
      c.surface_type,
      c.source_id,
      null::text as surface_url,
      'finite_retry'::text as monitoring_mode,
      c.disposition as latest_disposition,
      c.next_eligible_check_at
    from public.venue_surface_retry_candidates c
    join public.venues v on v.id = c.venue_id
    where p_queue in ('surface_retry', 'all')

    union all

    select
      'surface_monitoring'::text as queue,
      c.venue_id,
      c.venue_name,
      v.city,
      v.distance_miles,
      v.lifecycle_state,
      v.lifecycle_reason,
      v.baseline_pass_count,
      'mapped steady-state surface monitoring is due'::text as selection_reason,
      c.coverage_id,
      c.surface_type,
      c.source_id,
      c.surface_url,
      c.monitoring_mode,
      c.latest_disposition,
      c.next_eligible_check_at
    from public.venue_surface_monitoring_candidates c
    join public.venues v on v.id = c.venue_id
    where p_queue in ('surface_monitoring', 'all')
  )
  select c.*
  from candidates c
  where not exists (
    select 1
    from suppressed s
    where s.venue_id = c.venue_id
  )
  order by
    case c.queue
      when 'baseline' then 1
      when 'discovery' then 2
      when 'identity_resolution' then 3
      when 'surface_retry' then 4
      when 'surface_monitoring' then 5
      else 99
    end,
    c.distance_miles nulls last,
    c.venue_name;
$$;

revoke all on function public.venue_candidates_for_user(uuid, text)
  from public, anon, authenticated;
grant execute on function public.venue_candidates_for_user(uuid, text)
  to service_role;

comment on function public.venue_candidates_for_user(uuid, text) is
  'Service-only personalized venue selection wrapper. It suppresses venues the supplied user has marked deprioritize or hide in entity_preferences, keeping ordinary discovery, baseline, identity-resolution, retry, and monitoring queues from resurfacing personal baddies.';
