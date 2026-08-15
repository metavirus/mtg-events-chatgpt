"""Refresh the public daily-agent status aggregate table.

The app should show steady-state automation health without exposing raw
operational rows. This script reads private monitoring tables through the
service/database lane and writes one compact public row per daily surface.
"""

from __future__ import annotations

import json
import os
import sys
from argparse import ArgumentParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
BLESSED_PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_typed_rpc import psql_rows_or_raise, run_psql  # noqa: E402


def reexec_with_blessed_runtime() -> None:
    if not BLESSED_PYTHON.exists():
        return
    current = Path(sys.executable).resolve()
    blessed = BLESSED_PYTHON.resolve()
    if current == blessed:
        return
    completed = __import__("subprocess").run([str(blessed), __file__, *sys.argv[1:]], cwd=ROOT)
    raise SystemExit(completed.returncode)


def load_database_url() -> str:
    value = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
    if not value:
        secret_path = ROOT / ".codex-secrets" / "supabase-db-url.txt"
        if secret_path.exists():
            value = secret_path.read_text(encoding="utf-8").strip()
    if not value:
        raise SystemExit("SUPABASE_DB_URL or .codex-secrets/supabase-db-url.txt is required")
    parsed = urlparse(value)
    if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
        raise SystemExit("SUPABASE_DB_URL is not a valid Postgres connection URL")
    return value


