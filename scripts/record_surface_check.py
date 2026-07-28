"""Tiny helper for the record_entity_surface_check(...) Supabase RPC.

This helper is intentionally narrow. It does not support proposals, event
writes, evaluations, Signals, schema changes, exports, or generated artifacts.

By default it prints linked-CLI-friendly SQL for the requested dry-run or live
RPC call. With --execute-linked it runs the SQL through `supabase db query
--linked`; with --execute and a database URL it runs through psql. Both paths
print the RPC return fields directly.
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone

from supabase_typed_rpc import (
    linked_query_rows_or_raise,
    print_rpc_rows,
    resolve_database_url,
    run_supabase_db_url_query,
    run_linked_query,
    run_psql,
    sql_literal,
    sql_timestamptz,
    sql_uuid,
)


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
MONITORING_MODES = {
    "none",
    "daily",
    "weekly",
    "manual_only",
    "finite_retry",
    "discovery_triggered",
}
REOPEN_TRIGGERS = {"new_lead", "access_changed", "user_request"}

def build_eligibility_guard(args: argparse.Namespace) -> str:
    if args.reopen_trigger:
        return "-- Terminal/suppressed surface explicitly reopened by a bounded trigger.\n"
    return f"""do $$
begin
  if exists (
    select 1
    from public.entity_surface_selection_state
    where entity_type = {sql_literal(args.entity_type)}
      and entity_id = {sql_literal(args.entity_id)}
      and surface_type = {sql_literal(args.surface_type)}
      and (
        terminal_outcome is not null
        or (
          next_eligible_check_at is not null
          and next_eligible_check_at > now()
        )
      )
  ) then
    raise exception 'surface check is suppressed or terminal; use a specific --reopen-trigger only for a new lead, access change, or explicit user request';
  end if;
end;
$$;

"""


def build_rpc_select(
    args: argparse.Namespace, *, dry_run: bool, include_guard: bool = True
) -> str:
    guard = build_eligibility_guard(args) if include_guard else ""
    return f"""{guard}select coverage_id, outcome, wrote, research_change_id
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
  p_monitoring_mode := {sql_literal(args.monitoring_mode)},
  p_cursor_value := {sql_literal(args.cursor_value)},
  p_content_fingerprint := {sql_literal(args.content_fingerprint)},
  p_max_automatic_retries := {args.max_automatic_retries}::smallint,
  p_reopen_trigger := {sql_literal(args.reopen_trigger)},
  p_material_change := {sql_literal(args.material_change)},
  p_dry_run := {sql_literal(dry_run)}
);"""


def build_replay_check(args: argparse.Namespace) -> str:
    if args.dry_run:
        return ""
    return f"""

-- Idempotent replay check: should return outcome = replayed and wrote = false.
{build_rpc_select(args, dry_run=False, include_guard=False)}

select count(*) as coverage_count
from public.entity_surface_coverage
where idempotency_key = {sql_literal(args.idempotency_key)};"""


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", default=True, help="Validate through the RPC without writing. Default.")
    mode.add_argument("--live", action="store_true", help="Prepare or execute the live RPC call.")
    parser.add_argument("--execute-linked", action="store_true", help="Run through `supabase db query --linked`.")
    parser.add_argument("--execute", action="store_true", help="Run through Supabase CLI --db-url using --database-url, DATABASE_URL, SUPABASE_DB_URL, or .codex-secrets/supabase-db-url.txt.")
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
    parser.add_argument(
        "--monitoring-mode",
        default="none",
        choices=sorted(MONITORING_MODES),
        help="Only safe, repeatable surfaces should use daily or weekly.",
    )
    parser.add_argument("--cursor-value", help="Opaque surface-specific resume cursor.")
    parser.add_argument("--content-fingerprint", help="Last safely derived delta fingerprint.")
    parser.add_argument(
        "--max-automatic-retries",
        type=int,
        default=1,
        choices=range(0, 4),
        metavar="{0,1,2,3}",
    )
    parser.add_argument("--reopen-trigger", choices=sorted(REOPEN_TRIGGERS))
    parser.add_argument(
        "--material-change",
        action="store_true",
        help="Create an Updates record only for a useful, high-materiality surface discovery or source-health change.",
    )
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

    if not args.execute and not args.execute_linked:
        print("Linked-CLI-friendly SQL follows. It returns: coverage_id, outcome, wrote, research_change_id.")
        print()
        print(sql)
        return 0

    if args.execute_linked:
        result = run_linked_query(sql)
        try:
            rows = linked_query_rows_or_raise(result)
        except RuntimeError as exc:
            if result.stdout:
                print(result.stdout.strip())
            if result.stderr:
                print(result.stderr.strip(), file=sys.stderr)
            print(str(exc), file=sys.stderr)
            return result.returncode or 1
        print_rpc_rows(rows, ["coverage_id", "outcome", "wrote", "research_change_id"])
        print("PASS surface-check RPC completed via linked Supabase CLI")
        return 0

    database_url = resolve_database_url(args.database_url)
    if not database_url:
        parser.error("--execute requires --database-url, DATABASE_URL, or SUPABASE_DB_URL")

    result = run_supabase_db_url_query(sql, database_url)
    try:
        rows = linked_query_rows_or_raise(result)
    except RuntimeError as exc:
        if result.stdout:
            print(result.stdout.strip())
        if result.stderr:
            print(result.stderr.strip(), file=sys.stderr)
        print(str(exc), file=sys.stderr)
        return result.returncode or 1
    print_rpc_rows(rows, ["coverage_id", "outcome", "wrote", "research_change_id"])
    print("PASS surface-check RPC completed via Supabase CLI db-url")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
