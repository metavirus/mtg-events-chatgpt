#!/usr/bin/env python3
"""One-command operator wrapper for the daily surveyor lane.

This is intentionally thin. The real work stays in the existing components:

- refresh_wpn_cache.py owns WPN fetch/cache enrichment;
- stage_wpn_event_observations.py owns normalized observation staging and the
  shared promoter call;
- social_surveyor.py owns bounded Instagram/Facebook surface and artifact
  ingestion;
- audit_event_integrity.py owns post-ingest integrity checks.

The wrapper exists to make the ordinary daily lane hard to misuse and easy to
measure.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
BLESSED_PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
MAX_STEP_LOG_CHARS = 12000


def reexec_with_blessed_runtime() -> None:
    """Use the repo venv when available.

    The Windows system Python in this workspace has previously lacked tzdata.
    The project readiness gate validates the venv, so this script should route
    through it automatically instead of rediscovering that platform issue.
    """

    if not BLESSED_PYTHON.exists():
        return
    current = Path(sys.executable).resolve()
    blessed = BLESSED_PYTHON.resolve()
    if current == blessed:
        return
    completed = subprocess.run([str(blessed), __file__, *sys.argv[1:]], cwd=ROOT)
    raise SystemExit(completed.returncode)


def run_step(label: str, command: list[str]) -> tuple[int, str, float]:
    started = time.perf_counter()
    env = os.environ.copy()
    env["SUPABASE_TELEMETRY_DISABLED"] = "1"
    env["DO_NOT_TRACK"] = "1"
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )
    elapsed = time.perf_counter() - started
    output = "\n".join(part for part in (result.stdout, result.stderr) if part).strip()
    print(f"\n[{label}] {elapsed:.1f}s")
    if output:
        if len(output) <= MAX_STEP_LOG_CHARS:
            print(output)
        else:
            print(output[:4000])
            print(
                f"\n[{label}] output truncated locally: "
                f"{len(output):,} characters total; showing head and tail only.\n"
            )
            print(output[-8000:])
    if result.returncode != 0:
        print(f"[{label}] FAILED with exit code {result.returncode}")
    return result.returncode, output, elapsed


def load_database_url() -> str | None:
    value = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
    if not value:
        secret_path = ROOT / ".codex-secrets" / "supabase-db-url.txt"
        if secret_path.exists():
            value = secret_path.read_text(encoding="utf-8").strip()
    if not value:
        return None
    parsed = urlparse(value)
    if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
        return None
    return value


def sql_text(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def record_automation_error_item(
    *,
    lane: str,
    title: str,
    summary: str,
    details: dict[str, Any],
    deduplication_key: str,
    priority: int = 80,
) -> bool:
    database_url = load_database_url()
    if not database_url:
        return False
    details_json = json.dumps(details, ensure_ascii=False, separators=(",", ":")).replace("'", "''")
    command = [
        "supabase",
        "db",
        "query",
        "--db-url",
        database_url,
        "--output-format",
        "json",
        "--query",
        f"""
insert into public.coordination_items (
  origin, target, item_type, status, priority, title, summary, details,
  related_entity_type, related_entity_id, recommended_action, deduplication_key
) values (
  'automation', 'codex', 'app_issue', 'new', {priority},
  {sql_text(title)},
  {sql_text(summary)},
  '{details_json}'::jsonb,
  'app',
  {sql_text(lane)},
  'Review automation error and repair the lane without losing unrelated survey coverage.',
  {sql_text(deduplication_key)}
)
on conflict (deduplication_key) do update set
  updated_at = now(),
  status = 'new',
  title = excluded.title,
  summary = excluded.summary,
  details = excluded.details,
  related_entity_type = excluded.related_entity_type,
  related_entity_id = excluded.related_entity_id,
  recommended_action = excluded.recommended_action
