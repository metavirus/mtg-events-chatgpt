#!/usr/bin/env python3
"""Bounded social-surface surveyor.

This is the practical daily-lane wrapper for Instagram/Facebook-style surfaces:

1. pick known source routes from Supabase;
2. probe each profile sequentially with the persisted auth profile;
3. record a surface disposition;
4. optionally ingest one MTG-looking media artifact as evidence.

It intentionally does not create Events, Signals, proposals, exports, run notes,
or ledger edits. Event-like artifacts should be promoted later through the
central event observation/promoter path when the facts are concrete enough.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from supabase_typed_rpc import psql_rows_or_raise, resolve_database_url, run_psql


ROOT = Path(__file__).resolve().parents[1]
BLESSED_PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
PROBE_SCRIPT = ROOT / "scripts" / "probe_social_surface.ps1"
SURFACE_SCRIPT = ROOT / "scripts" / "record_surface_check.py"
ARTIFACT_SCRIPT = ROOT / "scripts" / "ingest_social_probe_artifact.py"

MTG_TERMS = {
    "magic",
    "mtg",
    "commander",
    "edh",
    "draft",
    "sealed",
    "prerelease",
    "standard",
    "modern",
    "pauper",
    "fnm",
    "hobbit",
    "avatar",
    "strixhaven",
}
NON_MTG_GAME_TERMS = {
    "lorcana",
    "disney",
    "pokemon",
    "one piece",
    "yugioh",
    "riftbound",
    "gundam",
}
EVENTISH_TERMS = {
    "today",
    "tomorrow",
    "tournament",
    "event",
    "sign up",
    "signup",
    "capacity",
    "players",
    "winner",
    "winners",
    "entry",
    "free",
    "$",
}
STRONG_EVENT_TERMS = {
    "commander",
    "draft",
    "sealed",
    "prerelease",
    "standard",
    "modern",
    "pauper",
    "fnm",
    "tournament",
    "event",
    "entry",
    "players",
    "capacity",
}


@dataclass(frozen=True)
class SocialSource:
    venue_id: str
    venue_name: str
    source_id: str
    url: str


def normalize_social_profile_url(platform: str, url: str) -> str:
    """Return a profile URL when the stored route is a common post/reel URL."""

    parsed = urlparse(url)
    parts = [part for part in parsed.path.split("/") if part]
    if not parts:
        return url
    if platform == "facebook":
        if parts[0] in {"posts", "photos", "videos", "reel", "reels", "events"}:
            return url
        if len(parts) >= 2 and parts[1] in {"posts", "photos", "videos", "reels", "events"}:
            return f"https://www.facebook.com/{parts[0]}"
        return url
    if parts[0] in {"p", "reel", "tv", "stories"}:
        return url
    username = parts[0]
    return f"https://www.instagram.com/{username}/"


def blessed_python() -> str:
    return str(BLESSED_PYTHON if BLESSED_PYTHON.exists() else Path(sys.executable))


def run_command(command: list[str], *, timeout: int = 120) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )


def query_sources(database_url: str, *, platform: str, limit: int, include_ids: list[str]) -> list[SocialSource]:
    id_filter = ""
    if include_ids:
        quoted = ",".join("'" + value.replace("'", "''") + "'" for value in include_ids)
        id_filter = f"and v.id in ({quoted})"
    sql = f"""
select distinct on (v.id)
  v.id as venue_id,
  v.name as venue_name,
  s.id as source_id,
  s.url
from public.sources s
join public.entity_sources es on es.source_id = s.id
join public.venues v on v.id = es.entity_id and es.entity_type = 'venue'
left join public.entity_surface_selection_state ess
  on ess.entity_type = 'venue'
  and ess.entity_id = v.id
  and ess.surface_type = '{platform}'
where lower(coalesce(s.url,'')) like '%instagram%'
  and coalesce(s.url,'') <> ''
  and (
    ess.entity_id is null
    or (
      ess.terminal_outcome is null
      and (
        ess.next_eligible_check_at is null
        or ess.next_eligible_check_at <= now()
      )
    )
  )
  {id_filter}
