alter table public.event_ingest_runs
  add column presentation_mode text not null default 'delta'
    check (presentation_mode in ('bootstrap', 'delta')),
  add column presentation_status text not null default 'pending'
    check (presentation_status in ('pending', 'quiet', 'published', 'failed')),
  add column presented_at timestamptz;

alter table public.event_observations
  add column attention_category text
    check (attention_category is null or attention_category in (
      'operational', 'mention', 'event_opportunity', 'community_activity',
      'registration', 'needs_judgment'
    )),
  add column attention_priority text
    check (attention_priority is null or attention_priority in (
      'low', 'normal', 'high', 'urgent'
    )),
  add column attention_summary text,
  add column suggested_action text,
  add constraint event_observations_attention_complete check (
    attention_category is null
    or (
      attention_priority is not null
      and length(btrim(attention_summary)) > 0
      and length(btrim(suggested_action)) > 0
    )
  );

alter table public.research_changes
  add column if not exists details text;

comment on column public.event_ingest_runs.presentation_mode is
  'Bootstrap suppresses user-facing novelty; delta permits grouped Updates and explicit attention Signals.';
comment on column public.event_observations.attention_category is
  'Optional source-adapter annotation. The promoter never guesses attention from event titles.';

-- Everything predating this presentation layer is established inventory. It must
-- not suddenly appear as newly announced merely because the display layer shipped.
update public.event_ingest_runs
set presentation_mode = 'bootstrap',
    presentation_status = 'quiet',
    presented_at = coalesce(finished_at, updated_at)
where presentation_status = 'pending';

