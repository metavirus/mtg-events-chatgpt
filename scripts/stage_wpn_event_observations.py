#!/usr/bin/env python3
"""Stage the current rich WPN cache and print a compact reconciliation preview."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone

from refresh_wpn_cache import query_rows


CACHE_ID = "los-alamitos-25mi"


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Stage WPN observations and preview source-neutral reconciliation."
    )
    parser.add_argument("--cache-id", default=CACHE_ID)
    parser.add_argument(
        "--idempotency-key",
        help="Optional stable run key. Defaults to the cache fingerprint and adapter version.",
    )
    args = parser.parse_args()

    cache_rows = query_rows(
        "select id, content_sha256, retrieved_at from public.wpn_snapshot_cache "
        f"where id = {sql_literal(args.cache_id)}"
    )
    if not cache_rows:
        raise SystemExit(f"WPN cache {args.cache_id!r} does not exist.")
    cache = cache_rows[0]
    run_key = args.idempotency_key or (
        f"wpn-observations:v3:{cache['content_sha256']}"
    )

    stage_rows = query_rows(
        "select * from public.stage_wpn_event_observations("
        f"{sql_literal(args.cache_id)}, {sql_literal(run_key)}, 'validation')"
    )
    if len(stage_rows) != 1:
        raise SystemExit(f"Unexpected staging response: {stage_rows!r}")
    stage = stage_rows[0]
    run_id = stage["ingest_run_id"]
    preview = query_rows(
        "select * from public.preview_event_ingest_reconciliation("
        f"{sql_literal(run_id)}::uuid)"
    )
    result = {
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "cacheId": args.cache_id,
        "cacheRetrievedAt": cache["retrieved_at"],
        "cacheFingerprint": cache["content_sha256"],
        "adapterVersion": 3,
        "runId": run_id,
        "outcome": stage["outcome"],
        "staging": {
            "inserted": stage["inserted_count"],
            "refreshed": stage["refreshed_count"],
            "eligible": stage["eligible_count"],
            "held": stage["held_count"],
        },
        "reconciliationPreview": preview,
        "canonicalWrites": 0,
        "visibleUpdates": 0,
        "signals": 0,
    }
    print(json.dumps(result, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
