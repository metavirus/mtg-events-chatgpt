create or replace function public.reconcile_existing_event_lifecycle(
  p_ingest_run_id uuid,
  p_dry_run boolean default true
)
returns table(
  lifecycle_action text,
  affected_count integer,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_run public.event_ingest_runs%rowtype;
  v_cache public.wpn_snapshot_cache%rowtype;
  v_refresh_count integer := 0;
  v_review_count integer := 0;
  v_missing_count integer := 0;
begin
  perform set_config('client_min_messages', 'warning', true);

  select * into v_run
  from public.event_ingest_runs r
  where r.id = p_ingest_run_id;

  if not found then
    raise exception 'unknown ingest run: %', p_ingest_run_id;
  end if;

  drop table if exists pg_temp.lifecycle_bound;
  create temporary table lifecycle_bound on commit drop as
  select
    o.id as observation_id,
    o.source_family,
    o.upstream_event_id,
    o.source_id,
    o.source_url,
    o.venue_id,
    o.title,
    o.normalized_title_key,
    o.source_status,
    o.occurrence_date,
    o.start_time,
    o.end_time,
    o.fee_amount,
    o.capacity,
    o.source_description,
    o.content_fingerprint,
    b.id as binding_id,
    b.series_id as bound_series_id,
    b.occurrence_id as bound_occurrence_id,
    b.first_bound_at,
    eo.series_id as occurrence_series_id,
    eo.occurrence_date as canonical_date,
    eo.start_time as canonical_start_time,
    eo.end_time as canonical_end_time,
    eo.entry_fee as canonical_fee,
    eo.capacity as canonical_capacity,
    eo.details as canonical_details,
    eo.occurrence_status,
    es.title as canonical_title,
    es.venue_id as canonical_venue_id
  from public.event_observations o
  join public.event_source_bindings b
    on b.source_family = o.source_family
   and b.upstream_event_id = o.upstream_event_id
  left join public.event_occurrences eo on eo.id = b.occurrence_id
  left join public.event_series es on es.id = coalesce(b.series_id, eo.series_id)
  where o.ingest_run_id = p_ingest_run_id
    and b.first_bound_at < v_run.started_at;

  drop table if exists pg_temp.lifecycle_refresh;
  create temporary table lifecycle_refresh on commit drop as
  select *
  from pg_temp.lifecycle_bound lb
  where lb.bound_occurrence_id is not null
    and lb.occurrence_status in ('confirmed', 'projected', 'at_risk')
    and coalesce(lb.source_status, '') = 'SCHEDULED'
    and lb.canonical_venue_id = lb.venue_id
    and lb.canonical_date = lb.occurrence_date
    and lb.canonical_start_time is not distinct from lb.start_time
    and public.normalize_event_identity_text(lb.canonical_title) = lb.normalized_title_key;

  drop table if exists pg_temp.lifecycle_review;
  create temporary table lifecycle_review on commit drop as
  select
    lb.*,
    case
      when coalesce(lb.source_status, '') <> 'SCHEDULED'
        then 'upstream_status_review'
      when lb.canonical_venue_id is distinct from lb.venue_id
        then 'venue_mismatch_review'
      when lb.canonical_date is distinct from lb.occurrence_date
        or lb.canonical_start_time is distinct from lb.start_time
        then 'schedule_changed_review'
      when public.normalize_event_identity_text(lb.canonical_title) is distinct from lb.normalized_title_key
        then 'title_changed_review'
      else 'bound_event_review'
    end as review_kind
  from pg_temp.lifecycle_bound lb
  where lb.bound_occurrence_id is not null
    and not exists (
      select 1 from pg_temp.lifecycle_refresh lr
      where lr.observation_id = lb.observation_id
    );

  select count(*)::integer into v_refresh_count from pg_temp.lifecycle_refresh;
  select count(*)::integer into v_review_count from pg_temp.lifecycle_review;

  if v_run.source_family = 'wpn' then
    select * into v_cache
    from public.wpn_snapshot_cache c
    where c.content_sha256 = v_run.input_fingerprint
    order by c.retrieved_at desc
    limit 1;

    if found then
      drop table if exists pg_temp.lifecycle_missing;
      create temporary table lifecycle_missing on commit drop as
      select
        b.source_family,
        b.upstream_event_id,
        b.series_id,
        b.occurrence_id,
        eo.occurrence_date,
        eo.start_time,
        es.venue_id,
        es.title as canonical_title,
        (state.value->>'consecutiveMissing')::integer as consecutive_missing,
        state.value as source_state
      from public.event_source_bindings b
      join public.event_occurrences eo on eo.id = b.occurrence_id
      join public.event_series es on es.id = eo.series_id
      join jsonb_each(v_cache.event_observation_state) as state(key, value)
        on state.key = b.upstream_event_id
      where b.source_family = 'wpn'
        and eo.occurrence_date >= current_date
        and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
        and coalesce((state.value->>'consecutiveMissing')::integer, 0) >= 2
        and not exists (
          select 1 from public.event_observations o
          where o.ingest_run_id = p_ingest_run_id
            and o.source_family = b.source_family
            and o.upstream_event_id = b.upstream_event_id
        );

      select count(*)::integer into v_missing_count from pg_temp.lifecycle_missing;
    else
      v_missing_count := 0;
    end if;
  else
    v_missing_count := 0;
  end if;

  if p_dry_run then
    return query values
      ('refresh_existing_bound_events'::text, v_refresh_count, false),
      ('queue_changed_or_cancelled_review'::text, v_review_count, false),
      ('queue_disappearance_review'::text, v_missing_count, false);
    return;
  end if;

  update public.event_occurrences eo
  set
    end_time = coalesce(eo.end_time, lr.end_time),
    entry_fee = coalesce(eo.entry_fee, lr.fee_amount),
    capacity = coalesce(eo.capacity, lr.capacity),
    details = coalesce(eo.details, lr.source_description),
    evidence_state = case
      when eo.evidence_state = 'single_source' then 'corroborated'
      else eo.evidence_state
    end,
    updated_at = timezone('utc', now())
  from pg_temp.lifecycle_refresh lr
  where eo.id = lr.bound_occurrence_id
    and (
      (eo.end_time is null and lr.end_time is not null)
      or (eo.entry_fee is null and lr.fee_amount is not null)
      or (eo.capacity is null and lr.capacity is not null)
      or (eo.details is null and lr.source_description is not null)
      or eo.evidence_state = 'single_source'
    );

  insert into public.event_sources (source_id, occurrence_id, relationship)
  select lr.source_id, lr.bound_occurrence_id, 'schedule'
  from pg_temp.lifecycle_refresh lr
  where lr.source_id is not null
    and lr.bound_occurrence_id is not null
    and not exists (
      select 1
      from public.event_sources existing
      where existing.source_id = lr.source_id
        and existing.occurrence_id = lr.bound_occurrence_id
        and existing.relationship = 'schedule'
    );

  update public.event_source_bindings b
  set
    observation_id = lr.observation_id,
    last_verified_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  from pg_temp.lifecycle_refresh lr
  where b.id = lr.binding_id;

  update public.event_series es
  set last_verified = current_date,
      updated_at = timezone('utc', now())
  where es.id in (
    select distinct coalesce(lr.bound_series_id, lr.occurrence_series_id)
    from pg_temp.lifecycle_refresh lr
  );

  update public.event_observations o
  set reconcile_state = 'bound',
      updated_at = timezone('utc', now())
  from pg_temp.lifecycle_refresh lr
  where o.id = lr.observation_id;

  insert into public.coordination_items (
    origin, target, item_type, status, priority, title, summary, details,
    related_entity_type, related_entity_id, confidence, observed_at,
    recommended_action, deduplication_key
  )
  select
    'automation',
    'codex',
    'research_finding',
    'new',
    case lr.review_kind
      when 'upstream_status_review' then 75
      when 'schedule_changed_review' then 70
      else 60
    end,
    'Review event lifecycle change: ' || lr.canonical_title,
    case lr.review_kind
      when 'upstream_status_review' then 'A bound source event is no longer scheduled upstream. Review before changing canonical event status.'
      when 'schedule_changed_review' then 'A bound source event now has a different date or time. Review before moving the canonical occurrence.'
      when 'venue_mismatch_review' then 'A bound source event now points at a different venue. Review attribution before changing canonical rows.'
      when 'title_changed_review' then 'A bound source event title changed materially. Review before merging or splitting event identity.'
      else 'A bound source event changed in a way the safe promoter does not mutate automatically.'
    end,
    jsonb_build_object(
      'inboxKind', 'event_lifecycle_review',
      'reviewKind', lr.review_kind,
      'sourceFamily', lr.source_family,
      'upstreamEventId', lr.upstream_event_id,
      'sourceId', lr.source_id,
      'sourceUrl', lr.source_url,
      'canonicalOccurrenceId', lr.bound_occurrence_id,
      'canonicalSeriesId', coalesce(lr.bound_series_id, lr.occurrence_series_id),
      'canonicalDate', lr.canonical_date,
      'canonicalStartTime', lr.canonical_start_time,
      'observedDate', lr.occurrence_date,
      'observedStartTime', lr.start_time,
      'sourceStatus', lr.source_status,
      'canonicalTitle', lr.canonical_title,
      'observedTitle', lr.title
    ),
    'event_occurrence',
    lr.bound_occurrence_id,
    0.8,
    timezone('utc', now()),
    'Review the source record and decide whether to mark the occurrence cancelled, moved, split, or unchanged.',
    'event-lifecycle:' || lr.source_family || ':' || lr.upstream_event_id || ':' || lr.review_kind
  from pg_temp.lifecycle_review lr
  on conflict (deduplication_key) do update set
    updated_at = timezone('utc', now()),
    summary = excluded.summary,
    details = excluded.details,
    observed_at = excluded.observed_at,
    recommended_action = excluded.recommended_action
  where public.coordination_items.status not in ('completed', 'rejected', 'superseded');

  if to_regclass('pg_temp.lifecycle_missing') is not null then
    insert into public.coordination_items (
      origin, target, item_type, status, priority, title, summary, details,
      related_entity_type, related_entity_id, confidence, observed_at,
      effective_date, recommended_action, deduplication_key
    )
    select
      'automation',
      'codex',
      'research_finding',
      'new',
      65,
      'Review disappeared WPN event: ' || lm.canonical_title,
      'A future WPN-backed occurrence has been missing from two consecutive WPN snapshots. Treat as at-risk/review before cancelling.',
      jsonb_build_object(
        'inboxKind', 'event_lifecycle_review',
        'reviewKind', 'wpn_disappeared_twice',
        'sourceFamily', lm.source_family,
        'upstreamEventId', lm.upstream_event_id,
        'canonicalOccurrenceId', lm.occurrence_id,
        'canonicalSeriesId', lm.series_id,
        'canonicalDate', lm.occurrence_date,
        'canonicalStartTime', lm.start_time,
        'consecutiveMissing', lm.consecutive_missing,
        'sourceState', lm.source_state
      ),
      'event_occurrence',
      lm.occurrence_id,
      0.7,
      timezone('utc', now()),
      lm.occurrence_date,
      'Check peer/current sources before marking the occurrence at-risk, cancelled, or unchanged.',
      'event-lifecycle:wpn:' || lm.upstream_event_id || ':disappeared-twice'
    from pg_temp.lifecycle_missing lm
    on conflict (deduplication_key) do update set
      updated_at = timezone('utc', now()),
      summary = excluded.summary,
      details = excluded.details,
      observed_at = excluded.observed_at,
      effective_date = excluded.effective_date,
      recommended_action = excluded.recommended_action
    where public.coordination_items.status not in ('completed', 'rejected', 'superseded');
  end if;

  update public.event_ingest_runs r
  set result_counts = r.result_counts || jsonb_build_object(
    'lifecycle_refreshed_bound_events', v_refresh_count,
    'lifecycle_review_items', v_review_count,
    'lifecycle_disappearance_review_items', v_missing_count
  )
  where r.id = p_ingest_run_id;

  return query values
    ('refresh_existing_bound_events'::text, v_refresh_count, v_refresh_count > 0),
    ('queue_changed_or_cancelled_review'::text, v_review_count, v_review_count > 0),
    ('queue_disappearance_review'::text, v_missing_count, v_missing_count > 0);
end;
$$;

revoke all on function public.reconcile_existing_event_lifecycle(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.reconcile_existing_event_lifecycle(uuid, boolean)
  to service_role;

comment on function public.reconcile_existing_event_lifecycle(uuid, boolean) is
  'Service-only lifecycle reconciler for already-bound observations: null-safe fact refresh, deduped review items for source status/schedule/title conflicts, and WPN disappeared-twice review.';

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

  perform * from public.reconcile_targeted_recurring_observations(p_ingest_run_id, p_dry_run);
  perform * from public.reconcile_event_ingest_run(p_ingest_run_id, null, p_dry_run);
  perform * from public.reconcile_new_event_series(p_ingest_run_id, p_dry_run);
  perform * from public.reconcile_existing_event_lifecycle(p_ingest_run_id, p_dry_run);

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
  'Service-only source-neutral event promoter: reconciles catalog rows, handles safe existing-event lifecycle refresh/review, suppresses bootstrap novelty, groups Updates, and emits only explicitly annotated Signals.';
