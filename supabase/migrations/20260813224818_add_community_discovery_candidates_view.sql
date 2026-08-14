create or replace view public.community_discovery_candidates as
select
  id,
  created_at,
  updated_at,
  status,
  priority,
  title,
  summary,
  details,
  confidence,
  observed_at,
  effective_date,
  recommended_action,
  disposition,
  disposition_reason,
  deduplication_key
from public.coordination_items
where item_type = 'source_lead'
  and details ->> 'inboxKind' = 'community_discovery_candidate'
  and status in ('new', 'acknowledged', 'in_progress', 'needs_clarification', 'ready_for_review', 'deferred');

comment on view public.community_discovery_candidates is
  'Unresolved fuzzy community-discovery leads. These are not canonical communities; promote only after second-source corroboration and a bounded main pass.';
