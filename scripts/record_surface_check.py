"""Tiny helper for the record_entity_surface_check(...) Supabase RPC.

This helper is intentionally narrow. It does not support proposals, event
writes, evaluations, Signals, schema changes, exports, or generated artifacts.

By default it prints connector-friendly SQL for the requested dry-run or live
RPC call. With --execute and a database URL it runs the SQL through psql and
prints the RPC return fields.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone


ENTITY_TYPES = {"venue", "community"}
SURFACE_TYPES = {
    "official_site",
    "wpn_eventlink",
    "event_calendar",
    "instagram",
    "facebook",
    "discord",
    "review",
    "other",
}
DISPOSITIONS = {
    "inspected_current",
    "inspected_thin",
    "route_found_content_not_inspected",
    "blocked_gated",
    "unsafe_tbd",
    "not_found",
    "stale",
    "contradiction",
    "not_material",
}
MATERIALITY = {"low", "medium", "high"}


def sql_literal(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def sql_timestamptz(value: str) -> str:
    return f"{sql_literal(value)}::timestamptz"


def sql_uuid(value: str | None) -> str:
    if not value:
        return "NULL::uuid"
    return f"{sql_literal(value)}::uuid"


def build_rpc_select(args: argparse.Namespace, *, dry_run: bool) -> str:
    return f"""select coverage_id, outcome, wrote, research_change_id
from public.record_entity_surface_check(
  p_idempotency_key := {sql_literal(args.idempotency_key)},
  p_entity_type := {sql_literal(args.entity_type)},
  p_entity_id := {sql_literal(args.entity_id)},
  p_surface_type := {sql_literal(args.surface_type)},
  p_disposition := {sql_literal(args.disposition)},
  p_checked_at := {sql_timestamptz(args.checked_at)},
  p_summary := {sql_literal(args.summary)},
  p_source_id := {sql_literal(args.source_id)},
  p_is_useful := {sql_literal(args.useful)},
  p_materiality := {sql_literal(args.materiality)},
  p_followup_item_id := {sql_uuid(args.followup_item_id)},
  p_dry_run := {sql_literal(dry_run)}
);"""


def build_replay_check(args: argparse.Namespace) -> str:
    if args.dry_run:
        return ""
    return f"""

-- Idempotent replay check: should return outcome = replayed and wrote = false.
{build_rpc_select(args, dry_run=False)}

select count(*) as coverage_count
from public.entity_surface_coverage
where idempotency_key = {sql_literal(args.idempotency_key)};"""


def run_psql(sql: str, database_url: str) -> subprocess.CompletedProcess[str]:
    if not shutil.which("psql"):
        raise RuntimeError("psql is not available on PATH")
    return subprocess.run(
        ["psql", database_url, "--set", "ON_ERROR_STOP=1", "--no-psqlrc", "--command", sql],
        text=True,
        capture_output=True,
        check=False,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", default=True, help="Validate through the RPC without writing. Default.")
    mode.add_argument("--live", action="store_true", help="Prepare or execute the live RPC call.")
    parser.add_argument("--execute", action="store_true", help="Run through psql using --database-url/DATABASE_URL/SUPABASE_DB_URL.")
    parser.add_argument("--database-url", help="Postgres connection string for psql execution. Never commit it.")
    parser.add_argument("--replay-check", action="store_true", help="After a live call, repeat the same call and count rows for this idempotency key.")
    parser.add_argument("--idempotency-key", required=True)
    parser.add_argument("--entity-type", required=True, choices=sorted(ENTITY_TYPES))
    parser.add_argument("--entity-id", required=True)
    parser.add_argument("--surface-type", required=True, choices=sorted(SURFACE_TYPES))
    parser.add_argument("--disposition", required=True, choices=sorted(DISPOSITIONS))
    parser.add_argument("--checked-at", default=datetime.now(timezone.utc).isoformat())
    parser.add_argument("--summary", required=True)
    parser.add_argument("--source-id")
    parser.add_argument("--useful", action="store_true", help="Mark the surface result useful for planning.")
    parser.add_argument("--materiality", default="medium", choices=sorted(MATERIALITY))
    parser.add_argument("--followup-item-id")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.dry_run = not args.live

    sql = build_rpc_select(args, dry_run=args.dry_run)
    if args.replay_check:
        sql += build_replay_check(args)

    mode = "DRY RUN" if args.dry_run else "LIVE"
    print(f"Surface-check RPC mode: {mode}")
    print(f"Entity: {args.entity_type}:{args.entity_id}")
    print(f"Surface: {args.surface_type} -> {args.disposition}")

    if not args.execute:
        print("Connector SQL follows. It returns: coverage_id, outcome, wrote, research_change_id.")
        print()
        print(sql)
        return 0

    database_url = args.database_url or os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if not database_url:
        parser.error("--execute requires --database-url, DATABASE_URL, or SUPABASE_DB_URL")

    result = run_psql(sql, database_url)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    if result.returncode != 0:
        return result.returncode
    print("PASS surface-check RPC completed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
