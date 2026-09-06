\set ON_ERROR_STOP on
begin;
\i supabase/migrations/20260906211131_correct_hours_completeness_and_verification.sql
insert into public.signals (id, category, status, source_id, related_entity_type, related_entity_id, summary, promotion_target, proposed_change)
select 'test-hours-completeness-rollback', 'operational', 'new', source_id,
 'venue', 'collectors-lounge-cypress', 'Rollback-only hours test', 'venue_hours',
 '{"type":"venue_hours","effective_date":"2026-08-29","weekly_hours":{"0":[{"open":"12:00","close":"22:00"}]}}'::jsonb
from public.venue_hours where venue_id='collectors-lounge-cypress';
update public.venue_hours set weekly_hours='{}'::jsonb where venue_id='collectors-lounge-cypress';
select public.promote_venue_hours_signal('test-hours-completeness-rollback');
do $$ begin
 if not exists (select 1 from public.venue_hours where venue_id='collectors-lounge-cypress' and status='variable' and last_verified=(current_timestamp at time zone 'America/Los_Angeles')::date) then raise exception 'Partial/date regression'; end if;
end $$;
update public.signals set status='new', proposed_change=jsonb_build_object('type','venue_hours','weekly_hours',(select jsonb_object_agg(d::text, '[{"closed":true}]'::jsonb) from generate_series(1,6) d)) where id='test-hours-completeness-rollback';
select public.promote_venue_hours_signal('test-hours-completeness-rollback');
do $$ begin
 if not exists (select 1 from public.venue_hours where venue_id='collectors-lounge-cypress' and status='verified' and weekly_hours->'0'='[{"open":"12:00","close":"22:00"}]'::jsonb) then raise exception 'Complete/merge/closed regression'; end if;
end $$;
rollback;
