update public.entity_surface_coverage
set next_eligible_check_at = case
      when monitoring_mode = 'daily' then checked_at + interval '1 day'
      when monitoring_mode = 'weekly' then checked_at + interval '7 days'
      else next_eligible_check_at
    end
where monitoring_mode in ('daily', 'weekly');

update public.venues
set planning_summary = case id
  when 'finch-sparrow' then
    'Strong nearby candidate. Thursday casual Commander is the best first try; competitive and special-event lanes are separate.'
  when 'collectors-lounge-cypress' then
    'Strong nearby option. Friday is the casual Commander lane; Saturday is explicitly optimized and should be chosen deliberately.'
  else planning_summary
end
where id in ('finch-sparrow', 'collectors-lounge-cypress');
