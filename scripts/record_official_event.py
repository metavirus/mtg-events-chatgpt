"""Tiny helper for routine typed official-event Supabase RPCs.

This wrapper covers only the two clean routine event-delta lanes:

- one attributable official standalone/finite event occurrence;
- one official dated occurrence attached to an existing recurring series.

It does not support proposals, Signals, evaluations, schema changes, exports,
or generic mutations.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date

from supabase_typed_rpc import (
    linked_query_rows_or_raise,
    print_rpc_rows,
    resolve_database_url,
    run_linked_query,
    run_psql,
    sql_date,
    sql_literal,
    sql_time,
)


CONFIDENCE = {"low", "medium", "high"}
EVIDENCE_STATE = {"corroborated", "single_source", "projected", "needs_confirmation"}
OCCURRENCE_STATUS = {"confirmed", "projected", "cancelled", "moved", "at_risk"}
OFFICIAL_SOURCE_TYPES = {"official", "officialWebsite", "eventsPage", "eventPlatform", "calendar"}


def build_common_parser(subparsers: argparse._SubParsersAction[argparse.ArgumentParser], name: str, help_text: str) -> argparse.ArgumentParser:
    parser = subparsers.add_parser(name, help=help_text)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", default=True, help="Validate through the RPC without writing. Default.")
    mode.add_argument("--live", action="store_true", help="Prepare or execute the live RPC call.")
    parser.add_argument("--execute-linked", action="store_true", help="Run through `supabase db query --linked`.")
    parser.add_argument("--execute", action="store_true", help="Run through psql using --database-url/DATABASE_URL/SUPABASE_DB_URL.")
    parser.add_argument("--database-url", help="Postgres connection string for psql execution. Never commit it.")
    parser.add_argument("--replay-check", action="store_true", help="Repeat the same live RPC call once to confirm idempotency.")
    parser.add_argument("--idempotency-key", required=True)
    parser.add_argument("--venue-id", required=True)
    parser.add_argument("--series-id", required=True)
    parser.add_argument("--occurrence-id", required=True)
    parser.add_argument("--occurrence-date", required=True, help="YYYY-MM-DD")
    parser.add_argument("--start-time", required=True, help="HH:MM or HH:MM:SS local venue time")
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--source-label", required=True)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--summary", required=True)
    parser.add_argument("--source-type", default="eventsPage", choices=sorted(OFFICIAL_SOURCE_TYPES))
    parser.add_argument("--entry-fee", type=float)
    parser.add_argument("--details")
    parser.add_argument("--end-time", help="HH:MM or HH:MM:SS local venue time")
    parser.add_argument("--confidence", default="medium", choices=sorted(CONFIDENCE))
    parser.add_argument("--evidence-state", default="single_source", choices=sorted(EVIDENCE_STATE))
    parser.add_argument("--occurrence-status", default="confirmed", choices=sorted(OCCURRENCE_STATUS))
    parser.add_argument("--last-verified", default=str(date.today()), help="YYYY-MM-DD")
    return parser


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    official = build_common_parser(
        subparsers,
        "official-event",
        "One attributable official standalone or finite event occurrence.",
    )
    official.add_argument("--title", required=True)
    official.add_argument("--format", required=True)
    official.add_argument("--event-type", required=True)
    official.add_argument("--series-start-date", help="Defaults to occurrence-date.")
    official.add_argument("--series-end-date", help="Defaults to series-start-date.")
    official.add_argument("--bracket")

    recurring = build_common_parser(
        subparsers,
        "recurring-occurrence",
        "One official dated occurrence attached to an existing recurring series.",
    )
    recurring.set_defaults(source_type="eventPlatform")
    return parser


def sql_numeric(value: float | None) -> str:
    if value is None:
        return "NULL::numeric"
    return str(value)


def build_official_event_sql(args: argparse.Namespace) -> str:
    series_start = args.series_start_date or args.occurrence_date
    series_end = args.series_end_date or series_start
    return f"""select series_id, occurrence_id, source_id, outcome, wrote, research_change_id
