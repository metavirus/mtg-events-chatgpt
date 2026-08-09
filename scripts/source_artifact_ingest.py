"""Ingest and analyze ordinary image/PDF source evidence.

This helper keeps visual evidence in the same research lane as text:

* ``ingest`` obtains bytes from a local file or URL, content-addresses them,
  uploads one immutable copy to the private ``source-artifacts`` bucket, and
  records provenance plus an initial evidence link.
* ``analyze`` records text/facts extracted by Codex or another visual reader.
* ``link`` attaches the same artifact to another supported target.

The helper does not create events, Signals, venue assessments, proposals,
exports, run notes, or Git artifacts.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests
import truststore

truststore.inject_into_ssl()

from supabase_typed_rpc import (
    linked_query_rows_or_raise,
    print_rpc_rows,
    psql_rows_or_raise,
    resolve_database_url,
    run_psql,
    sql_literal,
    sql_timestamptz,
    sql_uuid,
)


ROOT = Path(__file__).resolve().parents[1]
PROJECT_REF = "pyvftzsodzwfqncjbmbc"
PROJECT_URL = f"https://{PROJECT_REF}.supabase.co"
BUCKET = "source-artifacts"
LOCAL_CACHE = ROOT / "work" / "source-artifacts"
LOCAL_SERVICE_KEY_FILE = (
    ROOT / ".codex-secrets" / "supabase-service-role-key.txt"
)
MAX_BYTES = 20 * 1024 * 1024

PLATFORMS = {
    "discord",
    "instagram",
    "facebook",
    "website",
    "event_platform",
    "other",
}
CAPTURE_METHODS = {"download", "screenshot", "user_supplied"}
TARGET_TYPES = {
    "venue",
    "community",
    "event_series",
    "event_occurrence",
    "signal",
    "research_change",
    "surface_check",
}
ANALYSIS_STATUSES = {"analyzed", "partial", "unreadable"}
CONFIDENCE = {"low", "medium", "high"}
MIME_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
}


def resolve_service_key(explicit_value: str | None) -> str | None:
    if explicit_value:
        return explicit_value.strip()
    for name in ("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"):
        value = os.environ.get(name)
        if value:
            return value.strip()
    if LOCAL_SERVICE_KEY_FILE.exists():
        value = LOCAL_SERVICE_KEY_FILE.read_text(encoding="utf-8").strip()
        if value:
            return value
    return None


def detect_mime(data: bytes, name: str) -> str:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    if data.startswith(b"%PDF-"):
        return "application/pdf"
    guessed, _ = mimetypes.guess_type(name)
    if guessed in MIME_EXTENSIONS:
        return guessed
    raise RuntimeError(
        "Unsupported artifact type. Use JPEG, PNG, WebP, GIF, or PDF."
    )


def image_dimensions(data: bytes, mime_type: str) -> tuple[int | None, int | None]:
    if mime_type == "image/png" and len(data) >= 24:
        return (
            int.from_bytes(data[16:20], "big"),
            int.from_bytes(data[20:24], "big"),
        )
    if mime_type == "image/gif" and len(data) >= 10:
        return (
            int.from_bytes(data[6:8], "little"),
            int.from_bytes(data[8:10], "little"),
        )
    if mime_type == "image/webp" and len(data) >= 30:
        kind = data[12:16]
        if kind == b"VP8X":
            return (
                1 + int.from_bytes(data[24:27], "little"),
                1 + int.from_bytes(data[27:30], "little"),
            )
    return None, None


def read_input_bytes(args: argparse.Namespace) -> tuple[bytes, str]:
    if args.file:
        path = Path(args.file).expanduser().resolve()
        if not path.is_file():
            raise RuntimeError(f"Artifact file does not exist: {path}")
        return path.read_bytes(), path.name

    response = requests.get(
        args.url,
        timeout=30,
        stream=True,
        headers={"User-Agent": "mtg-events-source-artifact-ingest/1.0"},
    )
    response.raise_for_status()
    chunks: list[bytes] = []
    size = 0
    for chunk in response.iter_content(chunk_size=65536):
        if not chunk:
            continue
        size += len(chunk)
        if size > MAX_BYTES:
            raise RuntimeError("Artifact exceeds the 20 MB Phase 1 limit")
        chunks.append(chunk)
    filename = Path(response.url.split("?", 1)[0]).name or "artifact"
    return b"".join(chunks), filename


def cache_artifact(
    data: bytes, digest: str, mime_type: str
) -> tuple[Path, str]:
    extension = MIME_EXTENSIONS[mime_type]
    relative_path = f"{digest[:2]}/{digest}{extension}"
    local_path = LOCAL_CACHE / relative_path
    local_path.parent.mkdir(parents=True, exist_ok=True)
    if not local_path.exists():
        local_path.write_bytes(data)
    return local_path, relative_path


def upload_artifact(
    data: bytes,
    storage_path: str,
    mime_type: str,
    service_key: str,
) -> str:
    encoded_path = "/".join(quote(part, safe="") for part in storage_path.split("/"))
    url = f"{PROJECT_URL}/storage/v1/object/{BUCKET}/{encoded_path}"
    response = requests.post(
        url,
        data=data,
        timeout=60,
        headers={
            "Authorization": f"Bearer {service_key}",
            "apikey": service_key,
            "Content-Type": mime_type,
            "Cache-Control": "31536000, immutable",
            "x-upsert": "false",
        },
    )
    if response.status_code in (200, 201):
        return "uploaded"
    if response.status_code in (400, 409):
        body = response.text.lower()
        if "already exists" in body or "duplicate" in body:
            return "reused"
    raise RuntimeError(
        f"Supabase Storage upload failed ({response.status_code}): "
        f"{response.text[:500]}"
    )


def execute_sql(sql: str, database_url: str) -> list[dict]:
    result = run_psql(sql, database_url)
    try:
        return psql_rows_or_raise(result)
    except RuntimeError as exc:
        if result.stdout:
            print(result.stdout.strip())
        if result.stderr:
            print(result.stderr.strip(), file=sys.stderr)
        raise RuntimeError(str(exc)) from exc


def build_ingest_sql(
    args: argparse.Namespace,
    *,
    storage_path: str,
    mime_type: str,
    byte_size: int,
    digest: str,
    width: int | None,
    height: int | None,
    original_filename: str,
) -> str:
    return f"""select artifact_id, storage_path, outcome, wrote
