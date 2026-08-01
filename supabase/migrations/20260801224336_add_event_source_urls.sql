alter table public.event_sources
  add column if not exists source_url text;

create or replace function public.sync_event_source_url_from_binding()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  update public.event_sources es
  set source_url = o.source_url
  from public.event_observations o
  where o.id = new.observation_id
    and o.source_url is not null
    and es.source_id = o.source_id
    and (
      (new.occurrence_id is not null and es.occurrence_id = new.occurrence_id)
      or
      (new.occurrence_id is null and new.series_id is not null and es.series_id = new.series_id)
    );
  return new;
end;
$$;

revoke all on function public.sync_event_source_url_from_binding()
from public, anon, authenticated;

drop trigger if exists event_source_bindings_sync_source_url
on public.event_source_bindings;
create trigger event_source_bindings_sync_source_url
after insert or update of observation_id, series_id, occurrence_id
on public.event_source_bindings
for each row execute function public.sync_event_source_url_from_binding();

update public.event_sources es
set source_url = (
  select o.source_url
  from public.event_source_bindings b
  join public.event_observations o on o.id = b.observation_id
  where o.source_id = es.source_id
    and o.source_url is not null
    and (
      (es.occurrence_id is not null and b.occurrence_id = es.occurrence_id)
      or
      (es.occurrence_id is null and es.series_id is not null and b.series_id = es.series_id)
    )
  order by o.last_seen_at desc
  limit 1
)
where es.source_url is null
  and exists (
    select 1
    from public.event_source_bindings b
    join public.event_observations o on o.id = b.observation_id
    where o.source_id = es.source_id
      and o.source_url is not null
      and (
        (es.occurrence_id is not null and b.occurrence_id = es.occurrence_id)
        or
        (es.occurrence_id is null and es.series_id is not null and b.series_id = es.series_id)
      )
  );

comment on column public.event_sources.source_url is
  'Optional event-specific source URL; falls back to the parent source URL when absent.';

comment on function public.sync_event_source_url_from_binding() is
  'Carries an exact normalized observation URL onto its canonical event-source relationship.';