returning id;
""",
    ]
    env = os.environ.copy()
    env["SUPABASE_TELEMETRY_DISABLED"] = "1"
    env["DO_NOT_TRACK"] = "1"
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )
    return result.returncode == 0


def extract_json_object(text: str) -> dict[str, Any] | None:
    decoder = json.JSONDecoder()
    for match in re.finditer(r"\{", text):
        try:
            value, _ = decoder.raw_decode(text[match.start() :])
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    return None


def summarize_refresh(output: str) -> dict[str, Any]:
    summary: dict[str, Any] = {"status": "unknown"}
    if "WPN CACHE UNCHANGED" in output:
        summary["status"] = "unchanged"
    elif "WPN CACHE READY" in output:
        summary["status"] = "refreshed"
    if match := re.search(r"Delta:\s+([^\n]+)", output):
        summary["delta"] = match.group(1).strip()
    if match := re.search(r"Retrieved:\s+([^\n]+)", output):
        summary["retrieved"] = match.group(1).strip()
    if match := re.search(r"SHA-256:\s+([0-9a-f]+)", output):
        summary["sha256"] = match.group(1)
    return summary


def summarize_audit(output: str) -> dict[str, Any]:
    critical_failures: list[str] = []
    for line in output.splitlines():
        stripped = line.strip()
        if stripped.startswith("FAIL"):
            critical_failures.append(stripped)
    return {
        "result": "pass" if "Result: PASS" in output and not critical_failures else "review",
        "critical_failures": critical_failures,
    }


def summarize_social(output: str) -> dict[str, Any]:
    payload = extract_json_object(output)
    if not payload:
        return {"status": "review", "rawOutput": output[-1000:]}
    return payload


def social_auth_available(platform: str) -> bool:
    env_name = f"SOCIAL_{platform.upper()}_STORAGE_STATE_JSON"
    if os.environ.get(env_name):
        return True
    profile_state = ROOT / "work" / "social-auth" / platform / "storage-state.json"
    return profile_state.exists()


def main() -> int:
    reexec_with_blessed_runtime()

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-refresh", action="store_true")
    parser.add_argument("--force-refresh", action="store_true")
    parser.add_argument("--max-age-hours", type=float, default=24.0)
    parser.add_argument(
        "--promote",
        action="store_true",
        help="Run the shared promoter after staging. Default is preview-only.",
    )
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help="Pass --bootstrap to the promoter for quiet inventory landing.",
    )
    parser.add_argument(
        "--audit",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Run post-ingest integrity audit after staging/promote.",
    )
    parser.add_argument(
        "--social-platform",
        action="append",
        choices=["instagram", "facebook"],
        default=[],
        help="Also run a bounded social surface survey for this platform.",
    )
    parser.add_argument("--social-limit", type=int, default=3)
    parser.add_argument("--social-max-links", type=int, default=12)
    parser.add_argument("--social-max-scrolls", type=int, default=2)
    parser.add_argument(
        "--social-include-suppressed",
        action="store_true",
        help="Allow an explicit proof run to recheck suppressed social surfaces.",
    )
    parser.add_argument(
        "--social-fail-hard",
        action="store_true",
        help="Fail the whole daily run if a social lane returns review/failure.",
    )
    args = parser.parse_args()

    overall_started = time.perf_counter()
    python = str(BLESSED_PYTHON if BLESSED_PYTHON.exists() else Path(sys.executable))
    result_summary: dict[str, Any] = {
        "mode": "promote" if args.promote else "preview",
        "bootstrap": bool(args.bootstrap),
    }

    if not args.skip_refresh:
        refresh_command = [
            python,
            "scripts/refresh_wpn_cache.py",
            "--max-age-hours",
            str(args.max_age_hours),
        ]
        if args.force_refresh:
            refresh_command.append("--force")
        code, output, elapsed = run_step("refresh-wpn-cache", refresh_command)
        result_summary["refresh"] = summarize_refresh(output) | {"elapsedSeconds": round(elapsed, 1)}
        if code != 0:
            record_automation_error_item(
                lane="daily_surveyor.refresh_wpn_cache",
                title="Daily surveyor WPN refresh failed",
                summary="The WPN refresh lane failed before staging/promote. Other automation lanes may still be healthy.",
                details={
                    "step": "refresh-wpn-cache",
                    "mode": result_summary["mode"],
                    "forceRefresh": bool(args.force_refresh),
                    "maxAgeHours": args.max_age_hours,
                    "exitCode": code,
                    "outputTail": output[-4000:],
                },
                deduplication_key="automation-error:daily-surveyor:refresh-wpn-cache",
            )
            result_summary["status"] = "failed"
            print("\nDaily surveyor summary")
            print(json.dumps(result_summary, indent=2))
            return code

    stage_command = [python, "scripts/stage_wpn_event_observations.py"]
    if args.promote:
        stage_command.append("--promote")
    if args.bootstrap:
        stage_command.append("--bootstrap")
    code, output, elapsed = run_step("stage-wpn-observations", stage_command)
    stage_json = extract_json_object(output)
    result_summary["stage"] = (stage_json or {"rawOutput": output}) | {
        "elapsedSeconds": round(elapsed, 1)
    }
    if code != 0:
        record_automation_error_item(
            lane="daily_surveyor.stage_wpn_observations",
            title="Daily surveyor WPN staging/promote failed",
            summary="The WPN observation staging or promotion lane failed. The refresh cache may still be current.",
            details={
                "step": "stage-wpn-observations",
                "mode": result_summary["mode"],
                "bootstrap": bool(args.bootstrap),
                "exitCode": code,
                "outputTail": output[-4000:],
            },
            deduplication_key="automation-error:daily-surveyor:stage-wpn-observations",
        )
        result_summary["status"] = "failed"
        print("\nDaily surveyor summary")
        print(json.dumps(result_summary, indent=2, default=str))
        return code

    if args.audit:
        code, output, elapsed = run_step(
            "event-integrity-audit",
            [python, "scripts/audit_event_integrity.py", "--fail-on-critical"],
        )
        result_summary["audit"] = summarize_audit(output) | {"elapsedSeconds": round(elapsed, 1)}
        if code != 0:
            record_automation_error_item(
                lane="daily_surveyor.event_integrity_audit",
                title="Daily surveyor integrity audit failed",
                summary="The daily surveyor finished ingest work but the post-ingest integrity audit reported a critical failure.",
                details={
                    "step": "event-integrity-audit",
                    "mode": result_summary["mode"],
                    "exitCode": code,
                    "outputTail": output[-4000:],
                },
                deduplication_key="automation-error:daily-surveyor:event-integrity-audit",
                priority=90,
            )
            result_summary["status"] = "failed"
            print("\nDaily surveyor summary")
            print(json.dumps(result_summary, indent=2, default=str))
            return code

    if args.social_platform:
        social_summaries: dict[str, Any] = {}
        for platform in args.social_platform:
            if not social_auth_available(platform):
                social_summaries[platform] = {
                    "status": "skipped",
                    "reason": f"missing SOCIAL_{platform.upper()}_STORAGE_STATE_JSON or local storage-state.json",
                }
                continue
            social_command = [
                python,
                "scripts/social_surveyor.py",
                "--platform",
                platform,
                "--limit",
                str(args.social_limit),
                "--max-links",
                str(args.social_max_links),
                "--max-scrolls",
                str(args.social_max_scrolls),
                "--live",
            ]
            if args.social_include_suppressed:
                social_command.append("--include-suppressed")
                social_command.extend(["--reopen-trigger", "user_request"])
            code, output, elapsed = run_step(f"social-{platform}-survey", social_command)
            summary = summarize_social(output) | {"elapsedSeconds": round(elapsed, 1)}
            if code != 0:
                summary["status"] = summary.get("status") or "review"
                summary["exitCode"] = code
                record_automation_error_item(
                    lane=f"daily_surveyor.social_{platform}",
                    title=f"Daily surveyor {platform} social lane failed",
                    summary=f"The bounded {platform} social survey lane failed. Other daily automation lanes may still be healthy.",
                    details={
                        "step": f"social-{platform}-survey",
                        "platform": platform,
                        "limit": args.social_limit,
                        "maxLinks": args.social_max_links,
                        "maxScrolls": args.social_max_scrolls,
                        "includeSuppressed": bool(args.social_include_suppressed),
                        "exitCode": code,
                        "outputTail": output[-4000:],
                    },
                    deduplication_key=f"automation-error:daily-surveyor:social:{platform}",
                )
            social_summaries[platform] = summary
            if code != 0 and args.social_fail_hard:
                result_summary["social"] = social_summaries
                result_summary["status"] = "failed"
                print("\nDaily surveyor summary")
                print(json.dumps(result_summary, indent=2, default=str))
                return code
        result_summary["social"] = social_summaries

    result_summary["status"] = "ok"
    result_summary["elapsedSeconds"] = round(time.perf_counter() - overall_started, 1)
    print("\nDaily surveyor summary")
    print(json.dumps(result_summary, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
