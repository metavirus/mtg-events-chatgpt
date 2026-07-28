"""Shared helpers for tiny typed Supabase RPC wrappers.

This module is intentionally narrow. It supports only linked Supabase CLI
execution and optional direct psql execution for small typed-RPC helpers.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LOCAL_DB_URL_FILE = ROOT / ".codex-secrets" / "supabase-db-url.txt"


def supabase_cli_env() -> dict[str, str]:
    """Use the normal authenticated Supabase CLI state, with telemetry disabled."""
    env = os.environ.copy()
    env["SUPABASE_TELEMETRY_DISABLED"] = "1"
    env["DO_NOT_TRACK"] = "1"
    return env


def sql_literal(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def sql_date(value: str) -> str:
    return f"{sql_literal(value)}::date"


def sql_time(value: str) -> str:
    return f"{sql_literal(value)}::time"


def sql_timestamptz(value: str) -> str:
    return f"{sql_literal(value)}::timestamptz"


def sql_uuid(value: str | None) -> str:
    if not value:
        return "NULL::uuid"
    return f"{sql_literal(value)}::uuid"


def extract_first_json_document(text: str) -> dict:
    decoder = json.JSONDecoder()
    payload = text.lstrip()
    if not payload:
        raise RuntimeError("Supabase CLI returned no JSON payload")
    obj, _ = decoder.raw_decode(payload)
    if not isinstance(obj, dict):
        raise RuntimeError("Supabase CLI JSON payload was not an object")
    return obj


def run_linked_query(sql: str) -> subprocess.CompletedProcess[str]:
    if not shutil.which("supabase"):
        raise RuntimeError("supabase CLI is not available on PATH")

    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", newline="\n", suffix=".sql", delete=False
    ) as handle:
        handle.write(sql)
        temp_path = Path(handle.name)
    try:
        return subprocess.run(
            [
                "supabase",
                "db",
                "query",
                "--linked",
                "--output-format",
                "json",
                "--file",
                str(temp_path),
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=120,
            check=False,
            env=supabase_cli_env(),
        )
    finally:
        try:
            temp_path.unlink()
        except OSError:
            pass


def run_supabase_db_url_query(sql: str, database_url: str) -> subprocess.CompletedProcess[str]:
    if not shutil.which("supabase"):
        raise RuntimeError("supabase CLI is not available on PATH")

    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", newline="\n", suffix=".sql", delete=False
    ) as handle:
        handle.write(sql)
        temp_path = Path(handle.name)
    try:
        return subprocess.run(
            [
                "supabase",
                "db",
                "query",
                "--db-url",
                database_url,
                "--output-format",
                "json",
                "--file",
                str(temp_path),
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=120,
            check=False,
            env=supabase_cli_env(),
        )
    finally:
        try:
            temp_path.unlink()
        except OSError:
            pass


def run_psql(sql: str, database_url: str) -> subprocess.CompletedProcess[str]:
    if not shutil.which("psql"):
        raise RuntimeError("psql is not available on PATH")
    return subprocess.run(
        [
            "psql",
            database_url,
            "--set",
            "ON_ERROR_STOP=1",
            "--no-psqlrc",
            "--command",
            sql,
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=120,
        check=False,
    )


def linked_query_rows_or_raise(result: subprocess.CompletedProcess[str]) -> list[dict]:
    payload = extract_first_json_document(result.stdout)
    rows = payload.get("rows")
    if not isinstance(rows, list):
        raise RuntimeError("Supabase CLI JSON payload did not contain rows")
    if result.returncode == 0:
        return rows

    error_suffix = (result.stderr or "").strip()
    if rows and "Timeout while shutting down PostHog" in result.stdout:
        return rows
    raise RuntimeError(
        "Supabase linked query failed"
        + (f": {error_suffix}" if error_suffix else "")
    )


def print_rpc_rows(rows: list[dict], expected_fields: list[str]) -> None:
    if not rows:
        print("No rows returned.")
        return
    for index, row in enumerate(rows, start=1):
        label = f"Row {index}" if len(rows) > 1 else "Result"
        print(label + ":")
        for field in expected_fields:
            print(f"  {field}: {row.get(field)}")


def resolve_database_url(explicit_value: str | None) -> str | None:
    if explicit_value:
        return explicit_value
    env_value = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if env_value:
        return env_value
    if LOCAL_DB_URL_FILE.exists():
        value = LOCAL_DB_URL_FILE.read_text(encoding="utf-8").strip()
        if value:
            return value
    return None
