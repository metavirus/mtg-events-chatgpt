create or replace function public.reconcile_new_event_series(
  p_ingest_run_id uuid,
  p_dry_run boolean default true
)
returns table(
  observation_id uuid,
  canonical_action text,
  series_id text,
  occurrence_id text,
  hidden_by_rule boolean,
  outcome text,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_selected integer := 0;
  v_written integer := 0;
begin
  if not exists (
    select 1 from public.event_ingest_runs r where r.id = p_ingest_run_id
  ) then
    raise exception 'unknown ingest run: %', p_ingest_run_id;
  end if;

  drop table if exists pg_temp.new_series_candidates;
  create temporary table new_series_candidates on commit drop as
  with raw_candidates as (
    select
      o.*,
      case
        when o.venue_id is not null then 'venue'
        when o.organizer_type = 'community' and o.organizer_id is not null then 'community'
      end as owner_entity_type,
      case
        when o.venue_id is not null then o.venue_id
        when o.organizer_type = 'community' and o.organizer_id is not null then o.organizer_id
      end as owner_entity_id,
      coalesce(
        v.name,
        c.name,
        o.organizer_name,
        o.physical_location_text
      ) as owner_display_name,
      b.series_id as bound_series_id,
      b.occurrence_id as bound_occurrence_id,
      b.match_method as bound_match_method,
      exists (
        select 1
        from public.entity_preferences ep
        where ep.entity_type = case
            when o.venue_id is not null then 'venue'
            when o.organizer_type = 'community' and o.organizer_id is not null then 'community'
          end
          and ep.entity_id = case
            when o.venue_id is not null then o.venue_id
            when o.organizer_type = 'community' and o.organizer_id is not null then o.organizer_id
          end
          and ep.visibility_preference in ('deprioritize', 'hide')
      ) or o.proxy_policy = 'prohibited' as inherited_hidden,
      exists (
        select 1
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        where (
            (o.venue_id is not null and es.venue_id = o.venue_id)
            or (
              o.venue_id is null
              and o.organizer_type = 'community'
              and es.community_id = o.organizer_id
            )
          )
          and eo.occurrence_date = o.occurrence_date
          and eo.start_time is not distinct from o.start_time
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
      ) as exact_occurrence,
      exists (
        select 1
        from public.event_series es
        where (
            (o.venue_id is not null and es.venue_id = o.venue_id)
            or (
              o.venue_id is null
              and o.organizer_type = 'community'
              and es.community_id = o.organizer_id
            )
          )
          and es.recurrence->>'frequency' = 'weekly'
          and (es.recurrence->>'dayOfWeek')::integer =
            extract(dow from o.occurrence_date)::integer
          and es.default_start_time is not distinct from o.start_time
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
          and (es.start_date is null or es.start_date <= o.occurrence_date)
          and (es.end_date is null or es.end_date >= o.occurrence_date)
      ) as exact_recurring,
      exists (
        select 1
        from public.event_series es
        where (
            (o.venue_id is not null and es.venue_id = o.venue_id)
            or (
              o.venue_id is null
              and o.organizer_type = 'community'
              and es.community_id = o.organizer_id
            )
          )
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
      ) as known_title,
      exists (
        select 1
        from (
          select es.id
          from public.event_occurrences eo
          join public.event_series es on es.id = eo.series_id
          where (
              (o.venue_id is not null and es.venue_id = o.venue_id)
              or (
                o.venue_id is null
                and o.organizer_type = 'community'
                and es.community_id = o.organizer_id
              )
            )
            and eo.occurrence_date = o.occurrence_date
            and eo.start_time is not distinct from o.start_time
          union
          select es.id
          from public.event_series es
          where (
              (o.venue_id is not null and es.venue_id = o.venue_id)
              or (
                o.venue_id is null
                and o.organizer_type = 'community'
                and es.community_id = o.organizer_id
              )
            )
            and es.recurrence->>'frequency' = 'weekly'
            and (es.recurrence->>'dayOfWeek')::integer =
              extract(dow from o.occurrence_date)::integer
            and es.default_start_time is not distinct from o.start_time
        ) occupied
      ) as occupied_slot
    from public.event_observations o
    left join public.event_source_bindings b
      on b.source_family = o.source_family
     and b.upstream_event_id = o.upstream_event_id
    left join public.venues v on v.id = o.venue_id
    left join public.communities c
      on o.venue_id is null
     and o.organizer_type = 'community'
     and c.id = o.organizer_id
    where o.ingest_run_id = p_ingest_run_id
      and (
        o.reconcile_state = 'pending'
        or b.match_method in (
          'create_bounded_recurring_series',
          'create_finite_or_single_series'
        )
      )
  ), eligible as (
    select
      r.*,
      case
        when r.event_type = 'prerelease' and r.template_hint_key is not null
          then r.template_hint_key || ':title:' || r.normalized_title_key
        else r.series_hint_key
      end as family_key
    from raw_candidates r
    where r.bound_match_method in (
        'create_bounded_recurring_series',
        'create_finite_or_single_series'
      )
      or (
        r.bound_match_method is null
        and r.promotion_eligibility = 'eligible'
        and r.owner_entity_type is not null
        and r.owner_entity_id is not null
        and r.series_hint_key is not null
        and not r.exact_occurrence
        and not r.exact_recurring
        and not r.known_title
        and not r.occupied_slot
      )
  ), family_stats as (
    select
      e.family_key,
      count(*) as row_count,
      count(distinct e.owner_entity_type || ':' || e.owner_entity_id) as owner_count,
      count(distinct e.source_family) as source_family_count,
      count(distinct e.normalized_title_key) as title_count,
      count(distinct coalesce(e.format, '')) as format_count,
      count(distinct coalesce(e.event_type, '')) as event_type_count,
      count(distinct coalesce(e.product_or_set_id, '')) as product_count,
      count(distinct coalesce(e.proxy_policy, '')) as proxy_count,
      count(distinct coalesce(e.team_size, 1)) as team_size_count,
      count(distinct coalesce(e.bracket, '')) as bracket_count,
      count(distinct extract(dow from e.occurrence_date)::integer) as weekday_count,
      count(distinct e.start_time) as start_time_count,
      count(distinct e.occurrence_date) as date_count,
      min(e.occurrence_date) as first_date,
      max(e.occurrence_date) as last_date,
      min(e.owner_entity_type) as owner_entity_type,
      min(e.owner_entity_id) as owner_entity_id,
      min(e.owner_display_name) as owner_display_name,
      min(e.venue_id) as venue_id,
      min(e.organizer_id) filter (where e.organizer_type = 'community') as community_id,
      min(e.title) as title,
      min(e.format) as source_format,
      min(e.event_type) as source_event_type,
      min(e.bracket) as bracket,
      min(e.start_time) as start_time,
      min(e.fee_amount) filter (where e.fee_amount is not null) as min_fee,
      max(e.fee_amount) filter (where e.fee_amount is not null) as max_fee,
      min(e.fee_currency) filter (where e.fee_currency is not null) as currency,
      min(e.bound_series_id) filter (where e.bound_series_id is not null) as bound_series_id,
      count(distinct e.bound_series_id) filter (where e.bound_series_id is not null)
        as bound_series_count
    from eligible e
    group by e.family_key
  ), safe_families as (
    select
      f.*,
      coalesce(
        f.bound_series_id,
        f.owner_entity_id || '-ingest-' || substr(md5(f.family_key), 1, 16)
      ) as canonical_series_id,
      case
        when f.row_count > 1
          and f.weekday_count = 1
          and f.start_time_count = 1
          and (f.last_date - f.first_date) = 7 * (f.date_count - 1)
          then 'create_bounded_recurring_series'
        else 'create_finite_or_single_series'
      end as canonical_action
    from family_stats f
    where f.family_key is not null
      and f.owner_count = 1
      and f.source_family_count = 1
      and f.title_count = 1
      and f.format_count = 1
      and f.event_type_count = 1
      and f.product_count = 1
      and f.proxy_count = 1
      and f.team_size_count = 1
      and f.bracket_count = 1
      and f.bound_series_count <= 1
  )
  select
    e.id as observation_id,
    f.canonical_action,
    f.canonical_series_id as series_id,
    e.bound_occurrence_id as occurrence_id,
    e.inherited_hidden as hidden_by_rule,
    e.source_family,
    e.source_id,
    e.upstream_event_id,
    e.occurrence_date,
    e.start_time,
    e.end_time,
    e.fee_amount,
    e.capacity,
    e.source_description,
    e.bound_match_method is not null as already_bound,
    f.family_key,
    f.row_count,
    f.first_date,
    f.last_date,
    f.owner_entity_type,
    f.owner_entity_id,
    f.owner_display_name,
    f.venue_id,
    f.community_id,
    f.title,
    case f.source_format
      when 'Booster Draft' then 'Draft'
      when 'Sealed Deck' then 'Sealed'
      when 'Other' then 'Magic'
      else f.source_format
    end as canonical_format,
    coalesce(
      f.source_event_type,
      case f.source_format
        when 'Booster Draft' then 'draft'
        when 'Sealed Deck' then 'limited'
        when 'Commander' then 'commander'
        else 'constructed'
      end
    ) as canonical_event_type,
    f.bracket,
    f.start_time as family_start_time,
    case when f.min_fee is not distinct from f.max_fee then f.min_fee end as common_fee,
    coalesce(f.currency, 'USD') as currency,
    f.canonical_action = 'create_bounded_recurring_series' as is_recurring
  from eligible e
  join safe_families f on f.family_key = e.family_key;

  select count(*) into v_selected from new_series_candidates;

  if p_dry_run then
    return query
    select
      c.observation_id,
      c.canonical_action,
      c.series_id,
      c.occurrence_id,
      c.hidden_by_rule,
      case when c.already_bound then 'replayed' else 'validated' end::text,
      false
    from new_series_candidates c
    order by c.series_id, c.occurrence_date, c.start_time, c.observation_id;
    return;
  end if;

  insert into public.event_series (
    id, venue_id, community_id, title, format, event_type, bracket, recurrence,
    default_start_time, start_date, end_date, entry_fee, currency, details,
    confidence, event_status, last_verified
  )
  select distinct on (c.series_id)
    c.series_id,
    case when c.owner_entity_type = 'venue' then c.venue_id end,
    case when c.owner_entity_type = 'community' then c.community_id end,
    c.title,
    c.canonical_format,
    c.canonical_event_type,
    c.bracket,
    case when c.is_recurring then jsonb_build_object(
      'frequency', 'weekly',
      'dayOfWeek', extract(dow from c.first_date)::integer,
      'startTime', to_char(c.family_start_time, 'HH24:MI')
    ) end,
    case when c.is_recurring then c.family_start_time end,
    c.first_date,
    case when c.row_count > 1 then c.last_date end,
    c.common_fee,
    c.currency,
    'Attributed source inventory. Open a dated occurrence for source-specific details.',
    'medium',
    'active',
    current_date
  from new_series_candidates c
  order by c.series_id, c.observation_id
  on conflict (id) do update set
    start_date = least(public.event_series.start_date, excluded.start_date),
    end_date = greatest(public.event_series.end_date, excluded.end_date),
    last_verified = excluded.last_verified,
    updated_at = timezone('utc', now());

  insert into public.event_occurrences (
    id, series_id, occurrence_date, start_time, end_time, evidence_state,
    occurrence_status, entry_fee, capacity, details
  )
  select
    c.series_id || '-' || c.source_family || '-' || c.upstream_event_id,
    c.series_id,
    c.occurrence_date,
    c.start_time,
    c.end_time,
    'single_source',
    'confirmed',
    c.fee_amount,
    c.capacity,
    c.source_description
  from new_series_candidates c
  where not c.already_bound
  on conflict on constraint event_occurrences_series_id_occurrence_date_start_time_key
  do update set
    end_time = coalesce(public.event_occurrences.end_time, excluded.end_time),
    entry_fee = coalesce(public.event_occurrences.entry_fee, excluded.entry_fee),
    capacity = coalesce(public.event_occurrences.capacity, excluded.capacity),
    details = coalesce(public.event_occurrences.details, excluded.details);

  update new_series_candidates c
  set occurrence_id = eo.id
  from public.event_occurrences eo
  where eo.series_id = c.series_id
    and eo.occurrence_date = c.occurrence_date
    and eo.start_time is not distinct from c.start_time;

  insert into public.event_sources (source_id, occurrence_id, relationship)
  select c.source_id, c.occurrence_id, 'schedule'
  from new_series_candidates c
  where c.source_id is not null
    and c.occurrence_id is not null
    and not c.already_bound
    and not exists (
      select 1
      from public.event_sources es
      where es.source_id = c.source_id
        and es.occurrence_id = c.occurrence_id
    );

  insert into public.event_source_bindings (
    source_family, upstream_event_id, observation_id, series_id, occurrence_id,
    match_method, match_confidence
  )
  select
    c.source_family,
    c.upstream_event_id,
    c.observation_id,
    c.series_id,
    c.occurrence_id,
    c.canonical_action,
    'exact'
  from new_series_candidates c
  where not c.already_bound
  on conflict (source_family, upstream_event_id) do update set
    observation_id = excluded.observation_id,
    series_id = excluded.series_id,
    occurrence_id = excluded.occurrence_id,
    match_method = excluded.match_method,
    match_confidence = excluded.match_confidence,
    last_verified_at = timezone('utc', now());

  update public.event_observations o
  set reconcile_state = 'bound'
  from new_series_candidates c
  where o.id = c.observation_id
    and not c.already_bound;

  get diagnostics v_written = row_count;

  update public.event_ingest_runs r
  set result_counts = r.result_counts || jsonb_build_object(
    'new_series_selected', v_selected,
    'new_series_written', v_written,
    'new_series_replayed', v_selected - v_written,
    'new_series_created', (
      select count(distinct c.series_id)
      from new_series_candidates c
      where not c.already_bound
    ),
    'new_series_hidden_by_rule', (
      select count(*) from new_series_candidates c where c.hidden_by_rule
    )
  )
  where r.id = p_ingest_run_id;

  return query
  select
    c.observation_id,
    c.canonical_action,
    c.series_id,
    c.occurrence_id,
    c.hidden_by_rule,
    case when c.already_bound then 'replayed' else 'applied' end::text,
    not c.already_bound
  from new_series_candidates c
  order by c.series_id, c.occurrence_date, c.start_time, c.observation_id;
end;
$$;

revoke all on function public.reconcile_new_event_series(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.reconcile_new_event_series(uuid, boolean)
  to service_role;

comment on function public.reconcile_new_event_series(uuid, boolean) is
  'Service-only deterministic creator for collision-free event series families. Supports venue-owned and community-owned events; physical locations are not treated as owners.';

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
        where ep.entity_type = case
            when o.venue_id is not null then 'venue'
            when o.organizer_type = 'community' and o.organizer_id is not null then 'community'
          end
          and ep.entity_id = case
            when o.venue_id is not null then o.venue_id
            when o.organizer_type = 'community' and o.organizer_id is not null then o.organizer_id
          end
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
      select
        o.*,
        b.series_id,
        b.occurrence_id,
        case
          when o.venue_id is not null then 'venue'
          when o.organizer_type = 'community' and o.organizer_id is not null then 'community'
        end as owner_entity_type,
        case
          when o.venue_id is not null then o.venue_id
          when o.organizer_type = 'community' and o.organizer_id is not null then o.organizer_id
        end as owner_entity_id,
        coalesce(v.name, c.name, o.organizer_name, o.physical_location_text) as owner_name
      from public.event_observations o
      join public.event_source_bindings b
        on b.source_family = o.source_family
       and b.upstream_event_id = o.upstream_event_id
      left join public.venues v on v.id = o.venue_id
      left join public.communities c
        on o.venue_id is null
       and o.organizer_type = 'community'
       and c.id = o.organizer_id
      where o.first_ingest_run_id = p_ingest_run_id
        and b.first_bound_at >= v_run.started_at
        and (
          o.venue_id is not null
          or (o.organizer_type = 'community' and o.organizer_id is not null)
        )
        and not (
          o.proxy_policy = 'prohibited'
          or exists (
            select 1 from public.entity_preferences ep
            where ep.entity_type = case
                when o.venue_id is not null then 'venue'
                when o.organizer_type = 'community' and o.organizer_id is not null then 'community'
              end
              and ep.entity_id = case
                when o.venue_id is not null then o.venue_id
                when o.organizer_type = 'community' and o.organizer_id is not null then o.organizer_id
              end
              and ep.visibility_preference in ('deprioritize', 'hide')
          )
        )
    ), grouped as (
      select
        owner_entity_type,
        owner_entity_id,
        min(owner_name) as owner_name,
        count(*)::integer as occurrence_count,
        count(distinct series_id)::integer as series_count,
        min(occurrence_date) as first_date,
        max(occurrence_date) as last_date,
        string_agg(distinct title, '; ' order by title) as titles,
        string_agg(distinct source_family, ', ' order by source_family) as source_families
      from visible_new
      group by owner_entity_type, owner_entity_id
    ), inserted as (
      insert into public.research_changes (
        id, detected_at, change_type, entity_type, entity_id,
        summary, details, review_status
      )
      select
        'event-ingest:' || p_ingest_run_id::text || ':' || g.owner_entity_type || ':' || g.owner_entity_id,
        timezone('utc', now()),
        'event_ingest_delta',
        g.owner_entity_type,
        g.owner_entity_id,
        g.owner_name || ': ' || g.occurrence_count ||
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
            where ep.entity_type = case
                when o.venue_id is not null then 'venue'
                when o.organizer_type = 'community' and o.organizer_id is not null then 'community'
              end
              and ep.entity_id = case
                when o.venue_id is not null then o.venue_id
                when o.organizer_type = 'community' and o.organizer_id is not null then o.organizer_id
              end
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
        case when a.attention_category = 'mention' then 'personal_reminder' else 'event_proposal' end,
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
  where id = p_ingest_run_id;
  raise;
end;
$$;

revoke all on function public.promote_event_ingest_run(uuid, text, boolean)
  from public, anon, authenticated;
grant execute on function public.promote_event_ingest_run(uuid, text, boolean)
  to service_role;

comment on function public.promote_event_ingest_run(uuid, text, boolean) is
  'Service-only presentation step for event ingest deltas. Groups by canonical owner: venue for store-run events, community for community-organized events; physical host locations remain descriptive context only.';
