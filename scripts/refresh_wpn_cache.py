#!/usr/bin/env python3
"""Refresh the 25-mile WPN snapshot and atomically cache it in Supabase."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from urllib.parse import urlparse
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "wizards"
CRAWLER = ROOT / "crawler" / "wizards_locator.py"
SECRET_URL = ROOT / ".codex-secrets" / "supabase-db-url.txt"
CACHE_ID = "los-alamitos-25mi"


def load_json(name: str):
    return json.loads((OUTPUT / name).read_text(encoding="utf-8"))


def database_args() -> list[str]:
    value = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
    if not value and SECRET_URL.exists():
        value = SECRET_URL.read_text(encoding="utf-8").strip()
    if value:
        parsed = urlparse(value)
        if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
            raise SystemExit("SUPABASE_DB_URL is not a valid Postgres connection URL.")
        return ["--db-url", value]
    return ["--linked"]


def run_cli(sql: str) -> str:
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".sql", encoding="utf-8", delete=False
    ) as handle:
        handle.write(sql)
        sql_path = Path(handle.name)
    try:
        command = [
            "supabase", "db", "query", *database_args(),
            "--output-format", "json", "--file", str(sql_path),
        ]
        environment = os.environ.copy()
        environment["SUPABASE_TELEMETRY_DISABLED"] = "1"
        environment["DO_NOT_TRACK"] = "1"
        result = subprocess.run(
            command, cwd=ROOT, env=environment, text=True, capture_output=True, check=False
        )
        combined = "\n".join(part for part in (result.stdout, result.stderr) if part)
        combined = combined.replace("Initialising login role...", "").strip()
        telemetry_shutdown_only = (
            "Timeout while shutting down PostHog" in combined
            and '"rows"' in combined
            and "LegacyDbQueryExecError" not in combined
        )
        if result.returncode != 0 and not telemetry_shutdown_only:
            raise SystemExit(f"Supabase WPN cache write failed:\n{combined}")
        return combined
    finally:
        sql_path.unlink(missing_ok=True)


def dollar_json(value, tag: str) -> str:
    return f"${tag}${json.dumps(value, ensure_ascii=False, separators=(',', ':'))}${tag}$::jsonb"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch the normalized WPN feed, replace its Supabase cache row, and verify it."
    )
    parser.add_argument("--force", action="store_true", help="Refresh even if the local snapshot is under 24 hours old.")
    parser.add_argument("--max-age-hours", type=float, default=24.0)
    args = parser.parse_args()

    metadata_path = OUTPUT / "metadata.json"
    should_fetch = args.force or not metadata_path.exists()
    if not should_fetch:
        metadata = load_json("metadata.json")
        retrieved = datetime.fromisoformat(metadata["retrievedAt"].replace("Z", "+00:00"))
        age_hours = (datetime.now(timezone.utc) - retrieved).total_seconds() / 3600
        should_fetch = age_hours >= args.max_age_hours

    if should_fetch:
        subprocess.run(
            [sys.executable, str(CRAWLER), "--radius-miles", "25", "--output", str(OUTPUT)],
            cwd=ROOT,
            check=True,
        )

    metadata = load_json("metadata.json")
    events_all = load_json("events-all.json")
    events_commander = load_json("events-commander.json")
    organizations = load_json("organizations.json")
    if float(metadata["radiusMiles"]) != 25.0:
        raise SystemExit("Refusing to cache a non-canonical WPN radius.")
    expected = (
        ("allEventCount", len(events_all)),
        ("commanderCandidateCount", len(events_commander)),
        ("organizationCount", len(organizations)),
    )
    for field, actual in expected:
        if int(metadata[field]) != actual:
            raise SystemExit(f"WPN snapshot count mismatch for {field}: metadata={metadata[field]}, actual={actual}")

    canonical = json.dumps(
        {"metadata": metadata, "eventsAll": events_all, "eventsCommander": events_commander, "organizations": organizations},
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    digest = hashlib.sha256(canonical).hexdigest()
    tag = "wpn_" + uuid4().hex
    sql = f"""
with cached as (
insert into public.wpn_snapshot_cache (
  id, retrieved_at, origin_label, origin_latitude, origin_longitude, radius_miles,
  all_event_count, commander_candidate_count, organization_count,
  metadata, events_all, events_commander, organizations, content_sha256
) values (
  '{CACHE_ID}', '{metadata['retrievedAt']}'::timestamptz,
  {dollar_json(metadata['publicOrigin']['label'], tag + '_label')} #>> '{{}}',
  {float(metadata['publicOrigin']['latitude'])}, {float(metadata['publicOrigin']['longitude'])}, 25,
  {len(events_all)}, {len(events_commander)}, {len(organizations)},
  {dollar_json(metadata, tag + '_meta')},
  {dollar_json(events_all, tag + '_all')},
  {dollar_json(events_commander, tag + '_cmdr')},
  {dollar_json(organizations, tag + '_orgs')},
  '{digest}'
)
on conflict (id) do update set
  retrieved_at = excluded.retrieved_at,
  origin_label = excluded.origin_label,
  origin_latitude = excluded.origin_latitude,
  origin_longitude = excluded.origin_longitude,
  radius_miles = excluded.radius_miles,
  all_event_count = excluded.all_event_count,
  commander_candidate_count = excluded.commander_candidate_count,
  organization_count = excluded.organization_count,
  metadata = excluded.metadata,
  events_all = excluded.events_all,
  events_commander = excluded.events_commander,
  organizations = excluded.organizations,
  content_sha256 = excluded.content_sha256
returning *
)
select id, retrieved_at, radius_miles, all_event_count, commander_candidate_count,
       organization_count, content_sha256,
       jsonb_array_length(events_all) as stored_all_events,
       jsonb_array_length(events_commander) as stored_commander_events,
       jsonb_array_length(organizations) as stored_organizations
from cached;
"""
    output = run_cli(sql)
    required = [digest, str(len(events_all)), str(len(events_commander)), str(len(organizations))]
    if not all(item in output for item in required):
        raise SystemExit(f"WPN cache verification did not return expected values:\n{output}")
    print(f"WPN CACHE READY — {len(events_all)} events, {len(events_commander)} Commander candidates, {len(organizations)} organizations")
    print(f"Retrieved: {metadata['retrievedAt']}")
    print(f"SHA-256: {digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
