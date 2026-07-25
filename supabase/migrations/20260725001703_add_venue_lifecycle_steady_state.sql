drop view if exists public.venue_research_candidates;
drop view if exists public.venue_research_selection;
drop view if exists public.entity_surface_selection_state;

alter table public.venues
  drop constraint if exists venues_research_mode_check;

alter table public.venues
  rename column research_mode to lifecycle_state;

alter table public.venues
  rename column research_mode_reason to lifecycle_reason;

alter table public.venues
  add column baseline_pass_count smallint not null default 0,
  add column baseline_completed_at timestamp with time zone,
  add column targeted_closure_completed_at timestamp with time zone,
  add column exception_pass_count smallint not null default 0,
  add column lifecycle_exception_item_id uuid
    references public.coordination_items(id),
  add column planning_summary text;

alter table public.venues
  add constraint venues_baseline_pass_count_check
  check (baseline_pass_count between 0 and 2),
  add constraint venues_exception_pass_count_check
  check (exception_pass_count >= 0);

comment on column public.venues.lifecycle_state is
  'Finite venue research lifecycle. Steady-state venues are monitored by exact surface and never return to ordinary holistic research.';
comment on column public.venues.lifecycle_reason is
  'Concise operational reason for the current lifecycle state.';
comment on column public.venues.baseline_pass_count is
  'Completed holistic baseline/closure passes. Ordinary work may never raise this above two.';
comment on column public.venues.lifecycle_exception_item_id is
  'Coordination item authorizing a material identity/status or explicit-user exception to the normal two-pass limit.';
comment on column public.venues.planning_summary is
  'Short user-facing practical verdict. Operational source limitations remain in structured coverage, sources, and evaluation cautions.';

update public.venues
set lifecycle_state = case lifecycle_state
      when 'maintenance' then 'steady_state'
      when 'identity_unresolved' then 'identity_blocked'
      when 'targeted_followup' then 'targeted_closure'
      else 'unreviewed'
    end,
    baseline_pass_count = case
      when lifecycle_state = 'maintenance' then 1
      else 0
    end,
    baseline_completed_at = case
      when lifecycle_state = 'maintenance'
        then coalesce(last_verified::timestamp with time zone, updated_at, created_at)
      else null
    end;

update public.venues
set lifecycle_state = 'steady_state',
    lifecycle_reason = case id
      when 'projectccg-alhambra' then
        'Decision-grade identity, WPN event baseline, and Places assessment exist. Remaining branch-specific community texture is non-blocking.'
      when 'kingslayer-games-lake-forest' then
        'The Lake Forest branch is real and decision-grade. Branch-specific event wording remains a finite source retry, not an open store pass.'
    end,
    baseline_pass_count = 1,
    baseline_completed_at = coalesce(last_verified::timestamp with time zone, updated_at, created_at)
where id in ('projectccg-alhambra', 'kingslayer-games-lake-forest');

update public.venues
set lifecycle_state = 'identity_blocked',
    lifecycle_reason =
      'Identity or branch attribution is not safe enough for ordinary planning. Select only after a concrete identity lead, due identity retry, or explicit user request.',
    baseline_pass_count = 0,
    baseline_completed_at = null
where id in ('the-comic-bug', 'the-game-chest-irvine');

update public.venues
set lifecycle_state = 'unreviewed',
    lifecycle_reason =
      'No decision-grade baseline exists yet. Eligible for one bounded baseline pass.',
    baseline_pass_count = 0,
    baseline_completed_at = null
where id in (
  'alamo-drafthouse-cinema-downtown-los-angeles',
  'revenge-of'
);

alter table public.venues
  add constraint venues_lifecycle_state_check
  check (
    lifecycle_state in (
      'unreviewed',
      'baseline_in_progress',
      'targeted_closure',
      'steady_state',
      'identity_blocked',
      'retired'
    )
  );

alter table public.venues
  drop column next_research_due_at;

