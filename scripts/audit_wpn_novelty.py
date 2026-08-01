#!/usr/bin/env python3
"""Read-only adversarial audit of apparent WPN novelty against canonical Events."""

from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from datetime import date
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from refresh_wpn_cache import normalized_title_key, query_rows  # noqa: E402


WEEKDAY_NUMBER = {
    "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
    "Thursday": 4, "Friday": 5, "Saturday": 6,
}


def minute(value) -> str | None:
    text = str(value or "").strip()
    return text[:5] if len(text) >= 5 else None


def load_state() -> dict:
    sql = """
select
  c.enriched_events,
  coalesce((select jsonb_agg(to_jsonb(s)) from public.event_series s), '[]'::jsonb) as series,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', o.id, 'series_id', o.series_id, 'venue_id', s.venue_id,
      'title', s.title, 'format', s.format, 'occurrence_date', o.occurrence_date,
      'start_time', o.start_time, 'occurrence_status', o.occurrence_status
    ))
    from public.event_occurrences o
    join public.event_series s on s.id = o.series_id
  ), '[]'::jsonb) as occurrences,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'url', src.url, 'source_id', src.id, 'series_id', es.series_id,
      'occurrence_id', es.occurrence_id
    ))
    from public.event_sources es
    join public.sources src on src.id = es.source_id
    where src.url is not null
  ), '[]'::jsonb) as bindings
from public.wpn_snapshot_cache c
where c.id = 'los-alamitos-25mi';
"""
    rows = query_rows(sql)
    if not rows:
        raise SystemExit("The canonical WPN cache row is missing.")
    return rows[0]


def load_git_event_ids(ref: str | None) -> set[str] | None:
    if not ref:
        return None
    result = subprocess.run(
        ["git", "show", f"{ref}:output/wizards/events-all.json"],
        cwd=ROOT, text=True, encoding="utf-8", capture_output=True, check=False,
    )
    if result.returncode != 0:
        raise SystemExit(f"Could not read WPN snapshot from git ref {ref}: {result.stderr.strip()}")
    return {str(item.get("id")) for item in json.loads(result.stdout) if item.get("id") is not None}


def classify_observations(state: dict, previous_event_ids: set[str] | None = None) -> list[dict]:
    series = state.get("series") or []
    occurrences = state.get("occurrences") or []
    binding_urls = {row.get("url") for row in (state.get("bindings") or []) if row.get("url")}

    exact_recurring = set()
    recurring_lanes = set()
    venue_titles = set()
    finite_series: list[dict] = []
    for row in series:
        venue = row.get("venue_id")
        title_key = normalized_title_key(row.get("title"))
        venue_titles.add((venue, title_key))
        recurrence = row.get("recurrence") or {}
        weekday = recurrence.get("dayOfWeek")
        start_time = minute(row.get("default_start_time") or recurrence.get("startTime"))
        if weekday is not None and start_time:
            exact_recurring.add((venue, title_key, int(weekday), start_time))
            recurring_lanes.add((venue, int(weekday), start_time))
        else:
            finite_series.append({
                "venue": venue,
                "title_key": title_key,
                "start": row.get("start_date"),
                "end": row.get("end_date"),
            })

    exact_occurrences = set()
    occurrence_slots = set()
    for row in occurrences:
        key = (
            row.get("venue_id"), str(row.get("occurrence_date")),
            minute(row.get("start_time")), normalized_title_key(row.get("title")),
        )
        exact_occurrences.add(key)
        occurrence_slots.add(key[:3])

    results = []
    for event in state.get("enriched_events") or []:
        if not event.get("promotionEligible"):
            continue
        venue = event.get("canonicalVenueId")
        title_key = event.get("normalizedTitleKey") or normalized_title_key(event.get("title"))
        event_date = event.get("localStartDate")
        start_time = minute(event.get("localStartTime"))
        weekday = WEEKDAY_NUMBER.get(event.get("localWeekday"))
        url = event.get("sourceEventUrl")
        exact_occurrence_key = (venue, event_date, start_time, title_key)
        recurring_key = (venue, title_key, weekday, start_time)
        lane_key = (venue, weekday, start_time)

        category = None
        if url in binding_urls:
            category = "existing_source_binding"
        elif exact_occurrence_key in exact_occurrences:
            category = "existing_exact_occurrence"
        elif recurring_key in exact_recurring:
            category = "existing_exact_recurring_lane"
        else:
            for candidate in finite_series:
                if candidate["venue"] != venue or candidate["title_key"] != title_key:
                    continue
                start = candidate["start"] or "0001-01-01"
                end = candidate["end"] or "9999-12-31"
                if event_date and start <= event_date <= end:
                    category = "existing_finite_series"
                    break
        if category is None and (venue, title_key) in venue_titles:
            category = "known_title_other_schedule"
        if category is None and (venue, event_date, start_time) in occurrence_slots:
            category = "same_slot_different_title"
        if category is None and lane_key in recurring_lanes:
            category = "same_lane_different_title"
        if category is None:
            category = "no_canonical_analogue"

        results.append({
            "category": category,
            "sourceEventId": event.get("sourceEventId"),
            "sourceSeriesHintKey": event.get("sourceSeriesHintKey"),
            "sourceTemplateHintKey": event.get("sourceTemplateHintKey"),
            "venueId": venue,
            "title": event.get("title"),
            "date": event_date,
            "time": start_time,
            "format": (event.get("normalizedFacts") or {}).get("formatName"),
            "url": url,
            "sourceArrival": (
                "unknown" if previous_event_ids is None
                else "present_in_previous_snapshot" if event.get("sourceEventId") in previous_event_ids
                else "new_since_previous_snapshot"
            ),
        })
    return results


