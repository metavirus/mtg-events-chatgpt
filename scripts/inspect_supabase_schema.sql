with columns_snapshot as (
  select jsonb_agg(
    jsonb_build_object(
      'table_schema', c.table_schema,
      'table_name', c.table_name,
      'ordinal_position', c.ordinal_position,
      'column_name', c.column_name,
      'data_type', c.data_type,
      'udt_name', c.udt_name,
      'is_nullable', c.is_nullable,
      'column_default', c.column_default
    )
    order by c.table_schema, c.table_name, c.ordinal_position
  ) as columns_json
  from information_schema.columns c
  where c.table_schema in ('public', 'steward')
),
functions_snapshot as (
  select jsonb_agg(
    jsonb_build_object(
      'function_schema', n.nspname,
      'function_name', p.proname,
      'identity_arguments', pg_get_function_identity_arguments(p.oid),
      'result_type', pg_get_function_result(p.oid),
      'security_definer', p.prosecdef
    )
    order by n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)
  ) as functions_json
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'steward')
)
select
  columns_snapshot.columns_json,
  functions_snapshot.functions_json
from columns_snapshot, functions_snapshot