create or replace function public.venue_lifecycle_exception_is_valid(
  p_venue_id text,
  p_item_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.coordination_items ci
    where ci.id = p_item_id
      and ci.related_entity_type = 'venue'
      and ci.related_entity_id = p_venue_id
      and ci.status in (
        'new',
        'acknowledged',
        'in_progress',
        'needs_clarification',
        'ready_for_review'
      )
      and ci.details ->> 'lifecycle_exception_reason' in (
        'material_identity_status_change',
        'explicit_user_request'
      )
  );
$$;

create or replace function public.enforce_venue_lifecycle_transition()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_exception_valid boolean;
begin
  if new.baseline_pass_count > 2 then
    raise exception 'baseline_pass_count may not exceed two';
  end if;

  if new.lifecycle_state = old.lifecycle_state then
    if new.baseline_pass_count is distinct from old.baseline_pass_count
       or new.exception_pass_count is distinct from old.exception_pass_count
       or new.baseline_completed_at is distinct from old.baseline_completed_at
       or new.targeted_closure_completed_at is distinct from old.targeted_closure_completed_at then
      raise exception 'lifecycle counters may change only during a lifecycle transition';
    end if;
    return new;
  end if;

  v_exception_valid := public.venue_lifecycle_exception_is_valid(
    old.id,
    new.lifecycle_exception_item_id
  );

  if old.lifecycle_state = 'unreviewed'
     and new.lifecycle_state = 'baseline_in_progress'
     and old.baseline_pass_count = 0 then
    return new;
  end if;

  if old.lifecycle_state = 'baseline_in_progress'
     and new.lifecycle_state = 'steady_state'
     and old.baseline_pass_count = 0 then
    new.baseline_pass_count := 1;
    new.baseline_completed_at := coalesce(new.baseline_completed_at, timezone('utc', now()));
    return new;
  end if;

  if old.lifecycle_state = 'baseline_in_progress'
     and new.lifecycle_state = 'identity_blocked' then
    return new;
  end if;

  if old.lifecycle_state = 'identity_blocked'
     and new.lifecycle_state = 'baseline_in_progress'
     and v_exception_valid then
    return new;
  end if;

  if old.lifecycle_state = 'identity_blocked'
     and new.lifecycle_state = 'steady_state'
     and v_exception_valid then
    new.baseline_pass_count := greatest(old.baseline_pass_count, 1);
    new.baseline_completed_at := coalesce(new.baseline_completed_at, timezone('utc', now()));
    return new;
  end if;

  if old.lifecycle_state = 'steady_state'
     and new.lifecycle_state = 'targeted_closure'
     and old.baseline_pass_count = 1
     and old.targeted_closure_completed_at is null
     and v_exception_valid then
    return new;
  end if;

  if old.lifecycle_state = 'targeted_closure'
     and new.lifecycle_state = 'steady_state'
     and old.baseline_pass_count = 1 then
    new.baseline_pass_count := 2;
    new.targeted_closure_completed_at :=
      coalesce(new.targeted_closure_completed_at, timezone('utc', now()));
    return new;
  end if;

  if old.lifecycle_state = 'steady_state'
     and new.lifecycle_state = 'targeted_closure'
     and old.baseline_pass_count = 2
     and v_exception_valid then
    return new;
  end if;

  if old.lifecycle_state = 'targeted_closure'
     and new.lifecycle_state = 'steady_state'
     and old.baseline_pass_count = 2
     and v_exception_valid then
    new.baseline_pass_count := 2;
    new.exception_pass_count := old.exception_pass_count + 1;
    return new;
  end if;

  if old.lifecycle_state = 'steady_state'
     and new.lifecycle_state = 'identity_blocked'
     and v_exception_valid then
    return new;
  end if;

  if new.lifecycle_state = 'retired' then
    return new;
  end if;

  if old.lifecycle_state = 'retired'
     and new.lifecycle_state = 'unreviewed'
     and v_exception_valid then
    new.baseline_pass_count := 0;
    new.baseline_completed_at := null;
    new.targeted_closure_completed_at := null;
    return new;
  end if;

  raise exception
    'unsupported venue lifecycle transition: % -> %',
    old.lifecycle_state,
    new.lifecycle_state;
end;
$$;

create trigger venues_enforce_lifecycle_transition
before update of lifecycle_state, baseline_pass_count, baseline_completed_at,
  targeted_closure_completed_at, exception_pass_count
