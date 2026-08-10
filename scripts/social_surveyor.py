#!/usr/bin/env python3
"""Bounded social-surface surveyor.

This is the practical daily-lane wrapper for Instagram/Facebook-style surfaces:

1. pick known source routes from Supabase;
2. probe each profile sequentially with the persisted auth profile;
3. record a surface disposition;
4. optionally ingest one MTG-looking media artifact as evidence.
5. create an app-visible Signal for strong social findings.

It intentionally does not create proposals, exports, run notes, or ledger edits.
It also does not fabricate Events from fuzzy social media text. Strong social
findings become Signals; structured Events still come from the canonical event
promoter paths when date/time/title facts are concrete enough.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from supabase_typed_rpc import psql_rows_or_raise, resolve_database_url, run_psql, sql_literal


ROOT = Path(__file__).resolve().parents[1]
BLESSED_PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
PROBE_SCRIPT = ROOT / "scripts" / "social_surface_probe.mjs"
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
URGENT_OPERATIONAL_TERMS = {
    "closed",
    "closure",
    "cancel",
    "cancelled",
    "canceled",
    "postponed",
    "delayed",
    "no events",
    "hours",
    "holiday hours",
    "tomorrow's hours",
}
PROMO_SIGNAL_TERMS = {
    "raffle",
    "giveaway",
    "promo",
    "promotion",
    "prize",
    "free",
    "commander party",
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


def query_sources(
    database_url: str,
    *,
    platform: str,
    limit: int,
    include_ids: list[str],
    include_suppressed: bool,
) -> list[SocialSource]:
    id_filter = ""
    if include_ids:
        quoted = ",".join("'" + value.replace("'", "''") + "'" for value in include_ids)
        id_filter = f"and v.id in ({quoted})"
    eligibility_filter = ""
    if not include_suppressed:
        eligibility_filter = """
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
"""
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
  {eligibility_filter}
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
        "node",
        str(PROBE_SCRIPT),
        "--platform",
        platform,
        "--url",
        normalize_social_profile_url(platform, source.url),
        "--max-links",
        str(max_links),
        "--max-scrolls",
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


def stable_probe_fingerprint(platform: str, source: SocialSource, probe: dict[str, Any]) -> str:
    """Content-derived fingerprint for idempotent social checks."""

    visible = probe.get("visibleSlice") or {}
    classification = probe.get("classification") or {}
    body = str(visible.get("bodyTextSample") or "")
    body = re.sub(r"Scan the QR code.*?(?:Log In|Create new account|$)", "", body, flags=re.I | re.S)
    body = re.sub(r"\b[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}\b", "", body)
    body = re.sub(r"\s+", " ", body).strip()[:2500]

    links = []
    for item in visible.get("candidateLinks") or []:
        url = str(item.get("url") or "").split("?", 1)[0]
        text = re.sub(r"\s+", " ", str(item.get("text") or "")).strip()
        links.append({"url": url, "text": text})

    media = []
    for item in visible.get("mediaCandidates") or []:
        src = str(item.get("src") or "").split("?", 1)[0]
        link = str(item.get("link") or "").split("?", 1)[0]
        alt = re.sub(r"\s+", " ", str(item.get("alt") or "")).strip()
        nearby = re.sub(r"\s+", " ", str(item.get("nearbyText") or "")).strip()[:300]
        media.append({"src": src, "link": link, "alt": alt, "nearby": nearby})

    payload = {
        "platform": platform,
        "source_id": source.source_id,
        "status": probe.get("surfaceStatus"),
        "terms": classification,
        "body": body,
        "links": links[:12],
        "media": media[:12],
    }
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=True).encode("utf-8")).hexdigest()
    return digest[:24]


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


def compact_probe_text(probe: dict[str, Any], artifact_index: int | None) -> str:
    visible = probe.get("visibleSlice") or {}
    pieces: list[str] = [str(visible.get("bodyTextSample") or "")]
    links = visible.get("candidateLinks") or []
    for item in links[:6]:
        pieces.append(str(item.get("text") or ""))
    media = visible.get("mediaCandidates") or []
    if artifact_index is not None and 0 <= artifact_index < len(media):
        item = media[artifact_index]
        pieces.append(str(item.get("alt") or ""))
        pieces.append(str(item.get("nearbyText") or ""))
    return re.sub(r"\s+", " ", " ".join(pieces)).strip()


def signal_from_probe(
    source: SocialSource,
    *,
    platform: str,
    probe: dict[str, Any],
    artifact_index: int | None,
    fingerprint: str,
    materiality: str,
) -> dict[str, str] | None:
    classification = probe.get("classification") or {}
    matched_mtg = set(classification.get("matchedMtgTerms") or [])
    matched_ops = set(classification.get("matchedOperationalTerms") or [])
    text = compact_probe_text(probe, artifact_index)
    text_lc = text.lower()
    has_mtg = bool(matched_mtg) or any(term in text_lc for term in MTG_TERMS)
    if not has_mtg:
        return None

    has_urgent_ops = bool(matched_ops) or any(term in text_lc for term in URGENT_OPERATIONAL_TERMS)
    has_event = any(term in text_lc for term in STRONG_EVENT_TERMS)
    has_promo = any(term in text_lc for term in PROMO_SIGNAL_TERMS)
    if not (has_urgent_ops or has_event or has_promo):
        return None

    platform_label = platform.title()
    excerpt = text[:420].strip()
    if has_urgent_ops:
        category = "operational"
        priority = "high"
        promotion_target = "personal_reminder"
        summary = f"{source.venue_name} may have a {platform_label} operational update."
        action = "Open the source before planning around this store."
    elif has_promo:
        category = "event_opportunity"
        priority = "normal"
        promotion_target = "update"
        summary = f"{source.venue_name} may have a {platform_label} promo or event opportunity."
        action = "Open the source/artifact and promote if the date, time, and event title are clear."
    else:
        category = "event_opportunity"
        priority = "normal" if materiality == "low" else "high"
        promotion_target = "event_proposal"
        summary = f"{source.venue_name} has MTG event-like {platform_label} activity."
        action = "Open the source/artifact and promote if the date, time, and event title are clear."

    details = f"{excerpt}\n\nDetected by bounded {platform} survey. Source was not treated as secondary to WPN."
    signal_key = f"social:{platform}:{source.source_id}:{category}"
    return {
        "id": signal_key,
        "dedupe_key": signal_key,
        "category": category,
        "priority": priority,
        "summary": summary,
        "details": details[:1800],
        "confidence": "medium" if materiality != "low" else "low",
        "suggested_action": action,
        "promotion_target": promotion_target,
    }


def run_signal_record(
    database_url: str,
    source: SocialSource,
    signal: dict[str, str],
    *,
    live: bool,
) -> tuple[int, str]:
    sql = f"""