from public.record_source_artifact(
  p_idempotency_key := {sql_literal(args.idempotency_key)},
  p_source_id := {sql_literal(args.source_id)},
  p_platform := {sql_literal(args.platform)},
  p_capture_method := {sql_literal(args.capture_method)},
  p_storage_path := {sql_literal(storage_path)},
  p_mime_type := {sql_literal(mime_type)},
  p_byte_size := {byte_size}::bigint,
  p_content_sha256 := {sql_literal(digest)},
  p_target_type := {sql_literal(args.target_type)},
  p_target_id := {sql_literal(args.target_id)},
  p_relationship := {sql_literal(args.relationship)},
  p_origin_url := {sql_literal(args.origin_url or args.url)},
  p_external_artifact_id := {sql_literal(args.external_artifact_id)},
  p_published_at := {sql_timestamptz(args.published_at) if args.published_at else "NULL::timestamptz"},
  p_captured_at := {sql_timestamptz(args.captured_at)},
  p_original_filename := {sql_literal(original_filename)},
  p_width := {str(width) if width else "NULL"}::integer,
  p_height := {str(height) if height else "NULL"}::integer,
  p_dry_run := {sql_literal(not args.live)}
);"""


def build_analysis_sql(args: argparse.Namespace) -> str:
    facts = load_facts(args)
    extracted_text = load_optional_text(args.extracted_text, args.text_file)
    summary = load_optional_text(args.summary, args.summary_file)
    return f"""select artifact_id, analysis_status, outcome, wrote
from public.record_source_artifact_analysis(
  p_analysis_idempotency_key := {sql_literal(args.idempotency_key)},
  p_artifact_id := {sql_uuid(args.artifact_id)},
  p_analysis_status := {sql_literal(args.status)},
  p_extracted_text := {sql_literal(extracted_text)},
  p_extracted_facts := {sql_literal(json.dumps(facts, ensure_ascii=False, separators=(",", ":")))}::jsonb,
  p_analysis_summary := {sql_literal(summary)},
  p_analysis_confidence := {sql_literal(args.confidence)},
  p_dry_run := {sql_literal(not args.live)}
);"""


def build_link_sql(args: argparse.Namespace) -> str:
    return f"""select artifact_id, target_type, target_id, outcome, wrote