on public.venues
for each row
execute function public.enforce_venue_lifecycle_transition();

alter table public.entity_surface_coverage
  add column attempt_number smallint not null default 1,
  add column max_automatic_retries smallint not null default 1,
  add column terminal_outcome text,
  add column reopen_trigger text,
  add column monitoring_mode text not null default 'none',
  add column cursor_value text,
  add column content_fingerprint text;

alter table public.entity_surface_coverage
  add constraint entity_surface_attempt_number_check
    check (attempt_number >= 1),
  add constraint entity_surface_max_retries_check
    check (max_automatic_retries between 0 and 3),
  add constraint entity_surface_terminal_outcome_check
    check (
      terminal_outcome is null
      or terminal_outcome in (
        'unavailable',
        'not_publicly_readable',
        'access_gated',
        'no_useful_content'
      )
    ),
  add constraint entity_surface_reopen_trigger_check
    check (
      reopen_trigger is null
      or reopen_trigger in ('new_lead', 'access_changed', 'user_request')
    ),
  add constraint entity_surface_monitoring_mode_check
    check (
      monitoring_mode in (
        'none',
        'daily',
        'weekly',
        'manual_only',
        'finite_retry',
        'discovery_triggered'
      )
    );

comment on column public.entity_surface_coverage.attempt_number is
  'Attempt number for this entity/surface sequence. The initial attempt is one.';
comment on column public.entity_surface_coverage.max_automatic_retries is
  'Maximum automatic retries after the initial attempt; normally one.';
comment on column public.entity_surface_coverage.terminal_outcome is
  'Terminal finite-retry result. Reopening requires a new lead, access change, or explicit user request.';
comment on column public.entity_surface_coverage.monitoring_mode is
  'Exact surface cadence. Only safe repeatable daily/weekly surfaces enter monitoring selection.';
comment on column public.entity_surface_coverage.cursor_value is
  'Opaque surface-specific resume cursor; never a venue-level research marker.';
comment on column public.entity_surface_coverage.content_fingerprint is
  'Last safely derived surface fingerprint used for delta comparison.';

drop trigger if exists entity_surface_coverage_retry_window
  on public.entity_surface_coverage;
drop function if exists public.set_surface_retry_window();

drop function if exists public.record_entity_surface_check(
  text, text, text, text, text, timestamp with time zone, text, text,
  boolean, text, uuid, boolean
);

