do $$
declare
  v_function text;
begin
  select pg_get_functiondef('public.reconcile_new_event_series(uuid, boolean)'::regprocedure)
    into v_function;

  if v_function is null then
    raise exception 'public.reconcile_new_event_series(uuid, boolean) is missing';
  end if;

  v_function := replace(
    v_function,
    'and not r.occupied_slot',
    $replacement$and (
          not r.occupied_slot
          or coalesce(r.event_type, '') in ('prerelease', 'limited', 'draft', 'special')
          or coalesce(r.format, '') in ('Sealed Deck', 'Booster Draft')
          or r.normalized_title_key like '%prerelease%'
          or r.normalized_title_key like 'magic presents%'
        )$replacement$
  );

  v_function := replace(
    v_function,
    'Ambiguous, known-title/new-schedule, and occupied-slot observations remain pending.',
    'Ambiguous and known-title/new-schedule observations remain pending. Occupied slots still block ordinary duplicates, but distinct source-named special/prerelease/draft observations may promote as separate finite series.'
  );

  execute v_function;
end;
$$;

comment on function public.reconcile_new_event_series(uuid, boolean) is
  'Service-only deterministic creator for safe WPN series families. Occupied slots block ordinary duplicates but not distinct source-named special/prerelease/draft observations.';
