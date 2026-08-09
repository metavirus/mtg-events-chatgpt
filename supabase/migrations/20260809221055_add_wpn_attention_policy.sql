create or replace function public.annotate_wpn_event_observation_attention(
  p_ingest_run_id uuid
)
returns table(annotated_count integer)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_count integer := 0;
begin
  with candidates as (
    select
      o.id,
      row_number() over (
        partition by
          o.venue_id,
          case
            when o.event_type = 'prerelease' then
              'prerelease:' || coalesce(o.product_or_set_id, o.template_hint_key, o.normalized_title_key, lower(o.title))
            when lower(coalesce(o.title, '')) like '%commanderfest%' then
              'commanderfest:' || coalesce(o.product_or_set_id, o.template_hint_key, o.normalized_title_key, lower(o.title))
            when o.event_type = 'commander' and lower(coalesce(o.title, '')) like '%party%' then
              'commander-party:' || coalesce(o.product_or_set_id, o.template_hint_key, o.normalized_title_key, lower(o.title))
            else
              coalesce(o.event_type, 'event') || ':' || coalesce(o.template_hint_key, o.normalized_title_key, lower(o.title))
          end
        order by o.occurrence_date nulls last, o.start_time nulls last, o.upstream_event_id
      ) as candidate_rank
    from public.event_observations o
    where o.ingest_run_id = p_ingest_run_id
      and o.source_family = 'wpn'
      and o.promotion_eligibility = 'eligible'
      and o.attention_category is null
      and coalesce(o.proxy_policy, 'unspecified') <> 'prohibited'
      and not exists (
        select 1 from public.entity_preferences ep
        where ep.entity_type = 'venue'
          and ep.entity_id = o.venue_id
          and ep.visibility_preference in ('deprioritize', 'hide')
      )
      and (
        lower(coalesce(o.title, '')) like '%commanderfest%'
        or (
          exists (
            select 1 from public.entity_preferences ep
            where ep.entity_type = 'venue'
              and ep.entity_id = o.venue_id
              and ep.is_favorite is true
              and coalesce(ep.visibility_preference, 'normal') = 'normal'
          )
          and (
            o.event_type = 'prerelease'
            or (
              o.event_type = 'commander'
              and (
                lower(coalesce(o.title, '')) like '%party%'
                or lower(coalesce(o.title, '')) like '%special%'
                or lower(coalesce(o.title, '')) like '%festival%'
                or lower(coalesce(o.title, '')) like '%fest%'
              )
            )
          )
        )
      )
  )
  update public.event_observations o
  set
    attention_category = 'event_opportunity',
    attention_priority = 'high',
    attention_summary = case
      when lower(coalesce(o.title, '')) like '%commanderfest%' then
        coalesce(v.name, o.venue_id) || ' has a newly listed Commanderfest event in WPN.'
      when o.event_type = 'prerelease' then
        coalesce(v.name, o.venue_id) || ' has a newly listed prerelease event in WPN.'
      when o.event_type = 'commander' then
        coalesce(v.name, o.venue_id) || ' has a newly listed Commander special in WPN.'
      else
        coalesce(v.name, o.venue_id) || ' has a newly listed WPN event worth checking.'
    end,
    suggested_action = case
      when exists (
        select 1 from public.entity_preferences ep
        where ep.entity_type = 'venue'
          and ep.entity_id = o.venue_id
          and ep.is_favorite is true
          and coalesce(ep.visibility_preference, 'normal') = 'normal'
      ) then 'Check the new WPN listing and decide whether to favorite or calendar it.'
      else 'Review the new WPN listing if this venue is relevant to your plans.'
    end,
    updated_at = timezone('utc', now())
  from candidates c, public.venues v
  where c.id = o.id
    and c.candidate_rank = 1
    and v.id = o.venue_id
  ;

  get diagnostics v_count = row_count;
  return query select v_count;
end;
$$;

revoke all on function public.annotate_wpn_event_observation_attention(uuid)
  from public, anon, authenticated;
grant execute on function public.annotate_wpn_event_observation_attention(uuid)
  to service_role;

comment on function public.annotate_wpn_event_observation_attention(uuid) is
  'Sparse WPN attention policy for daily surveyor deltas. Annotates only independently useful WPN observations before the shared promoter creates Signals.';