create or replace function public.promote_event_ingest_run(
  p_ingest_run_id uuid,
  p_presentation_mode text default 'delta',
  p_dry_run boolean default true
)
returns table(
  ingest_run_id uuid,
  outcome text,
  wrote boolean,
  visible_observation_count integer,
  grouped_update_count integer,
  signal_count integer
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_run public.event_ingest_runs%rowtype;
  v_visible integer := 0;
  v_updates integer := 0;
  v_signals integer := 0;
begin
  if p_presentation_mode not in ('bootstrap', 'delta') then
    raise exception 'presentation mode must be bootstrap or delta';
  end if;

  select * into v_run
  from public.event_ingest_runs r
  where r.id = p_ingest_run_id
  for update;

  if not found then
    raise exception 'unknown ingest run: %', p_ingest_run_id;
  end if;

  if v_run.presentation_status in ('quiet', 'published') then
    if v_run.presentation_mode <> p_presentation_mode then
      raise exception 'run % was already presented as %, not %',
        p_ingest_run_id, v_run.presentation_mode, p_presentation_mode;
    end if;
    return query select p_ingest_run_id, 'replayed'::text, false,
      coalesce((v_run.result_counts->>'presentation_visible_observations')::integer, 0),
      coalesce((v_run.result_counts->>'presentation_grouped_updates')::integer, 0),
      coalesce((v_run.result_counts->>'presentation_signals')::integer, 0);
    return;
  end if;

  -- These are the only two canonical reconciliation shapes. Source adapters stage
  -- observations; this promoter owns catalog landing and presentation finalization.
  perform * from public.reconcile_event_ingest_run(p_ingest_run_id, null, p_dry_run);
  perform * from public.reconcile_new_event_series(p_ingest_run_id, p_dry_run);

  select count(*)::integer into v_visible
  from public.event_observations o
  join public.event_source_bindings b
    on b.source_family = o.source_family
   and b.upstream_event_id = o.upstream_event_id
  where o.first_ingest_run_id = p_ingest_run_id
    and b.first_bound_at >= v_run.started_at
    and not (
      o.proxy_policy = 'prohibited'
      or exists (
        select 1 from public.entity_preferences ep
        where ep.entity_type = 'venue'
          and ep.entity_id = o.venue_id
          and ep.visibility_preference in ('deprioritize', 'hide')
      )
    );

  if p_dry_run then
    return query select p_ingest_run_id, 'validated'::text, false,
      case when p_presentation_mode = 'bootstrap' then 0 else v_visible end,
      0, 0;
    return;
  end if;

  if p_presentation_mode = 'delta' then
    with visible_new as (
      select o.*, b.series_id, b.occurrence_id, v.name as venue_name
      from public.event_observations o
      join public.event_source_bindings b
        on b.source_family = o.source_family
       and b.upstream_event_id = o.upstream_event_id
      join public.venues v on v.id = o.venue_id
      where o.first_ingest_run_id = p_ingest_run_id
        and b.first_bound_at >= v_run.started_at
        and not (
          o.proxy_policy = 'prohibited'
          or exists (
            select 1 from public.entity_preferences ep
            where ep.entity_type = 'venue'
              and ep.entity_id = o.venue_id
              and ep.visibility_preference in ('deprioritize', 'hide')
          )
        )
    ), grouped as (
      select
        venue_id,
        min(venue_name) as venue_name,
        count(*)::integer as occurrence_count,
        count(distinct series_id)::integer as series_count,
        min(occurrence_date) as first_date,
        max(occurrence_date) as last_date,
        string_agg(distinct title, '; ' order by title) as titles,
        string_agg(distinct source_family, ', ' order by source_family) as source_families
      from visible_new
      group by venue_id
    ), inserted as (
      insert into public.research_changes (
        id, detected_at, change_type, entity_type, entity_id,
        summary, details, review_status
      )
      select
        'event-ingest:' || p_ingest_run_id::text || ':' || g.venue_id,
        timezone('utc', now()),
        'event_ingest_delta',
        'venue',
        g.venue_id,
        g.venue_name || ': ' || g.occurrence_count ||
          case when g.occurrence_count = 1 then ' newly listed event' else ' newly listed events' end,
        g.titles || '. Dates: ' || g.first_date::text ||
          case when g.last_date <> g.first_date then ' through ' || g.last_date::text else '' end ||
          '. Source' || case when position(',' in g.source_families) > 0 then 's' else '' end ||
          ': ' || g.source_families || '.',
        'accepted'
      from grouped g
      on conflict (id) do nothing
      returning 1
    )
    select count(*)::integer into v_updates from inserted;

    with attention as (
      select o.*, b.series_id, b.occurrence_id
      from public.event_observations o
      join public.event_source_bindings b
        on b.source_family = o.source_family
       and b.upstream_event_id = o.upstream_event_id
      where o.first_ingest_run_id = p_ingest_run_id
        and b.first_bound_at >= v_run.started_at
        and o.attention_category is not null
        and not (
          o.proxy_policy = 'prohibited'
          or exists (
            select 1 from public.entity_preferences ep
            where ep.entity_type = 'venue'
              and ep.entity_id = o.venue_id
              and ep.visibility_preference in ('deprioritize', 'hide')
          )
        )
    ), inserted as (
      insert into public.signals (
        id, category, priority, status, source_id, captured_at, observed_at,
        related_entity_type, related_entity_id, summary, details, evidence_url,
        confidence, suggested_action, promotion_target, dedupe_key
      )
      select
        'event-ingest:' || p_ingest_run_id::text || ':' || a.id::text,
        a.attention_category,
        a.attention_priority,
        'new',
        a.source_id,
        timezone('utc', now()),
        a.observed_at,
        case when a.occurrence_id is not null then 'event_occurrence' else 'event_series' end,
        coalesce(a.occurrence_id, a.series_id),
        a.attention_summary,
        a.source_description,
        a.source_url,
        case when a.extraction_confidence in ('exact', 'high') then 'high'
             when a.extraction_confidence = 'medium' then 'medium' else 'low' end,
        a.suggested_action,
        case when a.attention_category = 'mention' then 'personal_reminder' else 'update' end,
        'event-ingest:' || a.source_family || ':' || a.upstream_event_id || ':' || a.attention_category
      from attention a
      on conflict (id) do nothing
      returning 1
    )
    select count(*)::integer into v_signals from inserted;
  end if;

  update public.event_ingest_runs r
  set run_status = 'reconciled',
      presentation_mode = p_presentation_mode,
      presentation_status = case
        when p_presentation_mode = 'bootstrap' or (v_updates = 0 and v_signals = 0)
          then 'quiet'
        else 'published'
      end,
      presented_at = timezone('utc', now()),
      finished_at = coalesce(r.finished_at, timezone('utc', now())),
      result_counts = r.result_counts || jsonb_build_object(
        'presentation_visible_observations',
          case when p_presentation_mode = 'bootstrap' then 0 else v_visible end,
        'presentation_grouped_updates', v_updates,
        'presentation_signals', v_signals
      )
  where r.id = p_ingest_run_id;

  return query select p_ingest_run_id,
    case when p_presentation_mode = 'bootstrap' or (v_updates = 0 and v_signals = 0)
      then 'quiet' else 'published' end::text,
    true,
    case when p_presentation_mode = 'bootstrap' then 0 else v_visible end,
    v_updates,
    v_signals;
exception when others then
  update public.event_ingest_runs
  set presentation_status = 'failed', error_summary = sqlerrm
  where id = p_ingest_run_id and not p_dry_run;
  raise;
end;
$$;

revoke all on function public.promote_event_ingest_run(uuid, text, boolean)
  from public, anon, authenticated;
grant execute on function public.promote_event_ingest_run(uuid, text, boolean)
  to service_role;

comment on function public.promote_event_ingest_run(uuid, text, boolean) is
  'Service-only source-neutral event promoter: reconciles catalog rows, suppresses bootstrap novelty, groups Updates, and emits only explicitly annotated Signals.';