from public.upsert_attributable_official_event(
  p_idempotency_key := {sql_literal(args.idempotency_key)},
  p_venue_id := {sql_literal(args.venue_id)},
  p_series_id := {sql_literal(args.series_id)},
  p_occurrence_id := {sql_literal(args.occurrence_id)},
  p_title := {sql_literal(args.title)},
  p_format := {sql_literal(args.format)},
  p_event_type := {sql_literal(args.event_type)},
  p_occurrence_date := {sql_date(args.occurrence_date)},
  p_start_time := {sql_time(args.start_time)},
  p_source_id := {sql_literal(args.source_id)},
  p_source_label := {sql_literal(args.source_label)},
  p_source_url := {sql_literal(args.source_url)},
  p_summary := {sql_literal(args.summary)},
  p_source_type := {sql_literal(args.source_type)},
  p_series_start_date := {sql_date(series_start)},
  p_series_end_date := {sql_date(series_end)},
  p_bracket := {sql_literal(args.bracket)},
  p_entry_fee := {sql_numeric(args.entry_fee)},
  p_details := {sql_literal(args.details)},
  p_end_time := {sql_literal(args.end_time)}::time,
  p_confidence := {sql_literal(args.confidence)},
  p_evidence_state := {sql_literal(args.evidence_state)},
  p_occurrence_status := {sql_literal(args.occurrence_status)},
  p_last_verified := {sql_date(args.last_verified)},
  p_dry_run := {sql_literal(args.dry_run)}
);"""


def build_recurring_occurrence_sql(args: argparse.Namespace) -> str:
    return f"""select series_id, occurrence_id, source_id, outcome, wrote, research_change_id
from public.upsert_official_occurrence_on_recurring_series(
  p_idempotency_key := {sql_literal(args.idempotency_key)},
  p_venue_id := {sql_literal(args.venue_id)},
  p_series_id := {sql_literal(args.series_id)},
  p_occurrence_id := {sql_literal(args.occurrence_id)},
  p_occurrence_date := {sql_date(args.occurrence_date)},
  p_start_time := {sql_time(args.start_time)},
  p_source_id := {sql_literal(args.source_id)},
  p_source_label := {sql_literal(args.source_label)},
  p_source_url := {sql_literal(args.source_url)},
  p_summary := {sql_literal(args.summary)},
  p_source_type := {sql_literal(args.source_type)},
  p_entry_fee := {sql_numeric(args.entry_fee)},
  p_details := {sql_literal(args.details)},
  p_end_time := {sql_literal(args.end_time)}::time,
  p_confidence := {sql_literal(args.confidence)},
  p_evidence_state := {sql_literal(args.evidence_state)},
  p_occurrence_status := {sql_literal(args.occurrence_status)},
  p_last_verified := {sql_date(args.last_verified)},
  p_dry_run := {sql_literal(args.dry_run)}
);"""


def build_sql(args: argparse.Namespace) -> str:
    if args.command == "official-event":
        return build_official_event_sql(args)
    if args.command == "recurring-occurrence":
        return build_recurring_occurrence_sql(args)
    raise RuntimeError(f"Unsupported command: {args.command}")


def execute_and_print(sql: str, *, linked: bool, database_url: str | None) -> int:
    if linked:
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
        print_rpc_rows(rows, ["series_id", "occurrence_id", "source_id", "outcome", "wrote", "research_change_id"])
        return 0

    if not database_url:
        raise RuntimeError("--execute requires --database-url, DATABASE_URL, or SUPABASE_DB_URL")
    result = run_psql(sql, database_url)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    return result.returncode


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.dry_run = not args.live

    sql = build_sql(args)
    mode = "DRY RUN" if args.dry_run else "LIVE"
    print(f"Typed event RPC mode: {mode}")
    print(f"Lane: {args.command}")
    print(f"Venue: {args.venue_id}")
    print(f"Series: {args.series_id}")
    print(f"Occurrence: {args.occurrence_id}")

    if not args.execute and not args.execute_linked:
        print("Linked-CLI-friendly SQL follows. It returns: series_id, occurrence_id, source_id, outcome, wrote, research_change_id.")
        print()
        print(sql)
        return 0

    if args.execute and args.execute_linked:
        parser.error("Use either --execute-linked or --execute, not both.")

    try:
        status = execute_and_print(
            sql,
            linked=args.execute_linked,
            database_url=resolve_database_url(args.database_url),
        )
    except RuntimeError as exc:
        parser.error(str(exc))
    if status != 0:
        return status
    print("PASS typed event RPC completed")

    if args.replay_check:
        if args.dry_run:
            parser.error("--replay-check requires --live")
        print()
        print("Replay check:")
        try:
            replay_status = execute_and_print(
                build_sql(args),
                linked=args.execute_linked,
                database_url=resolve_database_url(args.database_url),
            )
        except RuntimeError as exc:
            parser.error(str(exc))
        if replay_status != 0:
            return replay_status
        print("PASS replay completed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
