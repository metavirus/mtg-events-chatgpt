#!/usr/bin/env python3
"""Stage the current rich WPN cache; optionally run the shared promoter."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone

from refresh_wpn_cache import query_rows


CACHE_ID = "los-alamitos-25mi"
WPN_OBSERVATION_ADAPTER_VERSION = 4


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
    parser.add_argument(
        "--promote",
        action="store_true",
        help="Reconcile and publish future deltas through the shared promoter.",
    )
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help="With --promote, land inventory quietly without Updates or Signals.",
    )
    args = parser.parse_args()
    if args.bootstrap and not args.promote:
        parser.error("--bootstrap requires --promote")

    cache_rows = query_rows(
        "select id, content_sha256, retrieved_at from public.wpn_snapshot_cache "
        f"where id = {sql_literal(args.cache_id)}"
    )
    if not cache_rows:
        raise SystemExit(f"WPN cache {args.cache_id!r} does not exist.")
    cache = cache_rows[0]
    lane = "live" if args.promote else "validation"
    run_key = args.idempotency_key or (
        f"wpn-observations:v{WPN_OBSERVATION_ADAPTER_VERSION}:{cache['content_sha256']}:{lane}"
    )

    stage_rows = query_rows(
        "select * from public.stage_wpn_event_observations("
        f"{sql_literal(args.cache_id)}, {sql_literal(run_key)}, {sql_literal(lane)})"
    )
    if len(stage_rows) != 1:
        raise SystemExit(f"Unexpected staging response: {stage_rows!r}")
    stage = stage_rows[0]
    run_id = stage["ingest_run_id"]
    query_rows(
        "with updated as ("
        "update public.event_ingest_runs "
        f"set adapter_version = {WPN_OBSERVATION_ADAPTER_VERSION} "
        f"where id = {sql_literal(run_id)}::uuid "
        "returning id) select count(*)::integer as updated_count from updated"
    )
    preview = query_rows(
        "select * from public.preview_event_ingest_reconciliation("
        f"{sql_literal(run_id)}::uuid)"
    )
    attention = query_rows(
        "select * from public.annotate_wpn_event_observation_attention("
        f"{sql_literal(run_id)}::uuid)"
    )
    promotion = None
    if args.promote:
        presentation_mode = "bootstrap" if args.bootstrap else "delta"
        promoted = query_rows(
            "select * from public.promote_event_ingest_run("
            f"{sql_literal(run_id)}::uuid, {sql_literal(presentation_mode)}, false)"
        )
        if len(promoted) != 1:
            raise SystemExit(f"Unexpected promoter response: {promoted!r}")
        promotion = promoted[0]

    result = {
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "cacheId": args.cache_id,
        "cacheRetrievedAt": cache["retrieved_at"],
        "cacheFingerprint": cache["content_sha256"],
        "adapterVersion": WPN_OBSERVATION_ADAPTER_VERSION,
        "runId": run_id,
        "outcome": stage["outcome"],
        "staging": {
            "inserted": stage["inserted_count"],
            "refreshed": stage["refreshed_count"],
            "eligible": stage["eligible_count"],
            "held": stage["held_count"],
        },
        "reconciliationPreview": preview,
        "attention": attention[0] if attention else None,
        "promotion": promotion,
        "canonicalWrites": bool(promotion and promotion["wrote"]),
        "visibleUpdates": int(promotion["grouped_update_count"]) if promotion else 0,
        "signals": int(promotion["signal_count"]) if promotion else 0,
    }
    print(json.dumps(result, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