insert into public.signals (
  id, category, priority, status, source_id, captured_at, observed_at,
  related_entity_type, related_entity_id, summary, details, evidence_url,
  confidence, suggested_action, promotion_target, dedupe_key
) values (
  {sql_literal(signal['id'])},
  {sql_literal(signal['category'])},
  {sql_literal(signal['priority'])},
  'new',
  {sql_literal(source.source_id)},
  timezone('utc', now()),
  timezone('utc', now()),
  'venue',
  {sql_literal(source.venue_id)},
  {sql_literal(signal['summary'])},
  {sql_literal(signal['details'])},
  {sql_literal(source.url)},
  {sql_literal(signal['confidence'])},
  {sql_literal(signal['suggested_action'])},
  {sql_literal(signal['promotion_target'])},
  {sql_literal(signal['dedupe_key'])}
)
on conflict (dedupe_key) where dedupe_key is not null do update
set updated_at = timezone('utc', now()),
    source_id = excluded.source_id,
    evidence_url = excluded.evidence_url,
    details = excluded.details,
    suggested_action = excluded.suggested_action
returning id, category, priority, status;
"""
    if not live:
        print(
            json.dumps(
                {
                    "signal": {
                        "dryRun": True,
                        "id": signal["id"],
                        "category": signal["category"],
                        "priority": signal["priority"],
                        "summary": signal["summary"],
                    }
                },
                indent=2,
            )
        )
        return 0, "dry_run"
    result = run_psql(sql, database_url)
    if result.returncode != 0:
        print(result.stderr.strip(), file=sys.stderr)
        return result.returncode, "failed"
    rows = psql_rows_or_raise(result)
    print(json.dumps({"signal": rows[0] if rows else {"status": "unknown"}}, indent=2))
    return 0, "ok"


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
        "--include-suppressed",
        action="store_true",
        help="Allow an explicit pilot to inspect sources that are not currently due.",
    )
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

    include_suppressed = bool(args.include_suppressed or args.venue_id or args.reopen_trigger)
    sources = query_sources(
        database_url,
        platform=args.platform,
        limit=args.limit,
        include_ids=args.venue_id,
        include_suppressed=include_suppressed,
    )
    if not sources:
        print("\nSocial surveyor summary")
        print(
            json.dumps(
                {
                    "status": "skipped",
                    "reason": f"No {args.platform} sources matched the requested scope",
                    "live": bool(args.live),
                    "elapsedSeconds": round(time.perf_counter() - started, 1),
                    "results": [],
                },
                indent=2,
            )
        )
        return 0

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
        fingerprint = stable_probe_fingerprint(args.platform, source, probe)
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

        signal_status = "skipped"
        signal = signal_from_probe(
            source,
            platform=args.platform,
            probe=probe,
            artifact_index=artifact_index,
            fingerprint=fingerprint,
            materiality=materiality,
        )
        if surface_code == 0 and signal is not None:
            signal_code, signal_status = run_signal_record(
                database_url,
                source,
                signal,
                live=args.live,
            )
            failures += 1 if signal_code else 0

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
                "signal": signal_status,
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
