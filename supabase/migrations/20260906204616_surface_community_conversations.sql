-- Signed-in, minimal monitoring projection. Deliberately excludes internal notes,
-- cursors, retry state, and any personal records from the underlying table.
create or replace view public.community_monitoring_status as
select distinct on (c.source_id) c.source_id, c.checked_at, c.disposition
from public.entity_surface_coverage c
join public.sources s on s.id = c.source_id
where c.surface_type in ('discord', 'instagram', 'facebook', 'meetup')
order by c.source_id, c.checked_at desc;
revoke all on public.community_monitoring_status from public, anon;
grant select on public.community_monitoring_status to authenticated;

create or replace function public.surface_community_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  route public.discord_channel_watchlist%rowtype;
  topic text;
begin
  if new.id not like 'surface-material:discord-daily-survey:%'
     or new.review_status <> 'accepted' then return new; end if;
  -- Surface specific social/planning evidence, not every event-word match.
  topic := case
    when new.summary ~* 'hop in|spectate|new.*mtg|new.*magic' then 'A newcomer asks about joining'
    when new.summary ~* 'need 1|need one|looking for.*pod|anyone down|anyone.*commander games' then 'Players looking for a game'
    when new.summary ~* 'draft something else|anyone.*draft|people.*up for' then 'Players discussing a draft'
    when new.summary ~* 'had fun|nice meeting|thanks for coming|played with' then 'After the meetup'
    when new.summary ~* 'open play.*bracket 2/3|bracket 2/3.*open play' then 'An open-play invitation'
    else null end;
  if topic is null then return new; end if;
  select * into route from public.discord_channel_watchlist w
  where new.id like 'surface-material:discord-daily-survey:' || w.id || ':%'
  order by length(w.id) desc limit 1;
  if route.id is null then return new; end if;
  insert into public.signals(id, category, priority, status, source_id,
    captured_at, observed_at, expires_at, related_entity_type, related_entity_id,
    summary, details, evidence_url, confidence, suggested_action, promotion_target)
  values ('conversation:' || new.id, 'community_activity', 'normal', 'new',
    coalesce(route.channel_source_id, route.profile_source_id), new.detected_at,
    new.detected_at, new.detected_at + interval '7 days', new.entity_type, new.entity_id,
    topic, new.summary, route.channel_url, 'medium',
    'Read the conversation and replies for current plans. The saved excerpt is not a confirmed event.', 'community_note')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.surface_community_conversation() from public, anon, authenticated;
create trigger surface_community_conversation
after insert or update of summary on public.research_changes
for each row execute function public.surface_community_conversation();

-- Replay only the recent retained findings; no surveys or event promotions.
update public.research_changes set summary = summary
where id like 'surface-material:discord-daily-survey:%'
  and review_status = 'accepted' and detected_at >= now() - interval '7 days';
