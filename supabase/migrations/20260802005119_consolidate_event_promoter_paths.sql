-- Consolidate every clean normalized event lane behind one finalizer.
-- This migration intentionally fails if the immediately preceding promoter
-- definition has drifted, rather than silently leaving targeted observations
-- dependent on helper-side orchestration.
do $$
declare
  v_oid oid;
  v_definition text;
  v_marker text := '  perform * from public.reconcile_event_ingest_run(p_ingest_run_id, null, p_dry_run);';
  v_replacement text :=
    '  perform * from public.reconcile_targeted_recurring_observations(p_ingest_run_id, p_dry_run);' || chr(10) ||
    '  perform * from public.reconcile_event_ingest_run(p_ingest_run_id, null, p_dry_run);';
begin
  select p.oid into v_oid
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'promote_event_ingest_run'
    and pg_get_function_identity_arguments(p.oid) =
      'p_ingest_run_id uuid, p_presentation_mode text, p_dry_run boolean';

  if v_oid is null then
    raise exception 'expected promote_event_ingest_run(uuid,text,boolean) is missing';
  end if;

  v_definition := pg_get_functiondef(v_oid);
  if position(v_marker in v_definition) = 0 then
    raise exception 'promoter reconciliation marker not found; review function drift';
  end if;

  execute replace(v_definition, v_marker, v_replacement);
end;
$$;

comment on function public.promote_event_ingest_run(uuid, text, boolean) is
  'Single service-only source-neutral finalizer: runs targeted and general reconciliation, suppresses bootstrap novelty, groups Updates, and emits only explicitly annotated Signals.';

-- Normalized observations plus the shared promoter now cover these ordinary
-- clean-addition shapes. Remove the old direct catalog writers completely so
-- future callers cannot accidentally bypass bindings, presentation, or replay
-- semantics.
drop function public.upsert_attributable_official_event(
  text, text, text, text, text, text, text, date, time, text, text, text,
  text, text, date, date, text, numeric, text, time, text, text, text, date,
  boolean
);

drop function public.upsert_attributable_wpn_event(
  text, text, text, text, text, text, text, date, time, text, text, text,
  text, text, numeric, text, time, text, text, text, date, boolean
);
