-- Closed days are part of the same weekly-hours contract as timed slots.
-- Preserve the function body, ownership, grants, and security configuration.
do $migration$
declare
  definition text := pg_get_functiondef('public.promote_venue_hours_signal(text)'::regprocedure);
  old_check text := $old$where coalesce(slot->>'open', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
               or coalesce(slot->>'close', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'$old$;
  new_check text := $new$where slot <> '{"closed":true}'::jsonb
              and (
                jsonb_typeof(slot) <> 'object'
                or slot ? 'closed'
                or coalesce(slot->>'open', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
                or coalesce(slot->>'close', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
              )$new$;
begin
  if position(new_check in definition) > 0 then return; end if;
  if position(old_check in definition) = 0 then
    raise exception 'Hours validation has changed; inspect before applying this migration';
  end if;
  execute replace(definition, old_check, new_check);
end;
$migration$;
