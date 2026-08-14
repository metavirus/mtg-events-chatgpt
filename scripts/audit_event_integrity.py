#!/usr/bin/env python3
"""Read-only integrity audit for canonical event ingest results.

This is the lightweight post-ingest checkpoint. It intentionally does not
create proposals, exports, run notes, or durable artifacts. It answers the
question: "Did the central promoter leave weird orphans, duplicate slots, or
broken evidence links behind?"
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from refresh_wpn_cache import query_rows  # noqa: E402


@dataclass(frozen=True)
class CountCheck:
    name: str
    severity: str
    sql: str
    expected: int | None = 0
    note: str = ""


CRITICAL_CHECKS = [
    CountCheck(
        "occurrences_without_series",
        "critical",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        left join public.event_series es on es.id = eo.series_id
        where es.id is null;
        """,
    ),
    CountCheck(
        "series_without_owner",
        "critical",
        """
        select count(*)::int as count
        from public.event_series es
        left join public.venues v on v.id = es.venue_id
        left join public.communities c on c.id = es.community_id
        where (es.venue_id is null and es.community_id is null)
           or (es.venue_id is not null and v.id is null)
           or (es.community_id is not null and c.id is null);
        """,
    ),
    CountCheck(
        "future_community_events_without_source_location",
        "critical",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        where es.community_id is not null
          and eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and not exists (
            select 1
            from public.event_source_bindings b
            join public.event_observations o on o.id = b.observation_id
            where b.occurrence_id = eo.id
              and nullif(btrim(o.physical_location_text), '') is not null
          );
        """,
    ),
    CountCheck(
        "community_event_updates_misattributed_as_venues",
        "critical",
        """
        select count(*)::int as count
        from public.research_changes rc
        where rc.change_type = 'event_ingest_delta'
          and rc.entity_type = 'venue'
          and exists (
            select 1
            from public.event_observations o
            where o.organizer_type = 'community'
              and o.organizer_id is not null
              and rc.detected_at between o.created_at - interval '5 minutes'
                                     and o.created_at + interval '5 minutes'
              and rc.details ilike '%' || o.title || '%'
          );
        """,
    ),
    CountCheck(
        "event_sources_with_broken_event_target",
        "critical",
        """
        select count(*)::int as count
        from public.event_sources src
        left join public.event_series es on es.id = src.series_id
        left join public.event_occurrences eo on eo.id = src.occurrence_id
        where (src.series_id is not null and es.id is null)
           or (src.occurrence_id is not null and eo.id is null);
        """,
    ),
    CountCheck(
        "event_sources_with_broken_source",
        "critical",
        """
        select count(*)::int as count
        from public.event_sources esrc
        left join public.sources s on s.id = esrc.source_id
        where s.id is null;
        """,
    ),
    CountCheck(
        "event_bindings_without_observation",
        "critical",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        left join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        where o.id is null;
        """,
    ),
    CountCheck(
        "event_bindings_without_canonical_target",
        "critical",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        left join public.event_series es on es.id = b.series_id
        left join public.event_occurrences eo on eo.id = b.occurrence_id
        where (b.series_id is not null and es.id is null)
           or (b.occurrence_id is not null and eo.id is null)
           or (b.series_id is null and b.occurrence_id is null);
        """,
    ),
    CountCheck(
        "bound_observations_without_binding",
        "critical",
        """
        select count(*)::int as count
        from public.event_observations o
        left join public.event_source_bindings b
          on b.source_family = o.source_family
         and b.upstream_event_id = o.upstream_event_id
        where o.reconcile_state = 'bound'
          and b.id is null;
        """,
    ),
    CountCheck(
        "broken_source_artifact_links",
        "critical",
        """
        select count(*)::int as count
        from public.source_artifact_links sal
        left join public.source_artifacts sa on sa.id = sal.artifact_id
        where sa.id is null
           or not public.source_artifact_target_exists(sal.target_type, sal.target_id);
        """,
    ),
    CountCheck(
        "duplicate_future_occurrences_same_series_slot",
        "critical",
        """
        select count(*)::int as count
        from (
          select eo.series_id, eo.occurrence_date, eo.start_time
          from public.event_occurrences eo
          where eo.occurrence_date >= current_date
            and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          group by eo.series_id, eo.occurrence_date, eo.start_time
          having count(*) > 1
        ) duplicates;
        """,
    ),
    CountCheck(
        "duplicate_future_occurrences_same_venue_title_slot",
        "critical",
        """
        select count(*)::int as count
        from (
          select
            es.venue_id,
            eo.occurrence_date,
            eo.start_time,
            public.normalize_event_identity_text(es.title)
          from public.event_occurrences eo
          join public.event_series es on es.id = eo.series_id
          where eo.occurrence_date >= current_date
            and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          group by
            es.venue_id,
            eo.occurrence_date,
            eo.start_time,
            public.normalize_event_identity_text(es.title)
          having count(*) > 1
        ) duplicates;
        """,
    ),
    CountCheck(
        "future_active_events_without_source_trail",
        "critical",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and not exists (
            select 1 from public.event_sources src where src.occurrence_id = eo.id
          )
          and not exists (
            select 1 from public.event_sources src where src.series_id = es.id
          );
        """,
    ),
    CountCheck(
        "bound_wpn_observations_without_event_source_link",
        "critical",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        left join public.event_sources src
          on src.source_id = o.source_id
         and (src.occurrence_id = b.occurrence_id or src.series_id = b.series_id)
        where b.source_family = 'wpn'
          and o.source_id is not null
          and src.id is null;
        """,
    ),
    CountCheck(
        "bound_wpn_observations_without_exact_wpn_url",
        "critical",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        where b.source_family = 'wpn'
          and (o.source_url is null or o.source_url not like 'https://locator.wizards.com/event/%');
        """,
    ),
    CountCheck(
        "bound_wpn_source_date_time_mismatches",
        "critical",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        join public.event_occurrences eo on eo.id = b.occurrence_id
        where b.source_family = 'wpn'
          and (eo.occurrence_date is distinct from o.occurrence_date
            or eo.start_time is distinct from o.start_time);
        """,
    ),
    CountCheck(
        "bound_wpn_source_venue_mismatches",
        "critical",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        join public.event_series es on es.id = b.series_id
        where b.source_family = 'wpn'
          and es.venue_id is distinct from o.venue_id;
        """,
    ),
    CountCheck(
        "eligible_observations_with_unknown_venue",
        "critical",
        """
        select count(*)::int as count
        from public.event_observations
        where source_family = 'wpn'
          and reconcile_state <> 'held'
          and venue_id is null;
        """,
    ),
]


