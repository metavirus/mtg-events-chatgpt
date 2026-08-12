#!/usr/bin/env python3
"""Close the deterministic WPN promoter tail without manual SQL archaeology.

This is intentionally a small operator harness over existing database-owned
promotion/reconciliation functions. It does not invent event logic. Its job is
to make the boring safe lanes easy to run and to leave a compact unresolved
bucket only when real ambiguity remains.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone

from supabase_typed_rpc import (
    psql_rows_or_raise,
    resolve_database_url,
    run_psql,
    sql_literal,
)


PENDING_WHERE = """
  o.source_family = 'wpn'
  and o.promotion_eligibility = 'eligible'
  and o.reconcile_state = 'pending'
  and o.occurrence_date >= current_date
"""


def query_json(database_url: str, sql: str) -> object:
    rows = psql_rows_or_raise(run_psql(sql, database_url))
    if len(rows) != 1:
        raise RuntimeError(f"Expected one JSON row, got {len(rows)} rows.")
    value = next(iter(rows[0].values()))
    return json.loads(value) if value else None


def query_scalar_int(database_url: str, sql: str) -> int:
    rows = psql_rows_or_raise(run_psql(sql, database_url))
    if len(rows) != 1:
        raise RuntimeError(f"Expected one scalar row, got {len(rows)} rows.")
    value = next(iter(rows[0].values()))
    return int(value or 0)


def pending_count(database_url: str) -> int:
    return query_scalar_int(
        database_url,
        f"select count(*)::integer as pending_count from public.event_observations o where {PENDING_WHERE}",
    )


def pending_runs(database_url: str) -> list[dict]:
    payload = query_json(
        database_url,
        f"""
        select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) as runs
        from (
          select
            o.ingest_run_id::text as ingest_run_id,
            min(r.created_at)::text as run_created_at,
            count(*)::integer as pending_count,
            count(distinct o.venue_id)::integer as venue_count,
            min(o.occurrence_date)::text as earliest_date,
            max(o.occurrence_date)::text as latest_date
          from public.event_observations o
          join public.event_ingest_runs r on r.id = o.ingest_run_id
          where {PENDING_WHERE}
          group by o.ingest_run_id
          order by count(*) desc, min(r.created_at) desc
        ) t
        """,
    )
    return payload if isinstance(payload, list) else []


def unresolved_buckets(database_url: str, limit: int) -> list[dict]:
    payload = query_json(
        database_url,
        f"""
        select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) as unresolved
        from (
          select
            coalesce(v.name, o.venue_id, 'unknown venue') as venue,
            o.title,
            o.normalized_title_key,
            count(*)::integer as pending_count,
            min(o.occurrence_date)::text as earliest_date,
            max(o.occurrence_date)::text as latest_date,
            array_agg(distinct o.upstream_event_id order by o.upstream_event_id)
              filter (where o.upstream_event_id is not null) as upstream_event_ids
          from public.event_observations o
          left join public.venues v on v.id = o.venue_id
          where {PENDING_WHERE}
          group by coalesce(v.name, o.venue_id, 'unknown venue'), o.title, o.normalized_title_key
          order by count(*) desc, min(o.occurrence_date), coalesce(v.name, o.venue_id, 'unknown venue'), o.title
          limit {int(limit)}
        ) t
        """,
    )
    return payload if isinstance(payload, list) else []


def call_table_function(
    database_url: str, function_name: str, run_id: str, dry_run: bool
) -> list[dict]:
    payload = query_json(
        database_url,
        f"""
        select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) as rows
        from (
          select *
          from public.{function_name}({sql_literal(run_id)}::uuid, {'true' if dry_run else 'false'})
        ) t
        """,
    )
    return payload if isinstance(payload, list) else []


def summarize_rows(rows: list[dict]) -> dict[str, int]:
    summary: dict[str, int] = {}
    for row in rows:
        outcome = str(row.get("outcome") or row.get("canonical_action") or "unknown")
        wrote = row.get("wrote")
        key = f"{outcome}:wrote={wrote}"
        summary[key] = summary.get(key, 0) + 1
    return dict(sorted(summary.items()))


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Run the bounded WPN backlog closure lanes and report any genuinely "
            "unresolved future eligible WPN observations."
        )
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Apply repairs. Without this flag, all database function calls are dry-run.",
    )
    parser.add_argument(
        "--max-passes",
        type=int,
        default=2,
        help="Maximum bounded reconciliation passes per run in live mode. Default: 2.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Maximum unresolved buckets to print if pending rows remain.",
    )
    parser.add_argument(
        "--db-url",
        help="Optional Supabase Postgres URL. Defaults to SUPABASE_DB_URL/DATABASE_URL or .codex-secrets.",
    )
    args = parser.parse_args()

    database_url = resolve_database_url(args.db_url)
    if not database_url:
        print(
            "ERROR: no Supabase database URL found. Set SUPABASE_DB_URL or DATABASE_URL.",
            file=sys.stderr,
        )
        return 1

    dry_run = not args.live
    before = pending_count(database_url)
    runs = pending_runs(database_url)

    result: dict[str, object] = {
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "mode": "live" if args.live else "dry-run",
        "pendingBefore": before,
        "runsWithPending": runs,
        "passes": [],
    }

    if before > 0:
        passes = 1 if dry_run else max(1, args.max_passes)
        for pass_index in range(1, passes + 1):
            current_runs = pending_runs(database_url)
            if not current_runs:
                break
            pass_result: dict[str, object] = {"pass": pass_index, "runs": []}
            for run in current_runs:
                run_id = str(run["ingest_run_id"])
                new_series = call_table_function(
                    database_url, "reconcile_new_event_series", run_id, dry_run
                )
                safe_repairs = call_table_function(
                    database_url, "reconcile_safe_wpn_lane_repairs", run_id, dry_run
                )
                pass_result["runs"].append(
                    {
                        "ingestRunId": run_id,
                        "pendingAtPassStart": run["pending_count"],
                        "newSeries": summarize_rows(new_series),
                        "safeRepairs": summarize_rows(safe_repairs),
                    }
                )
            result["passes"].append(pass_result)
            if dry_run:
                break
            if pending_count(database_url) == 0:
                break

    after = pending_count(database_url)
    result["pendingAfter"] = after
    if after:
        result["unresolvedBuckets"] = unresolved_buckets(database_url, args.limit)

    print(json.dumps(result, indent=2, default=str))
    if args.live and after:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
