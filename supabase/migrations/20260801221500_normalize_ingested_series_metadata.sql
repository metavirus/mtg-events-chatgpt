create or replace function public.normalize_ingested_event_series_metadata()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.id like '%-ingest-%'
    and new.format = 'Magic'
    and new.title ~* '(^|[^a-z])premodern([^a-z]|$)'
  then
    new.format := 'Premodern';
  end if;
  return new;
end;
$$;

revoke all on function public.normalize_ingested_event_series_metadata()
from public, anon, authenticated;

drop trigger if exists event_series_normalize_ingested_metadata
on public.event_series;
create trigger event_series_normalize_ingested_metadata
before insert or update of title, format, event_type on public.event_series
for each row execute function public.normalize_ingested_event_series_metadata();

create or replace function public.normalize_ingested_series_title_from_schedule()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_title text;
  v_match text[];
  v_title_time time;
begin
  if new.series_id not like '%-ingest-%' then
    return new;
  end if;

  select es.title into v_title
  from public.event_series es
  where es.id = new.series_id;

  v_match := regexp_match(
    lower(coalesce(v_title, '')),
    '^\s*([0-9]{1,2})(:([0-9]{2}))?\s*(am|pm)([[:space:]]|$)'
  );
  if v_match is null then
    return new;
  end if;

  v_title_time := make_time(
    case
      when v_match[4] = 'am' then
        case when v_match[1]::integer = 12 then 0 else v_match[1]::integer end
      else
        case when v_match[1]::integer = 12 then 12 else v_match[1]::integer + 12 end
    end,
    coalesce(nullif(v_match[3], '')::integer, 0),
    0
  );

  if exists (
    select 1
    from public.event_occurrences eo
    where eo.series_id = new.series_id
      and eo.start_time is distinct from v_title_time
  ) then
    update public.event_series es
    set title = trim(regexp_replace(
      es.title,
      '^\s*[0-9]{1,2}(:[0-9]{2})?\s*(am|pm)\s*[|:-]?\s*',
      '',
      'i'
    ))
    where es.id = new.series_id;
  end if;
  return new;
end;
$$;

revoke all on function public.normalize_ingested_series_title_from_schedule()
from public, anon, authenticated;

drop trigger if exists event_occurrences_normalize_ingested_series_title
on public.event_occurrences;
create trigger event_occurrences_normalize_ingested_series_title
after insert or update of start_time on public.event_occurrences
for each row execute function public.normalize_ingested_series_title_from_schedule();

update public.event_series es
set format = 'Premodern'
where es.id like '%-ingest-%'
  and es.format = 'Magic'
  and es.title ~* '(^|[^a-z])premodern([^a-z]|$)';

with titled as (
  select
    es.id,
    es.title,
    regexp_match(
      lower(es.title),
      '^\s*([0-9]{1,2})(:([0-9]{2}))?\s*(am|pm)([[:space:]]|$)'
    ) as matched
  from public.event_series es
  where es.id like '%-ingest-%'
), expected as (
  select
    t.id,
    make_time(
      case
        when t.matched[4] = 'am' then
          case when t.matched[1]::integer = 12 then 0 else t.matched[1]::integer end
        else
          case when t.matched[1]::integer = 12 then 12 else t.matched[1]::integer + 12 end
      end,
      coalesce(nullif(t.matched[3], '')::integer, 0),
      0
    ) as title_time
  from titled t
  where t.matched is not null
), conflicting as (
  select distinct e.id
  from expected e
  join public.event_occurrences eo on eo.series_id = e.id
  where eo.start_time is distinct from e.title_time
)
update public.event_series es
set title = trim(regexp_replace(
  es.title,
  '^\s*[0-9]{1,2}(:[0-9]{2})?\s*(am|pm)\s*[|:-]?\s*',
  '',
  'i'
))
from conflicting c
where es.id = c.id;

comment on function public.normalize_ingested_event_series_metadata() is
  'Conservatively enriches deterministic ingest-created series from exact title semantics.';

comment on function public.normalize_ingested_series_title_from_schedule() is
  'Removes a misleading leading title time when structured occurrences prove the series spans another time.';
