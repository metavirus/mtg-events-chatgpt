drop function if exists public.stage_official_event_observation(
  text, text, text, text, text, text, date, time, text, text, text, text,
  time, numeric, text, text, text, text, text, text, text, boolean
);

create or replace function public.stage_official_event_observation(
  p_run_key text,
  p_upstream_event_id text,
  p_venue_id text,
  p_title text,
  p_format text,
  p_event_type text,
  p_occurrence_date date,
  p_start_time time,
  p_source_id text,
  p_source_label text,
  p_source_url text,
  p_source_type text default 'eventsPage',
  p_end_time time default null,
  p_entry_fee numeric default null,
  p_details text default null,
  p_bracket text default null,
  p_proxy_policy text default 'unspecified',
  p_attention_category text default null,
  p_attention_priority text default null,
  p_attention_summary text default null,
  p_suggested_action text default null,
  p_dry_run boolean default true,
  p_source_artifact_id uuid default null
)
returns table(
  ingest_run_id uuid,
  observation_id uuid,
  outcome text,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_run public.event_ingest_runs%rowtype;
  v_observation public.event_observations%rowtype;
  v_fingerprint text;
  v_existing boolean;
  v_source_family text;
begin
  if p_source_type not in (
    'official', 'officialWebsite', 'eventsPage', 'eventPlatform', 'calendar',
    'instagram', 'facebook', 'social'
  ) then
    raise exception 'unsupported official/source-controlled source type: %', p_source_type;
  end if;
  if not exists (select 1 from public.venues v where v.id = p_venue_id) then
    raise exception 'unknown venue: %', p_venue_id;
  end if;
  if p_source_artifact_id is not null
     and not exists (select 1 from public.source_artifacts a where a.id = p_source_artifact_id) then
    raise exception 'unknown source_artifact: %', p_source_artifact_id;
  end if;
  if nullif(btrim(p_run_key), '') is null
     or nullif(btrim(p_upstream_event_id), '') is null
     or nullif(btrim(p_title), '') is null
     or nullif(btrim(p_source_id), '') is null
     or nullif(btrim(p_source_label), '') is null
     or nullif(btrim(p_source_url), '') is null then
    raise exception 'run key, upstream ID, title, source ID, label, and URL are required';
  end if;
  if p_proxy_policy not in ('allowed', 'prohibited', 'unspecified') then
    raise exception 'unsupported proxy policy: %', p_proxy_policy;
  end if;
  if (p_attention_category is null) <> (p_attention_priority is null)
     or (p_attention_category is null) <> (p_attention_summary is null)
     or (p_attention_category is null) <> (p_suggested_action is null) then
    raise exception 'attention category, priority, summary, and action must be supplied together';
  end if;

  v_source_family := case
    when p_source_type in ('instagram', 'facebook', 'social') then p_source_type
    else 'official'
  end;

  v_fingerprint := md5(concat_ws('|',
    p_upstream_event_id, p_venue_id, p_title, p_format, p_event_type,
    p_occurrence_date::text, p_start_time::text, p_end_time::text,
    p_entry_fee::text, p_source_id, p_source_url, p_details, p_bracket,
    p_proxy_policy, p_attention_category, p_attention_priority,
    p_attention_summary, p_suggested_action, p_source_artifact_id::text
  ));

  if p_dry_run then
    return query select null::uuid, null::uuid, 'validated'::text, false;
    return;
  end if;

  select * into v_run
  from public.event_ingest_runs r
  where r.idempotency_key = v_source_family || '-observation:' || p_run_key;

  if found and v_run.input_fingerprint <> v_fingerprint then
    raise exception 'run key % was already used with different content', p_run_key;
  end if;

  if not found then
    insert into public.event_ingest_runs (
      idempotency_key, source_family, adapter_version, input_fingerprint,
      run_mode, run_status
    ) values (
      v_source_family || '-observation:' || p_run_key,
      v_source_family, 2, v_fingerprint, 'live', 'staged'
    ) returning * into v_run;
  end if;

  insert into public.sources (
    id, label, url, source_type, health_status, last_checked
  ) values (
    p_source_id, btrim(p_source_label), btrim(p_source_url), p_source_type,
    'current', current_date
  )
  on conflict (id) do update set
    label = excluded.label,
    url = excluded.url,
    source_type = excluded.source_type,
    health_status = 'current',
    last_checked = current_date,
    updated_at = timezone('utc', now());

  insert into public.entity_sources (
    entity_type, entity_id, source_id, relationship
  ) values (
    'venue', p_venue_id, p_source_id, 'official_event_listing'
  )
  on conflict on constraint entity_sources_pkey do update set
    relationship = excluded.relationship;

  if p_source_artifact_id is not null then
    perform public.link_source_artifact(
      p_source_artifact_id,
      'venue',
      p_venue_id,
      'event_evidence',
      false
    );
  end if;

  select exists (
    select 1 from public.event_observations o
    where o.source_family = v_source_family
      and o.upstream_event_id = p_upstream_event_id
  ) into v_existing;

  insert into public.event_observations (
    ingest_run_id, first_ingest_run_id, source_family, source_id, source_type,
    publisher_key, upstream_event_id, source_url, source_artifact_id,
    observed_at, first_seen_at, last_seen_at, content_fingerprint,
    identity_fingerprint, extraction_method, extraction_confidence,
    organizer_type, organizer_id, organizer_name, venue_id,
    physical_location_text, venue_match_method, venue_match_confidence,
    attribution_state, title, normalized_title_key, format, event_type,
    occurrence_date, start_time, end_time, source_timezone, series_hint_key,
    source_status, fee_amount, fee_currency, bracket, proxy_policy,
    source_description, field_presence, source_native_payload,
    promotion_eligibility, reconcile_state, attention_category,
    attention_priority, attention_summary, suggested_action
  )
  select
    v_run.id, v_run.id, v_source_family, p_source_id, p_source_type, p_source_id,
    p_upstream_event_id, btrim(p_source_url), p_source_artifact_id,
    timezone('utc', now()), timezone('utc', now()), timezone('utc', now()),
    v_fingerprint,
    md5(concat_ws('|', p_venue_id, public.normalize_event_identity_text(p_title),
      p_occurrence_date::text, p_start_time::text)),
    'typed_official_adapter', 'exact', 'venue', p_venue_id, v.name, p_venue_id,
    concat_ws(', ', v.name, v.city), 'exact_id', 'exact',
    'official_venue_programming', btrim(p_title),
    public.normalize_event_identity_text(p_title), nullif(btrim(p_format), ''),
    nullif(btrim(p_event_type), ''), p_occurrence_date, p_start_time, p_end_time,
    'America/Los_Angeles',
    concat_ws(':', v_source_family, p_venue_id,
      public.normalize_event_identity_text(p_title)),
    'scheduled', p_entry_fee, 'USD', nullif(btrim(p_bracket), ''),
    p_proxy_policy, nullif(btrim(p_details), ''),
    jsonb_strip_nulls(jsonb_build_object(
      'title', true, 'date', true, 'startTime', p_start_time is not null,
      'endTime', p_end_time is not null, 'entryFee', p_entry_fee is not null,
      'bracket', p_bracket is not null, 'proxyPolicy', true,
      'sourceArtifact', p_source_artifact_id is not null
    )),
    jsonb_strip_nulls(jsonb_build_object(
      'sourceLabel', p_source_label,
      'sourceArtifactId', p_source_artifact_id
    )),
    'eligible', 'pending',
    p_attention_category, p_attention_priority, p_attention_summary,
    p_suggested_action
  from public.venues v
  where v.id = p_venue_id
  on conflict (source_family, upstream_event_id) do update set
    ingest_run_id = excluded.ingest_run_id,
    source_id = excluded.source_id,
    source_type = excluded.source_type,
    source_url = excluded.source_url,
    source_artifact_id = excluded.source_artifact_id,
    observed_at = excluded.observed_at,
    last_seen_at = excluded.last_seen_at,
    content_fingerprint = excluded.content_fingerprint,
    extraction_method = excluded.extraction_method,
    extraction_confidence = excluded.extraction_confidence,
    title = excluded.title,
    normalized_title_key = excluded.normalized_title_key,
    format = excluded.format,
    event_type = excluded.event_type,
    occurrence_date = excluded.occurrence_date,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    fee_amount = excluded.fee_amount,
    bracket = excluded.bracket,
    proxy_policy = excluded.proxy_policy,
    source_description = excluded.source_description,
    field_presence = excluded.field_presence,
    source_native_payload = excluded.source_native_payload,
    attention_category = excluded.attention_category,
    attention_priority = excluded.attention_priority,
    attention_summary = excluded.attention_summary,
    suggested_action = excluded.suggested_action,
    updated_at = timezone('utc', now())
  returning * into v_observation;

  update public.event_ingest_runs r
  set finished_at = timezone('utc', now()),
      result_counts = r.result_counts || jsonb_build_object(
        'inserted', case when v_existing then 0 else 1 end,
        'refreshed', case when v_existing then 1 else 0 end,
        'eligible', 1,
        'held', 0
      )
  where r.id = v_run.id;

  return query select v_run.id, v_observation.id,
    case when v_existing then 'replayed' else 'staged' end::text,
    not v_existing;
end;
$$;

revoke all on function public.stage_official_event_observation(
  text, text, text, text, text, text, date, time, text, text, text, text,
  time, numeric, text, text, text, text, text, text, text, boolean, uuid
) from public, anon, authenticated;
grant execute on function public.stage_official_event_observation(
  text, text, text, text, text, text, date, time, text, text, text, text,
  time, numeric, text, text, text, text, text, text, text, boolean, uuid
) to service_role;

comment on function public.stage_official_event_observation(
  text, text, text, text, text, text, date, time, text, text, text, text,
  time, numeric, text, text, text, text, text, text, text, boolean, uuid
) is
  'Service-only typed adapter for one store-controlled event observation, including official social artifacts. Canonical writes and presentation remain the shared promoter responsibility.';
