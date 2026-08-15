"""Small clean wrapper around Supabase SQL execution.

Use this for ad-hoc Codex queries instead of raw ``supabase db query --linked``
when a concise result is needed. The Supabase CLI can return valid JSON rows and
then exit nonzero during analytics shutdown; the shared helper treats that as
successful only when rows were actually present.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from supabase_typed_rpc import (
    linked_query_rows_or_raise,
    psql_rows_or_raise,
    resolve_database_url,
    run_linked_query,
    run_psql,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run a Supabase SQL query with clean success/failure output."
    )
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--sql", help="SQL to execute.")
    source.add_argument("--file", type=Path, help="SQL file to execute.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--linked",
        action="store_true",
        help="Use the linked Supabase CLI project context.",
    )
    mode.add_argument(
        "--db-url",
        action="store_true",
        help="Use SUPABASE_DB_URL/DATABASE_URL/.codex-secrets through psql.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON rows.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    sql = args.sql if args.sql is not None else args.file.read_text(encoding="utf-8")

    try:
        if args.db_url or not args.linked:
            database_url = resolve_database_url(None)
            if database_url:
                rows = psql_rows_or_raise(run_psql(sql, database_url))
            elif args.db_url:
                raise RuntimeError(
                    "No database URL found in SUPABASE_DB_URL, DATABASE_URL, or "
                    ".codex-secrets/supabase-db-url.txt"
                )
            else:
                rows = linked_query_rows_or_raise(run_linked_query(sql))
        else:
            rows = linked_query_rows_or_raise(run_linked_query(sql))
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    indent = 2 if args.pretty else None
    print(json.dumps({"rows": rows}, ensure_ascii=False, indent=indent))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
