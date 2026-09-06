-- A partial announcement verifies its days, not an entire missing week.
-- Keep the existing closed-day validation, merge behavior, and grants intact.
do $migration$
declare
  definition text := pg_get_functiondef('public.promote_venue_hours_signal(text)'::regprocedure);
begin
  if position('case when (select count(*)' in definition) > 0
     and position('current_timestamp at time zone ''America/Los_Angeles''' in definition) > 0 then return; end if;
  if position('coalesce(v_effective_date, current_date)' in definition) = 0 then
    raise exception 'Unexpected hours promoter definition; inspect before applying';
  end if;
  definition := replace(definition, 'coalesce(v_effective_date, current_date)', '(current_timestamp at time zone ''America/Los_Angeles'')::date');
  definition := replace(definition, E'    ''verified'',\n    coalesce(v_existing_weekly', E'    case when (select count(*) from generate_series(0,6) d where jsonb_array_length(coalesce((coalesce(v_existing_weekly, ''{}''::jsonb) || v_weekly)->d::text, ''[]''::jsonb)) > 0) = 7 then ''verified'' else ''variable'' end,\n    coalesce(v_existing_weekly');
  definition := replace(definition, 'set status = ''verified'',', 'set status = excluded.status,');
  if position('case when (select count(*)' in definition) = 0 then
    raise exception 'Hours completeness patch did not match';
  end if;
  execute definition;
end;
$migration$;