create function public.record_entity_surface_check(
  p_idempotency_key text,
  p_entity_type text,
  p_entity_id text,
  p_surface_type text,
  p_disposition text,
  p_checked_at timestamp with time zone,
  p_summary text,
  p_source_id text default null,
  p_is_useful boolean default false,
  p_materiality text default 'medium',
  p_followup_item_id uuid default null,
  p_monitoring_mode text default 'none',
  p_cursor_value text default null,
  p_content_fingerprint text default null,
  p_max_automatic_retries smallint default 1,
  p_reopen_trigger text default null,
  p_material_change boolean default false,
  p_dry_run boolean default false
)
returns table (
  coverage_id uuid,
  outcome text,
  wrote boolean,
  research_change_id text
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existing public.entity_surface_coverage%rowtype;
  v_previous public.entity_surface_coverage%rowtype;
  v_coverage_id uuid;
  v_attempt smallint := 1;
  v_terminal text;
  v_next_check timestamp with time zone;
  v_change_id text;
begin
  if p_idempotency_key is null
     or length(btrim(p_idempotency_key)) not between 1 and 240 then
    raise exception 'invalid idempotency_key';
  end if;
  if p_entity_type not in ('venue', 'community') then
    raise exception 'unsupported entity_type: %', p_entity_type;
  end if;
  if p_surface_type not in (
    'official_site', 'wpn_eventlink', 'event_calendar', 'instagram',
    'facebook', 'discord', 'review', 'other'
  ) then
    raise exception 'unsupported surface_type: %', p_surface_type;
  end if;
  if p_disposition not in (
    'inspected_current', 'inspected_thin',
    'route_found_content_not_inspected', 'blocked_gated', 'unsafe_tbd',
    'not_found', 'stale', 'contradiction', 'not_material'
  ) then
    raise exception 'unsupported disposition: %', p_disposition;
  end if;
  if p_materiality not in ('low', 'medium', 'high') then
    raise exception 'unsupported materiality: %', p_materiality;
  end if;
  if p_monitoring_mode not in (
    'none', 'daily', 'weekly', 'manual_only', 'finite_retry',
    'discovery_triggered'
  ) then
    raise exception 'unsupported monitoring_mode: %', p_monitoring_mode;
  end if;
  if p_reopen_trigger is not null
     and p_reopen_trigger not in ('new_lead', 'access_changed', 'user_request') then
    raise exception 'unsupported reopen_trigger: %', p_reopen_trigger;
  end if;
  if p_max_automatic_retries not between 0 and 3 then
    raise exception 'max_automatic_retries must be between zero and three';
  end if;
  if p_checked_at is null then
    raise exception 'checked_at is required';
  end if;
  if p_summary is null or length(btrim(p_summary)) not between 1 and 2000 then
    raise exception 'summary must contain 1 to 2000 trimmed characters';
  end if;
  if p_entity_type = 'venue'
     and not exists (select 1 from public.venues where id = p_entity_id) then
    raise exception 'unknown venue: %', p_entity_id;
  end if;
  if p_entity_type = 'community'
     and not exists (select 1 from public.communities where id = p_entity_id) then
    raise exception 'unknown community: %', p_entity_id;
  end if;
  if p_source_id is not null
     and not exists (select 1 from public.sources where id = p_source_id) then
    raise exception 'unknown source: %', p_source_id;
  end if;

  select *
  into v_existing
  from public.entity_surface_coverage
  where idempotency_key = p_idempotency_key;

  if found then
    return query
      select v_existing.id, 'replayed'::text, false, null::text;
    return;
  end if;

  select *
  into v_previous
  from public.entity_surface_coverage
  where entity_type = p_entity_type
    and entity_id = p_entity_id
    and surface_type = p_surface_type
  order by checked_at desc, created_at desc
  limit 1;

  if found then
    if v_previous.terminal_outcome is not null and p_reopen_trigger is null then
      raise exception
        'surface retry is terminal; reopening requires new_lead, access_changed, or user_request';
    end if;
    if p_reopen_trigger is not null then
      v_attempt := 1;
    else
      v_attempt := v_previous.attempt_number + 1;
    end if;
  end if;

  if p_disposition in (
    'inspected_thin', 'route_found_content_not_inspected', 'blocked_gated',
    'unsafe_tbd', 'not_found', 'not_material'
  ) and v_attempt > p_max_automatic_retries then
    v_terminal := case p_disposition
      when 'not_found' then 'unavailable'
      when 'blocked_gated' then 'access_gated'
      when 'unsafe_tbd' then 'not_publicly_readable'
      when 'route_found_content_not_inspected' then 'not_publicly_readable'
      else 'no_useful_content'
    end;
  end if;

  if v_terminal is null then
    v_next_check := case
      when p_monitoring_mode = 'daily' then p_checked_at + interval '1 day'
      when p_monitoring_mode = 'weekly' then p_checked_at + interval '7 days'
      when p_disposition = 'contradiction' then p_checked_at + interval '1 day'
      when p_disposition = 'stale' then p_checked_at + interval '7 days'
      when p_disposition in (
        'inspected_thin', 'route_found_content_not_inspected',
        'blocked_gated', 'unsafe_tbd', 'not_found', 'not_material'
      ) then p_checked_at + interval '30 days'
      else null
    end;
  end if;

  if p_material_change
     and not (
       p_is_useful
       and p_materiality = 'high'
       and p_disposition in ('inspected_current', 'contradiction', 'stale')
     ) then
    raise exception
      'material surface change requires useful=true, high materiality, and a current/contradiction/stale disposition';
  end if;

  if p_dry_run then
    return query select null::uuid, 'validated'::text, false, null::text;
    return;
  end if;

  insert into public.entity_surface_coverage (
    entity_type, entity_id, surface_type, source_id, disposition, checked_at,
    is_useful, materiality, summary, followup_item_id, idempotency_key,
    next_eligible_check_at, retry_condition, attempt_number,
    max_automatic_retries, terminal_outcome, reopen_trigger, monitoring_mode,
    cursor_value, content_fingerprint
  )
  values (
    p_entity_type, p_entity_id, p_surface_type, p_source_id, p_disposition,
    p_checked_at, p_is_useful, p_materiality, btrim(p_summary),
    p_followup_item_id, p_idempotency_key, v_next_check,
    case
      when v_terminal is not null then
        'Terminal until a new lead, actual access change, or explicit user request.'
      when p_disposition = 'contradiction' then
        'Retry only to resolve the planning-relevant contradiction.'
      when p_disposition = 'stale' then
        'Retry when a fresh version is plausibly available.'
      when v_next_check is not null then
        'One bounded automatic retry remains unless a material condition changes first.'
      else null
    end,
    v_attempt, p_max_automatic_retries, v_terminal, p_reopen_trigger,
    p_monitoring_mode, p_cursor_value, p_content_fingerprint
  )
  returning id into v_coverage_id;

  if p_material_change then
    v_change_id := 'surface-material:' || p_idempotency_key;
    insert into public.research_changes (
      id, detected_at, change_type, entity_type, entity_id, summary,
      review_status
    )
    values (
      v_change_id, p_checked_at,
      case
        when p_disposition in ('contradiction', 'stale')
          then 'source_health_change'
        else 'source_discovery'
      end,
      p_entity_type, p_entity_id, btrim(p_summary), 'accepted'
    );
  end if;

  return query
    select v_coverage_id, 'inserted'::text, true, v_change_id;
end;
$$;

revoke all on function public.record_entity_surface_check(
  text, text, text, text, text, timestamp with time zone, text, text,
  boolean, text, uuid, text, text, text, smallint, text, boolean, boolean
) from public, anon, authenticated;

grant execute on function public.record_entity_surface_check(
  text, text, text, text, text, timestamp with time zone, text, text,
  boolean, text, uuid, text, text, text, smallint, text, boolean, boolean
) to service_role;

comment on function public.record_entity_surface_check(
  text, text, text, text, text, timestamp with time zone, text, text,
  boolean, text, uuid, text, text, text, smallint, text, boolean, boolean
) is
  'Typed finite surface-check path. Operational outcomes stay out of Updates unless explicitly marked as a material useful change.';

update public.entity_surface_coverage
set attempt_number = 1,
    max_automatic_retries = 1,
    terminal_outcome = null,
    reopen_trigger = null,
    monitoring_mode = case
      when disposition = 'inspected_current'
       and is_useful
       and source_id is not null then 'weekly'
      when disposition in (
        'inspected_thin', 'route_found_content_not_inspected',
        'blocked_gated', 'unsafe_tbd', 'not_found', 'not_material'
      ) then 'finite_retry'
      else 'none'
    end;

create view public.entity_surface_selection_state
with (security_invoker = true)
as
select distinct on (c.entity_type, c.entity_id, c.surface_type)
  c.id,
  c.entity_type,
  c.entity_id,
  c.surface_type,
  c.source_id,
  c.disposition,
  c.checked_at,
  c.next_eligible_check_at,
  c.retry_condition,
  c.attempt_number,
  c.max_automatic_retries,
  c.terminal_outcome,
  c.reopen_trigger,
  c.monitoring_mode,
  c.cursor_value,
  c.content_fingerprint,
  c.is_useful,
  c.materiality,
  c.followup_item_id
from public.entity_surface_coverage c
order by c.entity_type, c.entity_id, c.surface_type,
  c.checked_at desc, c.created_at desc;

create view public.venue_baseline_candidates
with (security_invoker = true)
as
select
  v.id, v.name, v.city, v.distance_miles, v.research_status,
  v.lifecycle_state, v.lifecycle_reason, v.baseline_pass_count,
  v.last_verified,
  case v.lifecycle_state
    when 'unreviewed' then 'one bounded baseline pass'
    when 'baseline_in_progress' then 'finish the active baseline pass'
    when 'targeted_closure' then 'finish the one bounded targeted closure'
  end as selection_reason
from public.venues v
where v.lifecycle_state in (
    'unreviewed', 'baseline_in_progress', 'targeted_closure'
  )
  and (
    v.lifecycle_state <> 'targeted_closure'
    or v.baseline_pass_count < 2
    or public.venue_lifecycle_exception_is_valid(
      v.id, v.lifecycle_exception_item_id
    )
  );

create view public.venue_surface_retry_candidates
with (security_invoker = true)
as
select
  v.id as venue_id,
  v.name as venue_name,
  s.id as coverage_id,
  s.surface_type,
  s.source_id,
  s.disposition,
  s.checked_at,
  s.attempt_number,
  s.max_automatic_retries,
  s.next_eligible_check_at,
  s.retry_condition,
  s.followup_item_id
from public.venues v
join public.entity_surface_selection_state s
  on s.entity_type = 'venue' and s.entity_id = v.id
where s.monitoring_mode = 'finite_retry'
  and s.terminal_outcome is null
  and s.next_eligible_check_at is not null
  and s.next_eligible_check_at <= now();

create view public.venue_surface_monitoring_candidates
with (security_invoker = true)
as
select
  v.id as venue_id,
  v.name as venue_name,
  s.id as coverage_id,
  s.surface_type,
  s.source_id,
  src.url as surface_url,
  s.monitoring_mode,
  s.checked_at as last_checked_at,
  s.next_eligible_check_at,
  s.cursor_value,
  s.content_fingerprint,
  s.disposition as latest_disposition
from public.venues v
join public.entity_surface_selection_state s
  on s.entity_type = 'venue' and s.entity_id = v.id
join public.sources src on src.id = s.source_id
where v.lifecycle_state = 'steady_state'
  and s.monitoring_mode in ('daily', 'weekly')
  and s.terminal_outcome is null
  and s.source_id is not null
  and (
    s.next_eligible_check_at is null
    or s.next_eligible_check_at <= now()
  );

create view public.venue_discovery_candidates
with (security_invoker = true)
as
select
  v.id, v.name, v.city, v.distance_miles, v.lifecycle_state,
  v.lifecycle_reason, v.baseline_pass_count
from public.venues v
where v.lifecycle_state = 'unreviewed'
  and v.baseline_pass_count = 0;

create view public.venue_identity_resolution_candidates
with (security_invoker = true)
as
select
  v.id, v.name, v.city, v.distance_miles, v.lifecycle_state,
  v.lifecycle_reason, v.lifecycle_exception_item_id
from public.venues v
where v.lifecycle_state = 'identity_blocked'
  and (
    public.venue_lifecycle_exception_is_valid(
      v.id, v.lifecycle_exception_item_id
    )
    or exists (
      select 1
      from public.entity_surface_selection_state s
      where s.entity_type = 'venue'
        and s.entity_id = v.id
        and s.monitoring_mode = 'finite_retry'
        and s.terminal_outcome is null
        and s.next_eligible_check_at <= now()
        and s.surface_type in ('official_site', 'wpn_eventlink', 'other')
    )
  );

create view public.product_research_changes
with (security_invoker = true)
as
select *
from public.research_changes
where change_type <> 'surface_check';

revoke all on table public.entity_surface_selection_state
  from public, anon, authenticated;
revoke all on table public.venue_baseline_candidates
  from public, anon, authenticated;
revoke all on table public.venue_surface_retry_candidates
  from public, anon, authenticated;
revoke all on table public.venue_surface_monitoring_candidates
  from public, anon, authenticated;
revoke all on table public.venue_discovery_candidates
  from public, anon, authenticated;
revoke all on table public.venue_identity_resolution_candidates
  from public, anon, authenticated;

grant select on table public.entity_surface_selection_state to service_role;
grant select on table public.venue_baseline_candidates to service_role;
grant select on table public.venue_surface_retry_candidates to service_role;
grant select on table public.venue_surface_monitoring_candidates to service_role;
grant select on table public.venue_discovery_candidates to service_role;
grant select on table public.venue_identity_resolution_candidates to service_role;

revoke all on table public.product_research_changes from public;
grant select on table public.product_research_changes to anon, authenticated,
  service_role;

drop function if exists public.refresh_venue_planning_assessment(
  text, text, text, text, text, text, numeric, text, text[], text[], text[],
  text, text, timestamp with time zone, text, boolean
);

create function public.refresh_venue_planning_assessment(
  p_idempotency_key text,
  p_venue_id text,
  p_summary text,
  p_research_status text default null,
  p_candidate_status text default null,
  p_fit_grade text default null,
  p_fit_score numeric default null,
  p_confidence text default null,
  p_positives text[] default null,
  p_cautions text[] default null,
  p_open_questions text[] default null,
  p_assessment_notes text default null,
  p_dry_run boolean default false
)
returns table (
  evaluation_id uuid,
  venue_id text,
  outcome text,
  wrote boolean,
  research_change_id text
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_change_id text;
  v_evaluation_id uuid;
  v_research_status text;
  v_candidate_status text;
  v_confidence text;
begin
  if p_idempotency_key is null
     or length(btrim(p_idempotency_key)) not between 1 and 180 then
    raise exception 'invalid idempotency_key';
  end if;
  if not exists (select 1 from public.venues where id = p_venue_id) then
    raise exception 'unknown venue: %', p_venue_id;
  end if;
  if p_summary is null or length(btrim(p_summary)) not between 1 and 2000 then
    raise exception 'summary must contain 1 to 2000 trimmed characters';
  end if;
  if p_research_status is not null
     and p_research_status not in ('discovery', 'reviewed', 'deepened') then
    raise exception 'unsupported research_status: %', p_research_status;
  end if;
  if p_candidate_status is not null
     and p_candidate_status not in ('promoted', 'neutral', 'deprioritized') then
    raise exception 'unsupported candidate_status: %', p_candidate_status;
  end if;
  if p_fit_grade is not null and p_fit_grade !~ '^[A-F][+-]?$' then
    raise exception 'unsupported fit_grade: %', p_fit_grade;
  end if;
  if p_fit_score is not null and (p_fit_score < 1 or p_fit_score > 5) then
    raise exception 'fit_score must be between one and five';
  end if;
  if p_confidence is not null
     and p_confidence not in ('low', 'medium', 'high') then
    raise exception 'unsupported confidence: %', p_confidence;
  end if;

  v_change_id := 'routine-assessment:' || p_idempotency_key;
  if exists (select 1 from public.research_changes where id = v_change_id) then
    select id into v_evaluation_id
    from public.evaluations
    where entity_type = 'venue' and entity_id = p_venue_id
    order by updated_at desc limit 1;
    return query
      select v_evaluation_id, p_venue_id, 'replayed'::text, false,
        v_change_id;
    return;
  end if;

  select id into v_evaluation_id
  from public.evaluations
  where entity_type = 'venue' and entity_id = p_venue_id
  order by updated_at desc limit 1;

  select
    coalesce(p_research_status, e.research_status, v.research_status, 'discovery'),
    coalesce(p_candidate_status, e.candidate_status, 'neutral'),
    coalesce(p_confidence, e.confidence, 'low')
  into v_research_status, v_candidate_status, v_confidence
  from public.venues v
  left join public.evaluations e on e.id = v_evaluation_id
  where v.id = p_venue_id;

  if p_dry_run then
    return query
      select v_evaluation_id, p_venue_id, 'validated'::text, false, null::text;
    return;
  end if;

  if v_evaluation_id is null then
    insert into public.evaluations (
      entity_type, entity_id, research_status, candidate_status, fit_grade,
      fit_score, confidence, positives, cautions, open_questions
    )
    values (
      'venue', p_venue_id, v_research_status, v_candidate_status,
      p_fit_grade, p_fit_score, v_confidence,
      coalesce(p_positives, '{}'::text[]),
      coalesce(p_cautions, '{}'::text[]),
      coalesce(p_open_questions, '{}'::text[])
    )
    returning id into v_evaluation_id;
  else
    update public.evaluations
    set research_status = v_research_status,
        candidate_status = v_candidate_status,
        fit_grade = coalesce(p_fit_grade, fit_grade),
        fit_score = coalesce(p_fit_score, fit_score),
        confidence = v_confidence,
        positives = coalesce(p_positives, positives),
        cautions = coalesce(p_cautions, cautions),
        open_questions = coalesce(p_open_questions, open_questions),
        updated_at = timezone('utc', now())
    where id = v_evaluation_id;
  end if;

  update public.venues
  set research_status = coalesce(p_research_status, research_status),
      assessment_notes = coalesce(
        nullif(btrim(coalesce(p_assessment_notes, '')), ''),
        assessment_notes
      ),
      last_verified = current_date,
      updated_at = timezone('utc', now())
  where id = p_venue_id;

  insert into public.research_changes (
    id, detected_at, change_type, entity_type, entity_id, summary,
    review_status
  )
  values (
    v_change_id, timezone('utc', now()), 'evaluation_update', 'venue',
    p_venue_id, btrim(p_summary), 'accepted'
  );

  return query
    select v_evaluation_id, p_venue_id, 'updated'::text, true, v_change_id;
end;
$$;

revoke all on function public.refresh_venue_planning_assessment(
  text, text, text, text, text, text, numeric, text, text[], text[], text[],
  text, boolean
) from public, anon, authenticated;

grant execute on function public.refresh_venue_planning_assessment(
  text, text, text, text, text, text, numeric, text, text[], text[], text[],
  text, boolean
) to service_role;

comment on function public.refresh_venue_planning_assessment(
  text, text, text, text, text, text, numeric, text, text[], text[], text[],
  text, boolean
) is
  'Routine planning assessment refresh. It cannot alter venue lifecycle state or reopen holistic research.';

with latest_evaluation as (
  select distinct on (entity_id)
    entity_id, candidate_status, fit_grade, confidence
  from public.evaluations
  where entity_type = 'venue'
  order by entity_id, updated_at desc
)
update public.venues v
set planning_summary = case
  when v.lifecycle_state = 'identity_blocked' then
    'Identity unresolved; do not rely on this venue''s events without checking the attached source.'
  when v.lifecycle_state in ('unreviewed', 'baseline_in_progress') then
    'Unreviewed lead; treat current listings as check-first until one bounded baseline pass is complete.'
  when v.lifecycle_state = 'retired' then
    'Retired or inactive record; preserved for history rather than current planning.'
  when le.candidate_status = 'deprioritized'
       and v.assessment_notes ~* 'no prox(y|ies)' then
    'Active Magic venue, but its no-proxy posture makes it a poor default fit.'
  when le.candidate_status = 'deprioritized'
       and v.assessment_notes ~* '(cEDH|high[- ]power|competitive)' then
    'Active Magic venue, but its competitive or higher-power emphasis makes it a poor default fit.'
  when le.candidate_status = 'deprioritized' then
    'Real but lower-priority for personal planning; use its source-supported events as check-first options.'
  when le.fit_grade ~ '^A' or le.candidate_status = 'promoted' then
    'Strong planning candidate with source-supported Magic activity and good repeat-visit potential.'
  when le.fit_grade ~ '^B' and coalesce(v.distance_miles, 99) <= 10 then
    'Good practical Magic option with useful current event coverage.'
  when le.fit_grade ~ '^B' then
    'Credible Magic option; distance makes it better for selected events than casual drop-ins.'
  when le.confidence = 'low' then
    'Real but check-first; current source-supported events are usable while venue confidence remains limited.'
  else
    'Real Magic option, best treated as a selective or backup planning choice.'
end
|| case
  when v.assessment_notes ~* '(10 ?PM|late[- ]night|starts? late)' then
    ' Its unusual late schedule makes advance planning important.'
  when v.assessment_notes ~* 'no prox(y|ies)' then
    ' Check proxy restrictions before choosing an event.'
  when v.assessment_notes ~* '(cEDH|high[- ]power|competitive)' then
    ' Check power expectations before attending.'
  when le.confidence = 'low' then
    ' Verify before traveling.'
  else ''
end
from latest_evaluation le
where le.entity_id = v.id;

update public.venues
set planning_summary = case
  when lifecycle_state = 'identity_blocked' then
    'Identity unresolved; do not rely on this venue''s events without checking the attached source.'
  else
    'Unreviewed lead; treat current listings as check-first until one bounded baseline pass is complete.'
end
where planning_summary is null;

alter table public.venues
  alter column planning_summary set not null;
