"""Fail-closed Discord route preflight for mapped channel surveys.

This helper answers one question before any Discord browser work:

    Is the requested navigation method allowed for these exact mapped channels?

It does not open Discord, inspect content, write Supabase rows, or update
cursors. It only reads `discord_channel_watchlist` and exits non-zero when a
planned browser path would violate the recorded safe-access mode.
"""

from __future__ import annotations

import argparse
import sys

from supabase_typed_rpc import (
    linked_query_rows_or_raise,
    psql_rows_or_raise,
    resolve_database_url,
    run_linked_query,
    run_psql,
    sql_literal,
)


METHODS = {
    "direct_url": "direct_navigation_verified",
    "ui_native": "ui_native_navigation_verified",
    "manual": "manual_open_required",
}


def build_sql(channel_urls: list[str]) -> str:
    urls = ", ".join(sql_literal(url) for url in channel_urls)
    return f"""select
  channel_name,
  channel_url,
  safe_access_mode,
  monitoring_status,
  priority,
  cadence,
  reason_to_monitor,
  expected_signal_types,
  latest_run_result,
  last_checked_at,
  last_seen_message_id,
  safe_access_notes
from public.discord_channel_watchlist
where channel_url in ({urls})
order by priority desc, channel_name;"""


def channel_id(url: str) -> str:
    return url.rstrip("/").split("/")[-1]


def text_array_values(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    if not value:
        return []
    text = str(value).strip()
    if text.startswith("{") and text.endswith("}"):
        text = text[1:-1]
    return [part.strip().strip('"') for part in text.split(",") if part.strip()]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--method",
        required=True,
        choices=sorted(METHODS),
        help="Planned Discord access method. direct_url requires direct_navigation_verified; ui_native requires ui_native_navigation_verified; manual requires manual_open_required.",
    )
    parser.add_argument(
        "--channel-url",
        action="append",
        required=True,
        help="Exact Discord channel URL selected from the monitoring map. Repeat for multi-channel POCs.",
    )
    parser.add_argument(
        "--require-multiple",
        action="store_true",
        help="Fail if fewer than two channel URLs are supplied. Useful for multi-channel community POCs.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    urls = list(dict.fromkeys(args.channel_url))
    if args.require_multiple and len(urls) < 2:
        print("DENY: this POC requires multiple mapped channels, but only one was provided.", file=sys.stderr)
        return 2

    sql = build_sql(urls)
    database_url = resolve_database_url(None)
    if database_url:
        rows = psql_rows_or_raise(run_psql(sql, database_url))
    else:
        rows = linked_query_rows_or_raise(run_linked_query(sql))
    rows_by_url = {row["channel_url"]: row for row in rows}
    missing = [url for url in urls if url not in rows_by_url]
    if missing:
        print("DENY: channel URL is not present in discord_channel_watchlist:", file=sys.stderr)
        for url in missing:
            print(f"  - {url}", file=sys.stderr)
        return 2

    required_mode = METHODS[args.method]
    denied: list[tuple[str, str, str]] = []
    for url in urls:
        row = rows_by_url[url]
        actual_mode = row.get("safe_access_mode") or "unknown"
        if actual_mode != required_mode:
            denied.append((row.get("channel_name") or channel_id(url), actual_mode, row.get("safe_access_notes") or ""))

    if denied:
        print(f"DENY: method {args.method} requires safe_access_mode={required_mode}.")
        for name, actual_mode, notes in denied:
            print(f"  - {name}: safe_access_mode={actual_mode}")
            if notes:
                print(f"    notes: {notes}")
        return 2

    print(f"ALLOW: {args.method} is permitted for {len(urls)} mapped channel(s).")
    for row in rows:
        expected = ", ".join(text_array_values(row.get("expected_signal_types")))
        print(f"  - {row['channel_name']} | {row['safe_access_mode']} | {expected}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
