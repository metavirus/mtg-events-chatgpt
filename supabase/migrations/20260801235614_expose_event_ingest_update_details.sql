create or replace view public.product_research_changes
with (security_invoker = true)
as
select
  id,
  detected_at,
  change_type,
  entity_type,
  entity_id,
  summary,
  review_status,
  created_at,
  details
from public.research_changes
where change_type <> 'surface_check';

revoke all on table public.product_research_changes from public;
grant select on table public.product_research_changes
  to anon, authenticated, service_role;
