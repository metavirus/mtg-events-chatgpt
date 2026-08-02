do $$
declare
  v_function_sql text;
begin
  select pg_get_functiondef(
    'public.record_source_artifact(text,text,text,text,text,text,bigint,text,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,integer,integer,boolean)'::regprocedure
  )
  into v_function_sql;

  v_function_sql := replace(
    v_function_sql,
    'from public.source_artifact_links
      where artifact_id = v_existing.id
        and target_type = p_target_type
        and target_id = p_target_id
        and relationship = btrim(p_relationship)',
    'from public.source_artifact_links
      where source_artifact_links.artifact_id = v_existing.id
        and source_artifact_links.target_type = p_target_type
        and source_artifact_links.target_id = p_target_id
        and source_artifact_links.relationship = btrim(p_relationship)'
  );

  execute v_function_sql;

  select pg_get_functiondef(
    'public.link_source_artifact(uuid,text,text,text,boolean)'::regprocedure
  )
  into v_function_sql;

  v_function_sql := replace(
    v_function_sql,
    'from public.source_artifact_links
    where artifact_id = p_artifact_id
      and target_type = p_target_type
      and target_id = p_target_id',
    'from public.source_artifact_links
    where source_artifact_links.artifact_id = p_artifact_id
      and source_artifact_links.target_type = p_target_type
      and source_artifact_links.target_id = p_target_id'
  );

  execute v_function_sql;
end $$;