def cluster_results(observations: list[dict]) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for item in observations:
        groups[item["sourceSeriesHintKey"]].append(item)
    clusters = []
    for key, items in groups.items():
        categories = Counter(item["category"] for item in items)
        clusters.append({
            "sourceSeriesHintKey": key,
            "venueId": items[0]["venueId"],
            "title": items[0]["title"],
            "format": items[0]["format"],
            "occurrenceCount": len(items),
            "firstDate": min(item["date"] for item in items),
            "lastDate": max(item["date"] for item in items),
            "categories": dict(sorted(categories.items())),
            "sourceArrivalCounts": dict(sorted(Counter(
                item["sourceArrival"] for item in items
            ).items())),
            "sourceEventIds": [item["sourceEventId"] for item in items],
            "urls": [item["url"] for item in items],
        })
    return sorted(clusters, key=lambda item: (item["venueId"], item["title"], item["firstDate"]))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample-limit", type=int, default=30)
    parser.add_argument(
        "--previous-git-ref",
        help="Optional git ref containing an older output/wizards/events-all.json snapshot.",
    )
    args = parser.parse_args()
    previous_event_ids = load_git_event_ids(args.previous_git_ref)
    observations = classify_observations(load_state(), previous_event_ids)
    clusters = cluster_results(observations)
    observation_counts = Counter(item["category"] for item in observations)
    arrival_observation_counts = Counter(item["sourceArrival"] for item in observations)
    arrival_category_observation_counts = Counter(
        (item["sourceArrival"], item["category"]) for item in observations
    )
    cluster_counts = Counter()
    for cluster in clusters:
        for category in cluster["categories"]:
            cluster_counts[category] += 1
    arrival_cluster_counts = Counter()
    arrival_category_cluster_counts = Counter()
    for cluster in clusters:
        states = set(cluster["sourceArrivalCounts"])
        label = next(iter(states)) if len(states) == 1 else "mixed_arrival"
        arrival_cluster_counts[label] += 1
        for category in cluster["categories"]:
            arrival_category_cluster_counts[(label, category)] += 1

    suspicious_categories = {
        "known_title_other_schedule", "same_slot_different_title",
        "same_lane_different_title", "no_canonical_analogue",
    }
    candidates = [
        cluster for cluster in clusters
        if suspicious_categories.intersection(cluster["categories"])
    ]
    new_no_analogue = [
        item for item in observations
        if item["sourceArrival"] == "new_since_previous_snapshot"
        and item["category"] == "no_canonical_analogue"
    ]
    family_groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for item in new_no_analogue:
        family_key = item.get("sourceTemplateHintKey") or (
            "title:" + normalized_title_key(item.get("title"))
        )
        family_groups[(item["venueId"], family_key)].append(item)
    print(json.dumps({
        "auditDate": date.today().isoformat(),
        "eligibleObservationCount": len(observations),
        "strictSeriesHintClusterCount": len(clusters),
        "observationCounts": dict(sorted(observation_counts.items())),
        "clusterCounts": dict(sorted(cluster_counts.items())),
        "previousGitRef": args.previous_git_ref,
        "sourceArrivalObservationCounts": dict(sorted(arrival_observation_counts.items())),
        "sourceArrivalClusterCounts": dict(sorted(arrival_cluster_counts.items())),
        "sourceArrivalByCanonicalObservationCategory": {
            f"{arrival}::{category}": count
            for (arrival, category), count in sorted(arrival_category_observation_counts.items())
        },
        "sourceArrivalByCanonicalClusterCategory": {
            f"{arrival}::{category}": count
            for (arrival, category), count in sorted(arrival_category_cluster_counts.items())
        },
        "apparentNoveltyClusterCount": len(candidates),
        "newNoAnalogueFamilyCompression": {
            "observationCount": len(new_no_analogue),
            "strictClusterCount": len({item["sourceSeriesHintKey"] for item in new_no_analogue}),
            "templateOrTitleFamilyCount": len(family_groups),
            "multiOccurrenceFamilyCount": sum(len(items) > 1 for items in family_groups.values()),
        },
        "apparentNoveltySamples": candidates[:args.sample_limit],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
