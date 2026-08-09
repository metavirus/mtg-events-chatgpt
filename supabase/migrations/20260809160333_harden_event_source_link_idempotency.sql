create or replace function public.skip_duplicate_event_source_link()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.occurrence_id is not null then
    if exists (
      select 1
      from public.event_sources existing
      where existing.source_id = new.source_id
        and existing.occurrence_id = new.occurrence_id
    ) then
      return null;
    end if;
  elsif new.series_id is not null then
    if exists (
      select 1
      from public.event_sources existing
      where existing.source_id = new.source_id
        and existing.series_id = new.series_id
    ) then
      return null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists skip_duplicate_event_source_link_before_insert
  on public.event_sources;

create trigger skip_duplicate_event_source_link_before_insert
before insert on public.event_sources
for each row
execute function public.skip_duplicate_event_source_link();

revoke all on function public.skip_duplicate_event_source_link()
  from public, anon, authenticated;

comment on function public.skip_duplicate_event_source_link() is
  'Makes event source linking idempotent at the table boundary: duplicate source/occurrence or source/series links are skipped instead of aborting set-based promoter runs.';
