create or replace function public.upsert_attributable_official_event(
  p_idempotency_key text,
  p_venue_id text,
  p_series_id text,
  p_occurrence_id text,
  p_title text,
  p_format text,
  p_event_type text,
  p_occurrence_date date,
  p_start_time time,
  p_source_id text,
  p_source_label text,
  p_source_url text,
  p_summary text,
  p_source_type text default 'eventsPage',
  p_series_start_date date default null,
  p_series_end_date date default null,
  p_bracket text default null,
  p_entry_fee numeric default null,
  p_details text default null,
  p_end_time time default null,
  p_confidence text default 'medium',
  p_evidence_state text default 'single_source',
  p_occurrence_status text default 'confirmed',
  p_last_verified date default current_date,
  p_dry_run boolean default false
)
returns table (
  series_id text,
  occurrence_id text,
  source_id text,
  outcome text,
  wrote boolean,
  research_change_id text
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_result record;
  v_series_start_date date;
  v_series_end_date date;
begin
  if p_source_type not in (
    'official',
    'officialWebsite',
    'eventsPage',
    'eventPlatform',
    'calendar'
  ) then
    raise exception 'unsupported official event source_type: %', p_source_type;
  end if;

  v_series_start_date := coalesce(p_series_start_date, p_occurrence_date);
  v_series_end_date := coalesce(p_series_end_date, v_series_start_date);

  if v_series_end_date < v_series_start_date
     or p_occurrence_date < v_series_start_date
     or p_occurrence_date > v_series_end_date then
    raise exception 'occurrence_date must fall within the series date range';
  end if;

  select *
  into v_result
  from public.upsert_attributable_wpn_event(
    p_idempotency_key => 'official:' || p_idempotency_key,
    p_venue_id => p_venue_id,
    p_series_id => p_series_id,
    p_occurrence_id => p_occurrence_id,
    p_title => p_title,
    p_format => p_format,
    p_event_type => p_event_type,
    p_occurrence_date => p_occurrence_date,
    p_start_time => p_start_time,
    p_source_id => p_source_id,
    p_source_label => p_source_label,
    p_source_url => p_source_url,
    p_summary => p_summary,
    p_bracket => p_bracket,
    p_entry_fee => p_entry_fee,
    p_details => p_details,
    p_end_time => p_end_time,
    p_confidence => p_confidence,
    p_evidence_state => p_evidence_state,
    p_occurrence_status => p_occurrence_status,
    p_last_verified => p_last_verified,
    p_dry_run => p_dry_run
  );

  if v_result.wrote then
    update public.sources
    set source_type = p_source_type,
        updated_at = timezone('utc', now())
    where id = p_source_id;

    update public.entity_sources
    set relationship = 'official_event_listing'
    where entity_type = 'venue'
      and entity_id = p_venue_id
      and source_id = p_source_id;

    update public.event_sources
    set relationship = 'official_event_listing'
    where source_id = p_source_id
      and (
        (series_id = p_series_id and occurrence_id is null)
        or (occurrence_id = p_occurrence_id and series_id is null)
      );

    update public.event_series
    set start_date = v_series_start_date,
        end_date = v_series_end_date,
        default_start_time = case
          when v_series_start_date = v_series_end_date then p_start_time
          else null
        end,
        updated_at = timezone('utc', now())
    where id = p_series_id;
  end if;

  return query
    select
      v_result.series_id,
      v_result.occurrence_id,
      v_result.source_id,
      v_result.outcome,
      v_result.wrote,
      v_result.research_change_id;
end;
$$;

comment on function public.upsert_attributable_official_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  date,
  date,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) is
  'Typed steward-only routine path for one attributable dated event occurrence from an official store-controlled event surface. Explicit series bounds support multi-session events.';

revoke all on function public.upsert_attributable_official_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  date,
  date,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) from public;

revoke all on function public.upsert_attributable_official_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  date,
  date,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) from anon;

revoke all on function public.upsert_attributable_official_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  date,
  date,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) from authenticated;

grant execute on function public.upsert_attributable_official_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  date,
  date,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) to service_role;
