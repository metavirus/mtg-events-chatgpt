"""Ingest one media candidate from a bounded social-surface probe.

This is the second stage after ``probe_social_surface.ps1``:

1. choose one visible media candidate from an ignored probe JSON file;
2. cache/upload the image through the existing source-artifact path;
3. record conservative extracted facts from the candidate alt/nearby text.

It does not create events, Signals, venue assessments, proposals, exports, run
notes, or Git artifacts. Promotion remains a separate source-neutral event or
Signal decision.
"""

from __future__ import annotations

import argparse
import json
import re
import tempfile
from argparse import Namespace
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
import truststore

truststore.inject_into_ssl()

from source_artifact_ingest import (  # noqa: E402
    build_analysis_sql,
    build_ingest_sql,
    cache_artifact,
    detect_mime,
    execute_sql,
    image_dimensions,
    resolve_database_url,
    resolve_service_key,
    upload_artifact,
)
from supabase_typed_rpc import print_rpc_rows  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PROBE_DIR = ROOT / "work" / "social-probes"


def latest_probe(platform: str) -> Path:
    candidates = sorted(
        DEFAULT_PROBE_DIR.glob(f"{platform}-*.json"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    if not candidates:
        raise RuntimeError(f"No {platform} probe JSON found under {DEFAULT_PROBE_DIR}")
    return candidates[0]


def load_probe(path: Path) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise RuntimeError("Probe JSON must be an object")
    return payload


def candidate_text(candidate: dict) -> str:
    return " ".join(
        str(candidate.get(key) or "")
        for key in ("alt", "nearbyText", "link")
    ).strip()


def choose_candidate(probe: dict, index: int | None, require_mtg: bool) -> dict:
    candidates = probe.get("visibleSlice", {}).get("mediaCandidates") or []
    if not candidates:
        raise RuntimeError("Probe contains no media candidates")
    if index is not None:
        if index < 0 or index >= len(candidates):
            raise RuntimeError(f"--index {index} is outside 0..{len(candidates) - 1}")
        return candidates[index]

    mtg_pattern = re.compile(
        r"\b(magic|mtg|commander|edh|draft|sealed|prerelease|standard|modern|pauper|fnm|hobbit|avatar|strixhaven)\b",
        re.IGNORECASE,
    )
    for candidate in candidates:
        if mtg_pattern.search(candidate_text(candidate)):
            return candidate
    if require_mtg:
        raise RuntimeError("No MTG-looking media candidate found")
    return candidates[0]


def filename_from_url(url: str, fallback: str) -> str:
    parsed = urlparse(url)
    name = Path(parsed.path).name
    return name or fallback


def write_temp_candidate_file(candidate: dict, *, headers: dict[str, str]) -> Path:
    src = candidate.get("src")
    if not src:
        raise RuntimeError("Selected media candidate has no image src")
    response = requests.get(src, headers=headers, timeout=45)
    response.raise_for_status()
    suffix = Path(filename_from_url(src, "social-artifact.jpg")).suffix or ".jpg"
    handle = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        handle.write(response.content)
    finally:
        handle.close()
    return Path(handle.name)


def extract_basic_facts(candidate: dict, probe: dict) -> dict:
    text = candidate_text(candidate)
    dates = re.findall(
        r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?\b",
        text,
        flags=re.IGNORECASE,
    )
    times = re.findall(
        r"\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b",
        text,
        flags=re.IGNORECASE,
    )
    money = re.findall(r"\$\s*\d+(?:\.\d{2})?", text)
    return {
        "sourcePlatform": probe.get("platform"),
        "profileUrl": probe.get("targetUrl"),
        "postUrl": candidate.get("link") or None,
        "candidateAltText": candidate.get("alt") or "",
        "candidateNearbyText": candidate.get("nearbyText") or "",
        "detectedDates": sorted(set(dates)),
        "detectedTimes": sorted(set(times)),
        "detectedPrices": sorted(set(value.replace(" ", "") for value in money)),
        "imageWidthInProbe": candidate.get("width"),
        "imageHeightInProbe": candidate.get("height"),
    }


def build_ingest_args(
    args: argparse.Namespace,
    candidate: dict,
    probe: dict,
    temp_path: Path,
) -> Namespace:
    return Namespace(
        command="ingest",
        file=str(temp_path),
        url=None,
        live=args.live,
        dry_run=not args.live,
        database_url=args.database_url,
        service_key=args.service_key,
        idempotency_key=args.idempotency_key,
        source_id=args.source_id,
        platform=probe.get("platform") or args.platform,
        capture_method="download",
        target_type=args.target_type,
        target_id=args.target_id,
        relationship=args.relationship,
        origin_url=candidate.get("link") or probe.get("targetUrl"),
        external_artifact_id=candidate.get("link") or candidate.get("src"),
        published_at=args.published_at,
        captured_at=args.captured_at,
    )


def build_analysis_args(
    args: argparse.Namespace,
    artifact_id: str,
    candidate: dict,
    probe: dict,
) -> Namespace:
    facts = extract_basic_facts(candidate, probe)
    summary = args.summary or "Instagram media candidate retained as source evidence."
    return Namespace(
        command="analyze",
        live=args.live,
        dry_run=not args.live,
        database_url=args.database_url,
        idempotency_key=f"{args.idempotency_key}:analysis",
        artifact_id=artifact_id,
        status=args.analysis_status,
        extracted_text=candidate_text(candidate),
        text_file=None,
        facts_json=json.dumps(facts, ensure_ascii=False, separators=(",", ":")),
        facts_file=None,
        summary=summary,
        summary_file=None,
        confidence=args.confidence,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--platform", default="instagram", choices=["instagram", "facebook"])
    parser.add_argument("--probe-json", help="Defaults to latest work/social-probes/<platform>-*.json")
    parser.add_argument("--index", type=int, help="Zero-based media candidate index. Defaults to first MTG-looking candidate.")
    parser.add_argument("--allow-non-mtg", action="store_true")
    parser.add_argument("--idempotency-key", required=True)
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--target-type", required=True, choices=["venue", "community", "event_series", "event_occurrence", "signal", "research_change", "surface_check"])
    parser.add_argument("--target-id", required=True)
    parser.add_argument("--relationship", default="evidence")
    parser.add_argument("--published-at")
    parser.add_argument("--captured-at", default=datetime.now(timezone.utc).isoformat())
    parser.add_argument("--summary")
    parser.add_argument("--analysis-status", default="partial", choices=["analyzed", "partial", "unreadable"])
    parser.add_argument("--confidence", default="medium", choices=["low", "medium", "high"])
    parser.add_argument("--database-url")
    parser.add_argument("--service-key", help=argparse.SUPPRESS)
    parser.add_argument("--live", action="store_true", help="Upload/write live. Default is dry-run.")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    probe_path = Path(args.probe_json).resolve() if args.probe_json else latest_probe(args.platform)
    probe = load_probe(probe_path)
    candidate = choose_candidate(probe, args.index, not args.allow_non_mtg)
    database_url = resolve_database_url(args.database_url)
    if not database_url:
        parser.error("SUPABASE_DB_URL or .codex-secrets/supabase-db-url.txt is required")

    temp_path = write_temp_candidate_file(
        candidate,
        headers={
            "User-Agent": "Mozilla/5.0 personal-source-artifact-review",
            "Referer": candidate.get("link") or probe.get("targetUrl") or "https://www.instagram.com/",
        },
    )
    try:
        ingest_args = build_ingest_args(args, candidate, probe, temp_path)
        data = temp_path.read_bytes()
        original_filename = filename_from_url(
            candidate.get("src") or "",
            "social-probe-artifact.jpg",
        )
        mime_type = detect_mime(data, original_filename)
        digest = __import__("hashlib").sha256(data).hexdigest()
        width, height = image_dimensions(data, mime_type)
        local_path, storage_path = cache_artifact(data, digest, mime_type)
        ingest_sql = build_ingest_sql(
            ingest_args,
            storage_path=storage_path,
            mime_type=mime_type,
            byte_size=len(data),
            digest=digest,
            width=width,
            height=height,
            original_filename=original_filename,
        )
        if args.live:
            service_key = resolve_service_key(args.service_key)
            if not service_key:
                raise RuntimeError("Live upload requires the configured Supabase service key")
            upload_outcome = upload_artifact(data, storage_path, mime_type, service_key)
            print(f"Storage: {upload_outcome}")

        ingest_rows = execute_sql(ingest_sql, database_url)
        print(f"Probe: {probe_path}")
        print(f"Selected post: {candidate.get('link')}")
        print(f"Local cached file: {local_path}")
        print_rpc_rows(ingest_rows, ["artifact_id", "storage_path", "outcome", "wrote"])
        if not args.live:
            print("Extracted facts:")
            print(json.dumps(extract_basic_facts(candidate, probe), indent=2, ensure_ascii=False))
            print("PASS social probe artifact dry-run completed")
            return 0

        artifact_id = ingest_rows[0].get("artifact_id") if ingest_rows else None
        if not artifact_id:
            raise RuntimeError("Artifact ingest returned no artifact_id")

        analysis_args = build_analysis_args(args, artifact_id, candidate, probe)
        analysis_rows = execute_sql(build_analysis_sql(analysis_args), database_url)
        print_rpc_rows(analysis_rows, ["artifact_id", "analysis_status", "outcome", "wrote"])
        print("Extracted facts:")
        print(json.dumps(extract_basic_facts(candidate, probe), indent=2, ensure_ascii=False))
        print("PASS social probe artifact ingest completed")
        return 0
    finally:
        try:
            temp_path.unlink()
        except OSError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