order by v.id, coalesce(s.last_checked, '1900-01-01'::timestamptz) asc, s.id
limit {int(limit)};
"""
    if platform == "facebook":
        sql = sql.replace("%instagram%", "%facebook%")
    rows = psql_rows_or_raise(run_psql(sql, database_url))
    return [
        SocialSource(
            venue_id=row["venue_id"],
            venue_name=row["venue_name"],
            source_id=row["source_id"],
            url=row["url"],
        )
        for row in rows
    ]


def load_probe_path_from_output(output: str) -> Path | None:
    try:
        payload = json.loads(output)
    except json.JSONDecodeError:
        start = output.find("{")
        end = output.rfind("}")
        if start < 0 or end <= start:
            return None
        payload = json.loads(output[start : end + 1])
    path = payload.get("outputPath")
    return Path(path) if path else None


def probe_source(source: SocialSource, *, platform: str, max_links: int, max_scrolls: int) -> tuple[Path | None, dict[str, Any] | None, str | None]:
    command = [
        "powershell",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        str(PROBE_SCRIPT),
        "-Platform",
        platform,
        "-ProfileUrl",
        normalize_social_profile_url(platform, source.url),
        "-MaxLinks",
        str(max_links),
        "-MaxScrolls",
        str(max_scrolls),
    ]
    result = run_command(command, timeout=150)
    output = "\n".join(part for part in (result.stdout, result.stderr) if part).strip()
    if result.returncode != 0:
        return None, None, output[:500]
    probe_path = load_probe_path_from_output(output)
    if not probe_path or not probe_path.exists():
        return None, None, "probe completed but did not produce a readable outputPath"
    return probe_path, json.loads(probe_path.read_text(encoding="utf-8")), None


def candidate_text(candidate: dict[str, Any]) -> str:
    return " ".join(
        str(candidate.get(key) or "") for key in ("alt", "nearbyText", "text", "link")
    ).lower()


def choose_artifact_candidate(probe: dict[str, Any]) -> tuple[int | None, str]:
    candidates = probe.get("visibleSlice", {}).get("mediaCandidates") or []
    best_index: int | None = None
    best_score = 0
    best_reason = "no media candidate"
    for index, candidate in enumerate(candidates):
        text = candidate_text(candidate)
        if any(term in text for term in NON_MTG_GAME_TERMS) and not any(
            term in text for term in ("magic", "mtg", "commander", "fnm", "standard", "modern", "pauper", "hobbit")
        ):
            continue
        mtg_score = sum(1 for term in MTG_TERMS if term in text)
        event_score = sum(1 for term in EVENTISH_TERMS if term in text)
        strong_event_score = sum(1 for term in STRONG_EVENT_TERMS if term in text)
        if not mtg_score:
            continue
        if not strong_event_score:
            continue
        score = (mtg_score * 10) + (event_score * 2) + (strong_event_score * 5)
        if score > best_score:
            best_index = index
            best_score = score
            best_reason = (
                f"mtg_terms={mtg_score}, eventish_terms={event_score}, "
                f"strong_event_terms={strong_event_score}"
            )
    if best_score <= 0:
        return None, best_reason
    return best_index, best_reason


def summarize_probe(probe: dict[str, Any], artifact_reason: str, *, platform: str) -> tuple[str, str, bool, str]:
    classification = probe.get("classification") or {}
    surface_status = probe.get("surfaceStatus") or "unknown"
    matched_mtg = classification.get("matchedMtgTerms") or []
    matched_ops = classification.get("matchedOperationalTerms") or []
    readable_statuses = {"candidate_posts_visible", "candidate_media_visible"}
    if surface_status not in readable_statuses:
        return "route_found_content_not_inspected", "Profile route did not expose a clean bounded post slice.", False, "low"
    has_artifact = not artifact_reason.startswith("no ")
    platform_label = platform.title()
    if matched_mtg and matched_ops and has_artifact:
        return (
            "inspected_current",
            f"Readable {platform_label} profile with MTG and operational/event-adjacent terms; artifact candidate {artifact_reason}.",
            True,
            "medium",
        )
    if matched_mtg and has_artifact:
        return (
            "inspected_current",
            f"Readable {platform_label} profile with MTG-relevant terms; artifact candidate {artifact_reason}.",
            True,
            "low",
        )
    if matched_mtg:
        return (
            "inspected_thin",
            f"Readable {platform_label} profile had MTG-adjacent text, but no strong event-like media candidate in the bounded slice.",
            False,
            "low",
        )
    return "not_material", f"Readable {platform_label} profile, but bounded slice did not show MTG-relevant content.", False, "low"


def run_surface_record(
    source: SocialSource,
    *,
    platform: str,
    disposition: str,
    summary: str,
    useful: bool,
    materiality: str,
    fingerprint: str,
    live: bool,
    reopen_trigger: str | None,
) -> int:
    command = [
        blessed_python(),
        str(SURFACE_SCRIPT),
        "--idempotency-key",
        f"social-survey-{platform}-{source.venue_id}-{fingerprint}",
        "--entity-type",
        "venue",
        "--entity-id",
        source.venue_id,
        "--surface-type",
        platform,
        "--disposition",
        disposition,
        "--source-id",
        source.source_id,
        "--summary",
        summary,
        "--materiality",
        materiality,
        "--monitoring-mode",
        "weekly",
        "--content-fingerprint",
        fingerprint,
    ]
    if useful:
        command.append("--useful")
    if reopen_trigger:
        command.extend(["--reopen-trigger", reopen_trigger])
    if live:
        command.extend(["--live", "--execute"])
    result = run_command(command, timeout=120)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    return result.returncode


def run_artifact_ingest(
    source: SocialSource,
    *,
    platform: str,
    probe_path: Path,
    index: int,
    summary: str,
    materiality: str,
    fingerprint: str,
    live: bool,
) -> int:
    command = [
        blessed_python(),
        str(ARTIFACT_SCRIPT),
        "--probe-json",
        str(probe_path),
        "--index",
        str(index),
        "--idempotency-key",
        f"social-survey-artifact-{platform}-{source.venue_id}-{fingerprint}",
        "--source-id",
        source.source_id,
        "--target-type",
        "venue",
        "--target-id",
        source.venue_id,
        "--relationship",
        "social_evidence",
        "--summary",
        summary,
        "--analysis-status",
        "partial" if materiality == "low" else "analyzed",
        "--confidence",
        "medium" if materiality != "low" else "low",
    ]
    if live:
        command.append("--live")
    result = run_command(command, timeout=180)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    return result.returncode


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--platform", choices=["instagram", "facebook"], default="instagram")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--venue-id", action="append", default=[], help="Limit to one or more specific venue IDs.")
    parser.add_argument("--max-links", type=int, default=12)
    parser.add_argument("--max-scrolls", type=int, default=2)
    parser.add_argument("--live", action="store_true", help="Write surface checks/artifacts. Default is dry-run.")
    parser.add_argument(
        "--reopen-trigger",
        choices=["access_changed", "new_lead", "user_request"],
        help="Use only for an explicit bounded recheck of a currently suppressed surface.",
    )
    parser.add_argument("--database-url")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    started = time.perf_counter()
    database_url = resolve_database_url(args.database_url)
    if not database_url:
        raise SystemExit("SUPABASE_DB_URL or .codex-secrets/supabase-db-url.txt is required")

    sources = query_sources(database_url, platform=args.platform, limit=args.limit, include_ids=args.venue_id)
    if not sources:
        raise SystemExit(f"No {args.platform} sources matched the requested scope")

    print(f"Social surveyor mode: {'LIVE' if args.live else 'DRY RUN'}")
    print(f"{args.platform.title()} sources: {len(sources)}")
    results: list[dict[str, Any]] = []
    failures = 0

    for ordinal, source in enumerate(sources, start=1):
        print(f"\n[{ordinal}/{len(sources)}] {source.venue_name} ({source.venue_id})")
        probe_path, probe, error = probe_source(
            source,
            platform=args.platform,
            max_links=args.max_links,
            max_scrolls=args.max_scrolls,
        )
        fingerprint = str(int(time.time()))
        if error or not probe_path or not probe:
            summary = f"{args.platform.title()} probe failed or was blocked: {error or 'unknown failure'}"
            code = run_surface_record(
                source,
                platform=args.platform,
                disposition="route_found_content_not_inspected",
                summary=summary[:900],
                useful=False,
                materiality="low",
                fingerprint=fingerprint,
                live=args.live,
                reopen_trigger=args.reopen_trigger,
            )
            failures += 1 if code else 0
            results.append({"venue": source.venue_name, "status": "probe_failed", "error": error})
            continue

        artifact_index, artifact_reason = choose_artifact_candidate(probe)
        disposition, summary, useful, materiality = summarize_probe(probe, artifact_reason, platform=args.platform)
        fingerprint = Path(probe_path).stem.replace(f"{args.platform}-", "")
        surface_code = run_surface_record(
            source,
            platform=args.platform,
            disposition=disposition,
            summary=summary,
            useful=useful,
            materiality=materiality,
            fingerprint=fingerprint,
            live=args.live,
            reopen_trigger=args.reopen_trigger,
        )
        failures += 1 if surface_code else 0

        artifact_code = None
        if surface_code == 0 and artifact_index is not None and useful:
            artifact_code = run_artifact_ingest(
                source,
                platform=args.platform,
                probe_path=probe_path,
                index=artifact_index,
                summary=f"{source.venue_name} {args.platform.title()} artifact retained from bounded survey: {summary}",
                materiality=materiality,
                fingerprint=fingerprint,
                live=args.live,
            )
            failures += 1 if artifact_code else 0

        classification = probe.get("classification") or {}
        results.append(
            {
                "venue": source.venue_name,
                "venue_id": source.venue_id,
                "surface_status": probe.get("surfaceStatus"),
                "disposition": disposition,
                "materiality": materiality,
                "matched_mtg_terms": classification.get("matchedMtgTerms") or [],
                "matched_operational_terms": classification.get("matchedOperationalTerms") or [],
                "artifact_index": artifact_index,
                "artifact_ingest": "skipped" if artifact_code is None else ("ok" if artifact_code == 0 else "failed"),
            }
        )

    print("\nSocial surveyor summary")
    print(
        json.dumps(
            {
                "status": "ok" if failures == 0 else "review",
                "live": bool(args.live),
                "elapsedSeconds": round(time.perf_counter() - started, 1),
                "results": results,
            },
            indent=2,
        )
    )
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