from public.link_source_artifact(
  p_artifact_id := {sql_uuid(args.artifact_id)},
  p_target_type := {sql_literal(args.target_type)},
  p_target_id := {sql_literal(args.target_id)},
  p_relationship := {sql_literal(args.relationship)},
  p_dry_run := {sql_literal(not args.live)}
);"""


def load_optional_text(value: str | None, path: str | None) -> str | None:
    if value is not None:
        return value
    if path:
        return Path(path).read_text(encoding="utf-8")
    return None


def load_facts(args: argparse.Namespace) -> dict:
    if args.facts_file:
        value = json.loads(Path(args.facts_file).read_text(encoding="utf-8"))
    elif args.facts_json:
        value = json.loads(args.facts_json)
    else:
        value = {}
    if not isinstance(value, dict):
        raise RuntimeError("Extracted facts must be a JSON object")
    return value


def add_execution_args(parser: argparse.ArgumentParser) -> None:
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Validate without writing. Default.",
    )
    mode.add_argument("--live", action="store_true", help="Write live.")
    parser.add_argument(
        "--database-url",
        help="Postgres connection string. Defaults to configured local secret.",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    ingest = subparsers.add_parser(
        "ingest", help="Cache, optionally upload, and record one artifact."
    )
    source = ingest.add_mutually_exclusive_group(required=True)
    source.add_argument("--file")
    source.add_argument("--url")
    add_execution_args(ingest)
    ingest.add_argument("--service-key", help=argparse.SUPPRESS)
    ingest.add_argument("--idempotency-key", required=True)
    ingest.add_argument("--source-id", required=True)
    ingest.add_argument("--platform", required=True, choices=sorted(PLATFORMS))
    ingest.add_argument(
        "--capture-method", required=True, choices=sorted(CAPTURE_METHODS)
    )
    ingest.add_argument("--target-type", required=True, choices=sorted(TARGET_TYPES))
    ingest.add_argument("--target-id", required=True)
    ingest.add_argument("--relationship", default="evidence")
    ingest.add_argument("--origin-url")
    ingest.add_argument("--external-artifact-id")
    ingest.add_argument("--published-at")
    ingest.add_argument(
        "--captured-at", default=datetime.now(timezone.utc).isoformat()
    )

    analyze = subparsers.add_parser(
        "analyze", help="Record extracted text, facts, and interpretation."
    )
    add_execution_args(analyze)
    analyze.add_argument("--idempotency-key", required=True)
    analyze.add_argument("--artifact-id", required=True)
    analyze.add_argument("--status", required=True, choices=sorted(ANALYSIS_STATUSES))
    analyze.add_argument("--extracted-text")
    analyze.add_argument("--text-file")
    analyze.add_argument("--facts-json")
    analyze.add_argument("--facts-file")
    analyze.add_argument("--summary")
    analyze.add_argument("--summary-file")
    analyze.add_argument("--confidence", choices=sorted(CONFIDENCE))

    link = subparsers.add_parser(
        "link", help="Attach an artifact to one additional target."
    )
    add_execution_args(link)
    link.add_argument("--artifact-id", required=True)
    link.add_argument("--target-type", required=True, choices=sorted(TARGET_TYPES))
    link.add_argument("--target-id", required=True)
    link.add_argument("--relationship", default="evidence")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.dry_run = not args.live
    database_url = resolve_database_url(args.database_url)
    if not database_url:
        parser.error(
            "A configured SUPABASE_DB_URL or .codex-secrets/supabase-db-url.txt is required"
        )

    try:
        if args.command == "ingest":
            data, original_filename = read_input_bytes(args)
            if not data:
                raise RuntimeError("Artifact file is empty")
            if len(data) > MAX_BYTES:
                raise RuntimeError("Artifact exceeds the 20 MB Phase 1 limit")
            mime_type = detect_mime(data, original_filename)
            digest = hashlib.sha256(data).hexdigest()
            width, height = image_dimensions(data, mime_type)
            local_path, storage_path = cache_artifact(
                data, digest, mime_type
            )
            sql = build_ingest_sql(
                args,
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
                    raise RuntimeError(
                        "Live upload requires SUPABASE_SERVICE_ROLE_KEY, "
                        "SUPABASE_SECRET_KEY, or "
                        ".codex-secrets/supabase-service-role-key.txt"
                    )
                upload_outcome = upload_artifact(
                    data, storage_path, mime_type, service_key
                )
                print(f"Storage: {upload_outcome}")
            rows = execute_sql(sql, database_url)
            print(f"Local cached file: {local_path}")
            print_rpc_rows(
                rows, ["artifact_id", "storage_path", "outcome", "wrote"]
            )
            print("PASS source artifact ingest completed")
            return 0

        if args.command == "analyze":
            rows = execute_sql(build_analysis_sql(args), database_url)
            print_rpc_rows(
                rows, ["artifact_id", "analysis_status", "outcome", "wrote"]
            )
            print("PASS source artifact analysis completed")
            return 0

        if args.command == "link":
            rows = execute_sql(build_link_sql(args), database_url)
            print_rpc_rows(
                rows, ["artifact_id", "target_type", "target_id", "outcome", "wrote"]
            )
            print("PASS source artifact link completed")
            return 0
    except (OSError, requests.RequestException, RuntimeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    parser.error(f"Unsupported command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
