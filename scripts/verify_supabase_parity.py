"""Compare the Supabase research snapshot with the current canonical JSON.

Required environment variables:
  SUPABASE_URL
  SUPABASE_PUBLISHABLE_KEY

The publishable key is safe to use here. Never substitute a service-role key.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_CONFIG = ROOT / "supabase" / "project-config.json"


def local_ids(name: str) -> set[str]:
    rows = json.loads((ROOT / name).read_text(encoding="utf-8"))
    return {row["id"] for row in rows}


def fetch_rows(table: str, columns: str = "id") -> list[dict[str, Any]]:
    base_url = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_PUBLISHABLE_KEY"]
    rows: list[dict[str, Any]] = []
    page_size = 1000
    offset = 0
    while True:
        query = urllib.parse.urlencode({
            "select": columns,
            "limit": page_size,
            "offset": offset,
            "order": "id.asc",
        })
        request = urllib.request.Request(
            f"{base_url}/rest/v1/{table}?{query}",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Accept": "application/json",
            },
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            page = json.load(response)
        rows.extend(page)
        if len(page) < page_size:
            return rows
        offset += page_size


def compare(label: str, expected: set[str], actual: set[str]) -> bool:
    missing = sorted(expected - actual)
    extra = sorted(actual - expected)
    if not missing and not extra:
        print(f"PASS {label}: {len(actual)} IDs match")
        return True
    print(
        f"FAIL {label}: expected {len(expected)}, found {len(actual)}, "
        f"missing {len(missing)}, extra {len(extra)}"
    )
    if missing:
        print("  Missing:", ", ".join(missing[:10]))
    if extra:
        print("  Extra:", ", ".join(extra[:10]))
    return False


def main() -> int:
    if PUBLIC_CONFIG.exists():
        config = json.loads(PUBLIC_CONFIG.read_text(encoding="utf-8"))
        os.environ.setdefault("SUPABASE_URL", config.get("url", ""))
        os.environ.setdefault(
            "SUPABASE_PUBLISHABLE_KEY",
            config.get("publishableKey", ""),
        )

    missing_env = [
        name for name in ("SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY")
        if not os.environ.get(name)
    ]
    if missing_env:
        print("Missing environment variables: " + ", ".join(missing_env))
        return 2

    local_events = json.loads((ROOT / "events.json").read_text(encoding="utf-8"))
    expected_occurrences = {
        event["id"] + "--occurrence"
        for event in local_events
        if not event.get("recurrence")
    }
    checks = [
        ("venues", local_ids("stores.json"), {row["id"] for row in fetch_rows("venues")}),
        ("sources", local_ids("sources.json"), {row["id"] for row in fetch_rows("sources")}),
        (
            "event_series",
            local_ids("events.json"),
            {row["id"] for row in fetch_rows("event_series")},
        ),
        (
            "event_occurrences",
            expected_occurrences,
            {row["id"] for row in fetch_rows("event_occurrences")},
        ),
        (
            "research_changes",
            local_ids("changes.json"),
            {row["id"] for row in fetch_rows("research_changes")},
        ),
    ]
    communities = fetch_rows("communities")
    checks.append(
        (
            "communities",
            {"legendary-creature-club", "infinite-loop-mtg", "mtg-oc"},
            {row["id"] for row in communities},
        )
    )

    passed = all(compare(*check) for check in checks)
    metadata = fetch_rows("dataset_metadata", "id,schema_version,snapshot_at")
    if not metadata:
        print("FAIL dataset_metadata: primary snapshot row is absent")
        passed = False
    else:
        print(
            "PASS dataset_metadata: "
            f"schema {metadata[0]['schema_version']}, "
            f"snapshot {metadata[0]['snapshot_at']}"
        )
    return 0 if passed else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        print(f"Supabase returned HTTP {error.code}: {detail}")
        raise SystemExit(1)
    except urllib.error.URLError as error:
        print(f"Could not reach Supabase: {error.reason}")
        raise SystemExit(1)
