#!/usr/bin/env python3
"""Audit venue source completeness.

This is a fast operator check, not a research pass. It answers one question:
which known stores still look thinly sourced after the hydration work?

The output is intentionally small so it can be run at session start or before a
main-pass batch without generating durable artifacts.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from typing import Any

from supabase_typed_rpc import psql_rows_or_raise, resolve_database_url, run_psql


WPN_TYPES = {"wpn", "wizards", "eventlink"}
OFFICIAL_TYPES = {"official", "officialwebsite", "website", "eventspage", "eventplatform", "calendar"}
SOCIAL_TYPES = {"instagram", "facebook", "discord", "social"}
DIRECTORY_TYPES = {"directory", "review", "reviews", "yelp", "google"}


def classify_source(row: dict[str, str]) -> str:
    source_type = (row.get("source_type") or "").lower()
    url = (row.get("url") or "").lower()
    label = (row.get("label") or "").lower()
    source_id = (row.get("source_id") or "").lower()
    joined = " ".join([source_type, url, label, source_id])
    if source_type in WPN_TYPES or "locator.wizards.com" in joined or "eventlink" in joined:
        return "wpn"
    if source_type in OFFICIAL_TYPES or any(term in joined for term in ("official", "website", "events page", "eventbrite")):
        return "official"
    if source_type in SOCIAL_TYPES or any(term in joined for term in ("instagram.com", "facebook.com", "discord")):
        return "social"
    if source_type in DIRECTORY_TYPES or any(term in joined for term in ("yelp", "google", "simon.com", "irvinecompanyretail")):
        return "directory"
    return "other"


def issue_for(counts: Counter[str], source_count: int) -> str:
    non_wpn = source_count - counts["wpn"]
    if source_count == 0:
        return "no_sources"
    if counts["wpn"] and non_wpn == 0:
        return "wpn_only"
    if counts["wpn"] and not counts["official"] and not counts["social"]:
        return "wpn_plus_directory_only"
    if source_count <= 2 and not counts["official"] and not counts["social"]:
        return "thin_no_direct_route"
    if source_count <= 1:
        return "thin_single_source"
    return ""


def build_sql() -> str:
    return """
select
  v.id as venue_id,
  v.name as venue_name,
  coalesce(v.city, '') as city,
  coalesce(v.research_status, '') as research_status,
  coalesce(v.operating_status, '') as operating_status,
  coalesce(v.assessment ->> 'lifecycle_state', '') as lifecycle_state,
  coalesce(s.id, '') as source_id,
  coalesce(s.label, '') as label,
  coalesce(s.url, '') as url,
  coalesce(s.source_type, '') as source_type,
  coalesce(s.health_status, '') as health_status,
  coalesce(es.relationship, '') as relationship
from public.venues v
left join public.entity_sources es
  on es.entity_type = 'venue'
 and es.entity_id = v.id
left join public.sources s
  on s.id = es.source_id
where coalesce(v.operating_status, '') <> 'closed'
order by v.name, s.source_type, s.label;
"""


def summarize(rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    venues: dict[str, dict[str, Any]] = {}
    for row in rows:
        venue = venues.setdefault(
            row["venue_id"],
            {
                "venue_id": row["venue_id"],
                "venue_name": row["venue_name"],
                "city": row["city"],
                "research_status": row["research_status"],
                "lifecycle_state": row["lifecycle_state"],
                "source_count": 0,
                "counts": Counter(),
                "sources": [],
            },
        )
        if not row.get("source_id"):
            continue
        bucket = classify_source(row)
        venue["source_count"] += 1
        venue["counts"][bucket] += 1
        venue["sources"].append(
            {
                "id": row["source_id"],
                "type": row["source_type"],
                "bucket": bucket,
                "label": row["label"],
                "health": row["health_status"],
                "url": row["url"],
            }
        )

    flagged: list[dict[str, Any]] = []
    for venue in venues.values():
        issue = issue_for(venue["counts"], venue["source_count"])
        if not issue:
            continue
        counts = dict(venue["counts"])
        flagged.append(
            {
                "venue_id": venue["venue_id"],
                "venue_name": venue["venue_name"],
                "city": venue["city"],
                "issue": issue,
                "source_count": venue["source_count"],
                "source_buckets": {key: counts.get(key, 0) for key in ("wpn", "official", "social", "directory", "other")},
                "sources": venue["sources"],
            }
        )
    return flagged


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database-url")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    parser.add_argument("--limit", type=int, default=0, help="Limit printed flagged venues; 0 means all.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    database_url = resolve_database_url(args.database_url)
    if not database_url:
        raise SystemExit("SUPABASE_DB_URL or .codex-secrets/supabase-db-url.txt is required")
    rows = psql_rows_or_raise(run_psql(build_sql(), database_url))
    flagged = summarize(rows)
    visible = flagged[: args.limit] if args.limit else flagged
    if args.json:
        print(json.dumps({"flagged_count": len(flagged), "flagged": visible}, indent=2))
        return 0
    print(f"Flagged venues: {len(flagged)}")
    for item in visible:
        buckets = ", ".join(f"{key}={value}" for key, value in item["source_buckets"].items() if value)
        print(f"- {item['venue_name']} ({item['city']}): {item['issue']} [{buckets or 'no sources'}]")
        for source in item["sources"][:4]:
            print(f"  - {source['bucket']}: {source['label']} ({source['health']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