REFRESH_SQL = r"""
with surface_rollup as (
  select
    surface_type,
    max(checked_at) as last_checked_at,
    count(*)::integer as checked_count,
    count(*) filter (where is_useful)::integer as useful_count,
    count(*) filter (
      where lower(coalesce(disposition, '')) in ('blocked', 'access_gated', 'needs_followup', 'retry')
    )::integer as attention_count,
    (array_agg(summary order by checked_at desc nulls last))[1] as latest_summary,
    (array_agg(disposition order by checked_at desc nulls last))[1] as latest_result
  from public.entity_surface_coverage
  where surface_type in ('wpn_eventlink', 'instagram', 'facebook')
  group by surface_type
),
wpn_change_rollup as (
  select
    max(detected_at) as last_checked_at,
    count(*)::integer as ingest_update_count,
    (array_agg(summary order by detected_at desc nulls last))[1] as latest_summary
  from public.research_changes
  where change_type = 'event_ingest_delta'
    and review_status = 'accepted'
),
discord_rollup as (
  with latest_batch as (
    select max(last_checked_at) as checked_at
    from public.discord_channel_watchlist
    where safe_access_mode = 'ui_native_navigation_verified'
      and latest_run_result in ('useful', 'quiet', 'stale')
  )
  select
    max(last_checked_at) as last_checked_at,
    count(*)::integer as checked_count,
    count(*) filter (where latest_run_result = 'useful')::integer as useful_count,
    count(*) filter (where latest_run_result = 'quiet')::integer as quiet_count,
    count(*) filter (where latest_run_result = 'stale')::integer as stale_count,
    count(*) filter (where latest_run_result in ('blocked_repair', 'needs_deeper_replay'))::integer as attention_count
  from public.discord_channel_watchlist
  cross join latest_batch
  where safe_access_mode = 'ui_native_navigation_verified'
    and latest_run_result in ('useful', 'quiet', 'stale')
    and last_checked_at >= latest_batch.checked_at - interval '10 minutes'
),
agent_rows as (
  select
    'wpn'::text as id,
    'WPN / EventLink'::text as label,
    'wpn'::text as surface_group,
    greatest(coalesce(sr.last_checked_at, '-infinity'::timestamptz), coalesce(wr.last_checked_at, '-infinity'::timestamptz)) as last_checked_at,
    coalesce(wr.ingest_update_count, sr.checked_count, 0)::integer as primary_count,
    coalesce(sr.useful_count, 0)::integer as useful_count,
    0::integer as quiet_count,
    0::integer as stale_count,
    coalesce(sr.attention_count, 0)::integer as attention_count,
    case
      when wr.last_checked_at is not null and (sr.last_checked_at is null or wr.last_checked_at >= sr.last_checked_at) then 'event_ingest_active'
      else coalesce(nullif(sr.latest_result, ''), 'event_ingest_active')
    end::text as latest_result,
    case
      when wr.last_checked_at is not null and (sr.last_checked_at is null or wr.last_checked_at >= sr.last_checked_at)
        then coalesce(nullif(wr.latest_summary, ''), 'Cloud WPN/EventLink surveyor is configured and quiet runs do not create Updates.')
      else coalesce(nullif(sr.latest_summary, ''), nullif(wr.latest_summary, ''), 'Cloud WPN/EventLink surveyor is configured and quiet runs do not create Updates.')
    end::text as summary,
    'events'::text as route,
    'Review events'::text as action_label
  from wpn_change_rollup wr
  left join surface_rollup sr on sr.surface_type = 'wpn_eventlink'
  union all
  select
    sr.surface_type::text as id,
    initcap(sr.surface_type)::text as label,
    'social'::text as surface_group,
    sr.last_checked_at,
    sr.checked_count,
    sr.useful_count,
    0::integer as quiet_count,
    0::integer as stale_count,
    sr.attention_count,
    coalesce(nullif(sr.latest_result, ''), 'checked')::text as latest_result,
    coalesce(nullif(sr.latest_summary, ''), 'Bounded social surface survey ran without a material user-facing delta.')::text as summary,
    'research'::text as route,
    'Open coverage'::text as action_label
  from surface_rollup sr
  where sr.surface_type in ('instagram', 'facebook')
  union all
  select
    'discord'::text as id,
    'Discord'::text as label,
    'discord'::text as surface_group,
    dr.last_checked_at,
    dr.checked_count,
    dr.useful_count,
    dr.quiet_count,
    dr.stale_count,
    dr.attention_count,
    case
      when dr.attention_count > 0 then 'needs_attention'
      when dr.useful_count > 0 then 'useful'
      when dr.quiet_count > 0 then 'quiet'
      else 'checked'
    end::text as latest_result,
    'Bounded v1 Discord watchlist reads mapped channels with Signal/Event writes disabled.'::text as summary,
    'communities'::text as route,
    'Open communities'::text as action_label
  from discord_rollup dr
)
insert into public.daily_agent_status (
  id, label, surface_group, last_checked_at, primary_count, useful_count,
  quiet_count, stale_count, attention_count, latest_result, summary, route,
  action_label, last_run_at, updated_at
)
select
  id, label, surface_group, nullif(last_checked_at, '-infinity'::timestamptz),
  primary_count, useful_count, quiet_count, stale_count, attention_count,
  latest_result, summary, route, action_label,
  case
    when %(ran_agent)s = 'discord' and id = 'discord' then now()
    when %(ran_agent)s = 'surveyor' and id in ('wpn', 'instagram', 'facebook') then now()
    when %(ran_agent)s = 'all' then now()
    else null
  end,
  now()
from agent_rows
on conflict (id) do update set
  label = excluded.label,
  surface_group = excluded.surface_group,
  last_checked_at = excluded.last_checked_at,
  primary_count = excluded.primary_count,
  useful_count = excluded.useful_count,
  quiet_count = excluded.quiet_count,
  stale_count = excluded.stale_count,
  attention_count = excluded.attention_count,
  latest_result = excluded.latest_result,
  summary = excluded.summary,
  route = excluded.route,
  action_label = excluded.action_label,
  last_run_at = coalesce(excluded.last_run_at, public.daily_agent_status.last_run_at),
  updated_at = now()
returning id, last_run_at, last_checked_at, primary_count, useful_count, quiet_count, stale_count, attention_count, latest_result;
"""


def main() -> int:
    reexec_with_blessed_runtime()
    parser = ArgumentParser(description="Refresh safe app-facing daily-agent aggregate status.")
    parser.add_argument(
        "--ran-agent",
        choices=("none", "surveyor", "discord", "all"),
        default="none",
        help="Stamp last_run_at for the workflow lane that invoked this refresh.",
    )
    args = parser.parse_args()
    sql = REFRESH_SQL.replace("%(ran_agent)s", f"'{args.ran_agent}'")
    rows = psql_rows_or_raise(run_psql(sql, load_database_url()))
    print(json.dumps({"status": "ok", "rows": rows}, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