REVIEW_CHECKS = [
    CountCheck(
        "future_date_only_events",
        "review",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and eo.start_time is null;
        """,
        expected=None,
        note="Allowed when the source only proves the date.",
    ),
    CountCheck(
        "future_occurrences_inheriting_series_source_only",
        "review",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and not exists (
            select 1 from public.event_sources src where src.occurrence_id = eo.id
          )
          and exists (
            select 1 from public.event_sources src where src.series_id = es.id
          );
        """,
        expected=None,
        note="Allowed; the app merges occurrence-level and series-level evidence.",
    ),
    CountCheck(
        "future_no_proxy_events",
        "info",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        left join public.event_source_bindings b on b.occurrence_id = eo.id
        left join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and o.proxy_policy = 'prohibited';
        """,
        expected=None,
        note="Canonical event truth remains; presentation may hide/deprioritize.",
    ),
    CountCheck(
        "future_events_at_deprioritized_or_low_fit_venues",
        "info",
        """
        select count(*)::int as count
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        left join public.entity_preferences ep
          on ep.entity_type = 'venue'
         and ep.entity_id = es.venue_id
        left join public.evaluations ev
          on ev.entity_type = 'venue'
         and ev.entity_id = es.venue_id
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and (
            ep.visibility_preference in ('deprioritize', 'hide')
            or ev.fit_grade in ('D+', 'D', 'D-', 'F')
          );
        """,
        expected=None,
        note="Expected to exist; should be presentation-hidden/ranked down.",
    ),
    CountCheck(
        "legacy_wpn_events_with_store_level_url_only",
        "review",
        """
        with legacy_store_url_events as (
          select eo.id
          from public.event_occurrences eo
          join public.event_series es on es.id = eo.series_id
          where eo.occurrence_date >= current_date
            and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
            and exists (
              select 1
              from public.event_sources src
              join public.sources s on s.id = src.source_id
              where (src.occurrence_id = eo.id or src.series_id = es.id)
                and s.source_type = 'wpn'
            )
            and not exists (
              select 1
              from public.event_sources src
              join public.sources s on s.id = src.source_id
              where (src.occurrence_id = eo.id or src.series_id = es.id)
                and coalesce(src.source_url, s.url) like 'https://locator.wizards.com/event/%'
            )
        )
        select count(*)::int as count from legacy_store_url_events;
        """,
        expected=None,
        note="Backfill only when an exact current observation/source match exists.",
    ),
    CountCheck(
        "bound_observation_title_key_differences",
        "info",
        """
        select count(*)::int as count
        from public.event_source_bindings b
        join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        join public.event_occurrences eo on eo.id = b.occurrence_id
        join public.event_series es on es.id = eo.series_id
        where o.normalized_title_key is not null
          and public.normalize_event_identity_text(es.title)
              is distinct from o.normalized_title_key;
        """,
        expected=None,
        note="Usually benign normalizer/presentation differences; sample before changing.",
    ),
]


SAMPLES = {
    "future_date_only_events": """
        select eo.id, es.title, v.name as venue, eo.occurrence_date, eo.evidence_state
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        left join public.venues v on v.id = es.venue_id
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and eo.start_time is null
        order by eo.occurrence_date, es.title
        limit {limit};
    """,
    "legacy_wpn_events_with_store_level_url_only": """
        select eo.id, es.title, v.name as venue, eo.occurrence_date, eo.start_time
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        left join public.venues v on v.id = es.venue_id
        where eo.occurrence_date >= current_date
          and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
          and exists (
            select 1
            from public.event_sources src
            join public.sources s on s.id = src.source_id
            where (src.occurrence_id = eo.id or src.series_id = es.id)
              and s.source_type = 'wpn'
          )
          and not exists (
            select 1
            from public.event_sources src
            join public.sources s on s.id = src.source_id
            where (src.occurrence_id = eo.id or src.series_id = es.id)
              and coalesce(src.source_url, s.url) like 'https://locator.wizards.com/event/%'
          )
        order by eo.occurrence_date, eo.start_time, es.title
        limit {limit};
    """,
    "legacy_wpn_exact_backfill_matches": """
        with legacy_store_url_events as (
          select eo.id, es.id as series_id, es.venue_id, es.title, eo.occurrence_date, eo.start_time
          from public.event_occurrences eo
          join public.event_series es on es.id = eo.series_id
          where eo.occurrence_date >= current_date
            and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
            and exists (
              select 1
              from public.event_sources src
              join public.sources s on s.id = src.source_id
              where (src.occurrence_id = eo.id or src.series_id = es.id)
                and s.source_type = 'wpn'
            )
            and not exists (
              select 1
              from public.event_sources src
              join public.sources s on s.id = src.source_id
              where (src.occurrence_id = eo.id or src.series_id = es.id)
                and coalesce(src.source_url, s.url) like 'https://locator.wizards.com/event/%'
            )
        )
        select
          l.id as occurrence_id,
          l.title as canonical_title,
          o.upstream_event_id,
          o.source_url,
          o.title as observation_title
        from legacy_store_url_events l
        join public.event_observations o
          on o.source_family = 'wpn'
         and o.venue_id = l.venue_id
         and o.occurrence_date = l.occurrence_date
         and o.start_time = l.start_time
         and o.normalized_title_key = public.normalize_event_identity_text(l.title)
         and o.source_url like 'https://locator.wizards.com/event/%'
        order by l.occurrence_date, l.start_time, l.title
        limit {limit};
    """,
    "bound_observation_title_key_differences": """
        select
          o.source_family,
          o.upstream_event_id,
          o.title as source_title,
          o.normalized_title_key,
          es.title as canonical_title,
          public.normalize_event_identity_text(es.title) as canonical_key,
          v.name as venue,
          eo.occurrence_date,
          eo.start_time
        from public.event_source_bindings b
        join public.event_observations o
          on o.source_family = b.source_family
         and o.upstream_event_id = b.upstream_event_id
        join public.event_occurrences eo on eo.id = b.occurrence_id
        join public.event_series es on es.id = eo.series_id
        left join public.venues v on v.id = es.venue_id
        where o.normalized_title_key is not null
          and public.normalize_event_identity_text(es.title)
              is distinct from o.normalized_title_key
        order by v.name, eo.occurrence_date, eo.start_time
        limit {limit};
    """,
}


def count_for(check: CountCheck) -> int:
    rows = query_rows(check.sql)
    if not rows:
        raise SystemExit(f"Audit check returned no row: {check.name}")
    return int(rows[0]["count"])


def print_rows(title: str, rows: list[dict]) -> None:
    if not rows:
        print(f"  {title}: none")
        return
    print(f"  {title}:")
    for row in rows:
        pieces = [f"{key}={value}" for key, value in row.items()]
        print("    - " + "; ".join(pieces))


def sample_rows(name: str, limit: int) -> list[dict]:
    sql = SAMPLES[name].format(limit=int(limit))
    return query_rows(sql)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=5, help="Sample rows per review bucket.")
    parser.add_argument(
        "--fail-on-critical",
        action="store_true",
        help="Exit non-zero when any critical check is non-zero.",
    )
    parser.add_argument(
        "--show-samples",
        action="store_true",
        help="Print compact samples for non-zero review buckets.",
    )
    args = parser.parse_args()

    print("Event integrity audit")
    print("=====================")

    critical_failures: list[tuple[str, int]] = []
    print("\nCritical checks")
    for check in CRITICAL_CHECKS:
        count = count_for(check)
        status = "PASS" if count == check.expected else "FAIL"
        if status == "FAIL":
            critical_failures.append((check.name, count))
        print(f"  {status:<4} {check.name}: {count}")

    print("\nReview / presentation-aware checks")
    review_counts: dict[str, int] = {}
    for check in REVIEW_CHECKS:
        count = count_for(check)
        review_counts[check.name] = count
        print(f"  {check.severity.upper():<8} {check.name}: {count}")
        if check.note:
            print(f"           {check.note}")

    if args.show_samples:
        print("\nSamples")
        for sample_name in SAMPLES:
            if sample_name in review_counts and review_counts[sample_name] == 0:
                continue
            rows = sample_rows(sample_name, args.limit)
            print_rows(sample_name, rows)

    if critical_failures:
        print("\nResult: FAIL")
        for name, count in critical_failures:
            print(f"  critical issue: {name} = {count}")
        return 1 if args.fail_on_critical else 0

    print("\nResult: PASS")
    print("  No critical event-integrity issues found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
