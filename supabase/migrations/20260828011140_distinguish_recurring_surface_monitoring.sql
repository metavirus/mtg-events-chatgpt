-- Recurring monitoring is not a finite retry. A quiet daily or weekly check
-- must remain eligible for the next scheduled pass instead of becoming a
-- terminal no-useful-content result.

do $$
declare
  v_identity_args text :=
    'text, text, text, text, text, timestamp with time zone, text, text, boolean, text, uuid, text, text, text, smallint, text, boolean, boolean';
  v_definition text;
  v_original text;
begin
  select pg_get_functiondef(
    ('public.record_entity_surface_check(' || v_identity_args || ')')::regprocedure
  )
  into v_definition;

  v_original := v_definition;

  v_definition := replace(
    v_definition,
    'if v_previous.terminal_outcome is not null and p_reopen_trigger is null then',
    'if v_previous.terminal_outcome is not null
       and v_previous.monitoring_mode not in (''daily'', ''weekly'')
       and p_monitoring_mode not in (''daily'', ''weekly'')
       and p_reopen_trigger is null then'
  );

  v_definition := replace(
    v_definition,
    'if p_reopen_trigger is not null then
      v_attempt := 1;
    else
      v_attempt := v_previous.attempt_number + 1;
    end if;',
    'if p_reopen_trigger is not null
       or p_monitoring_mode in (''daily'', ''weekly'') then
      v_attempt := 1;
    else
      v_attempt := v_previous.attempt_number + 1;
    end if;'
  );

  v_definition := replace(
    v_definition,
    'if p_disposition in (
    ''inspected_thin'', ''route_found_content_not_inspected'', ''blocked_gated'',
    ''unsafe_tbd'', ''not_found'', ''not_material''
  ) and v_attempt > p_max_automatic_retries then',
    'if p_monitoring_mode = ''finite_retry''
     and p_disposition in (
       ''inspected_thin'', ''route_found_content_not_inspected'', ''blocked_gated'',
       ''unsafe_tbd'', ''not_found'', ''not_material''
     )
     and v_attempt > p_max_automatic_retries then'
  );

  if v_definition = v_original
     or position('p_monitoring_mode = ''finite_retry''' in v_definition) = 0
     or position('v_previous.monitoring_mode not in (''daily'', ''weekly'')' in v_definition) = 0 then
    raise exception 'record_entity_surface_check definition did not match the expected lifecycle contract';
  end if;

  execute v_definition;
end;
$$;

update public.entity_surface_coverage
set
  terminal_outcome = null,
  retry_condition = case monitoring_mode
    when 'daily' then 'Continue normal daily monitoring.'
    when 'weekly' then 'Continue normal weekly monitoring.'
  end,
  next_eligible_check_at = checked_at + case monitoring_mode
    when 'daily' then interval '1 day'
    when 'weekly' then interval '7 days'
  end,
  attempt_number = 1
where monitoring_mode in ('daily', 'weekly')
  and terminal_outcome is not null;

comment on function public.record_entity_surface_check(
  text, text, text, text, text, timestamp with time zone, text, text,
  boolean, text, uuid, text, text, text, smallint, text, boolean, boolean
) is
  'Records one idempotent surface observation. Daily and weekly monitoring remain recurring after quiet results; only finite_retry observations can exhaust their automatic retry allowance.';
