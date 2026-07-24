alter table public.venues
  add column research_mode text not null default 'incomplete',
  add column next_research_due_at timestamp with time zone,
  add column research_mode_reason text;

alter table public.venues
  add constraint venues_research_mode_check
  check (
    research_mode in (
      'incomplete',
      'maintenance',
      'targeted_followup',
      'identity_unresolved'
    )
  );

comment on column public.venues.research_mode is
  'Selection-grade research disposition. Maintenance venues are excluded from ordinary batches until due or triggered by a new lead.';
comment on column public.venues.next_research_due_at is
  'Earliest ordinary maintenance date. New material leads or explicit user requests may still trigger an earlier targeted check.';
comment on column public.venues.research_mode_reason is
  'Concise reason for the current selection disposition; not a replacement for the full Places assessment.';

update public.venues v
set
  research_mode = 'maintenance',
  next_research_due_at =
    (coalesce(v.last_verified, current_date)::timestamp with time zone + interval '60 days'),
  research_mode_reason =
    'Decision-grade venue baseline and evaluation exist. Use maintenance/delta checks only; unresolved texture does not reopen the main pass.'
where v.research_status in ('reviewed', 'deepened')
  and exists (
    select 1
    from public.evaluations e
    where e.entity_type = 'venue'
      and e.entity_id = v.id
      and e.research_status in ('reviewed', 'deepened')
  );

update public.venues
set
  research_mode = 'identity_unresolved',
  next_research_due_at = null,
  research_mode_reason =
    'Branch or operating identity remains unresolved; select only for a bounded identity/status pass or a new source lead.'
where id in ('the-comic-bug', 'the-game-chest-irvine');

update public.venues
set
  research_mode = 'maintenance',
  next_research_due_at = '2026-09-22T00:00:00-07:00'::timestamp with time zone,
  research_mode_reason = case id
    when 'hobby-overflow' then
      'Baseline complete. Nearby Commander option; Discord/Instagram texture is a bounded caveat, not an open main pass.'
    when 'joyful-toad-tcg' then
      'Baseline complete. Commander option is decision-grade; social/community texture is a bounded caveat.'
    when 'collector-legion' then
      'Baseline complete. Official special-event catalog was checked without a clean actionable delta; maintenance complete for now.'
  end
where id in ('hobby-overflow', 'joyful-toad-tcg', 'collector-legion');

alter table public.entity_surface_coverage
  add column next_eligible_check_at timestamp with time zone,
  add column retry_condition text;

comment on column public.entity_surface_coverage.next_eligible_check_at is
  'Suppresses routine rechecking of the same entity/surface until this time. A materially changed access condition or explicit lead may override.';
comment on column public.entity_surface_coverage.retry_condition is
  'Concise condition that justifies checking the surface again before or at the eligibility date.';

create or replace function public.set_surface_retry_window()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.next_eligible_check_at is null then
    new.next_eligible_check_at := new.checked_at + case new.disposition
      when 'contradiction' then interval '1 day'
      when 'stale' then interval '7 days'
      when 'inspected_current' then interval '30 days'
      when 'inspected_thin' then interval '30 days'
      when 'route_found_content_not_inspected' then interval '30 days'
      when 'blocked_gated' then interval '30 days'
      when 'unsafe_tbd' then interval '60 days'
      when 'not_found' then interval '90 days'
      when 'not_material' then interval '90 days'
      else interval '30 days'
    end;
  end if;

  if new.retry_condition is null then
    new.retry_condition := case new.disposition
      when 'blocked_gated' then 'Retry only after access/gate conditions change or the suppression window expires.'
      when 'route_found_content_not_inspected' then 'Retry only with a newly usable inspection path or after the suppression window expires.'
      when 'inspected_thin' then 'Retry only after the suppression window or a new source lead.'
      when 'not_found' then 'Retry only after the suppression window or a source lead identifies the route.'
      when 'unsafe_tbd' then 'Retry only after the access method becomes demonstrably safe.'
      when 'stale' then 'Retry when a fresh version is expected or another source contradicts it.'
      when 'contradiction' then 'Retry soon enough to resolve the planning-relevant contradiction.'
      when 'not_material' then 'Retry only if the surface becomes planning-relevant.'
      else 'Retry after the suppression window or when a material delta is reported.'
    end;
  end if;

  return new;
end;
$$;

create trigger entity_surface_coverage_retry_window
before insert or update of disposition, checked_at, next_eligible_check_at, retry_condition
on public.entity_surface_coverage
for each row
execute function public.set_surface_retry_window();

update public.entity_surface_coverage
set next_eligible_check_at = null,
    retry_condition = null;

create or replace view public.entity_surface_selection_state
with (security_invoker = true)
as
select distinct on (c.entity_type, c.entity_id, c.surface_type)
  c.id,
  c.entity_type,
  c.entity_id,
  c.surface_type,
  c.disposition,
  c.checked_at,
  c.next_eligible_check_at,
  c.retry_condition,
  c.is_useful,
  c.materiality,
  (c.next_eligible_check_at <= now()) as routine_check_eligible
from public.entity_surface_coverage c
order by c.entity_type, c.entity_id, c.surface_type, c.checked_at desc, c.created_at desc;

create or replace view public.venue_research_selection
with (security_invoker = true)
as
select
  v.id,
  v.name,
  v.city,
  v.distance_miles,
  v.research_status,
  v.research_mode,
  v.next_research_due_at,
  v.research_mode_reason,
  v.last_verified,
  case
    when v.research_mode in ('incomplete', 'identity_unresolved') then true
    when v.next_research_due_at is not null and v.next_research_due_at <= now() then true
    when exists (
      select 1
      from public.coordination_items ci
      where ci.related_entity_type = 'venue'
        and ci.related_entity_id = v.id
        and ci.status in ('new', 'ready_for_review', 'assigned', 'in_progress')
    ) then true
    when exists (
      select 1
      from public.agent_requests ar
      where ar.entity_type = 'venue'
        and ar.entity_id = v.id
        and ar.request_status in ('queued', 'in_progress', 'waiting_for_user')
    ) then true
    else false
  end as ordinary_batch_eligible,
  case
    when v.research_mode = 'incomplete' then 'baseline incomplete'
    when v.research_mode = 'identity_unresolved' then 'bounded identity/status resolution'
    when v.next_research_due_at is not null and v.next_research_due_at <= now() then 'maintenance due'
    when exists (
      select 1
      from public.coordination_items ci
      where ci.related_entity_type = 'venue'
        and ci.related_entity_id = v.id
        and ci.status in ('new', 'ready_for_review', 'assigned', 'in_progress')
    ) then 'open coordination lead'
    when exists (
      select 1
      from public.agent_requests ar
      where ar.entity_type = 'venue'
        and ar.entity_id = v.id
        and ar.request_status in ('queued', 'in_progress', 'waiting_for_user')
    ) then 'open user/agent request'
    else 'not due'
  end as selection_reason
from public.venues v;

create or replace view public.venue_research_candidates
with (security_invoker = true)
as
select *
from public.venue_research_selection
where ordinary_batch_eligible;

revoke all on table public.entity_surface_selection_state from public, anon, authenticated;
revoke all on table public.venue_research_selection from public, anon, authenticated;
revoke all on table public.venue_research_candidates from public, anon, authenticated;
grant select on table public.entity_surface_selection_state to service_role;
grant select on table public.venue_research_selection to service_role;
grant select on table public.venue_research_candidates to service_role;

comment on view public.venue_research_candidates is
  'Canonical ordinary batch-selection queue. Completed, not-due maintenance venues are intentionally absent.';
