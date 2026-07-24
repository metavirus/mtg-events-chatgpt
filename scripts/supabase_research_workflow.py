"""Controlled Supabase research-write and JSON export workflow.

This script is intentionally conservative. It gives future Codex research work a
reviewable proposal format, validates stable IDs and relationships before any
write SQL is produced, classifies proposal risk, and exports deterministic JSON
recovery snapshots from Supabase.

It does not require or store a service-role key. By default it performs dry-run
validation, SQL generation, and targeted verification planning only. Live apply
requires an explicit execution flag and database URL backend.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import ssl
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
from copy import deepcopy
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_CONFIG = ROOT / "supabase" / "project-config.json"
DEFAULT_EXPORT_DIR = ROOT / "supabase" / "exports" / "latest"
ALLOW_INSECURE_LOCAL_DEV_TLS = False

ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")

TABLES: dict[str, dict[str, Any]] = {
    "venues": {
        "id": ["id"],
        "required_insert": ["id", "name"],
        "fields": {
            "id", "name", "city", "address", "phone", "website", "events_url",
            "instagram", "wpn_premium", "distance_miles", "operating_status",
            "research_status", "last_verified", "assessment_notes", "assessment",
        },
        "jsonb": {"assessment"},
        "identity_name": "venue",
    },
    "communities": {
        "id": ["id"],
        "required_insert": ["id", "name"],
        "fields": {
            "id", "name", "region", "research_status", "formats",
            "primary_channel", "summary", "signal", "next_question",
        },
        "arrays": {"formats"},
        "identity_name": "community",
    },
    "sources": {
        "id": ["id"],
        "required_insert": ["id", "label", "source_type"],
        "fields": {
            "id", "label", "url", "source_type", "health_status", "last_checked",
        },
        "identity_name": "source",
    },
    "entity_sources": {
        "id": ["entity_type", "entity_id", "source_id"],
        "required_insert": ["entity_type", "entity_id", "source_id"],
        "fields": {"entity_type", "entity_id", "source_id", "relationship"},
        "identity_name": "entity/source relationship",
    },
    "event_series": {
        "id": ["id"],
        "required_insert": ["id", "title"],
        "fields": {
            "id", "venue_id", "community_id", "title", "format", "event_type",
            "bracket", "recurrence", "default_start_time", "start_date",
            "end_date", "entry_fee", "currency", "details", "confidence",
            "event_status", "last_verified",
        },
        "jsonb": {"recurrence"},
        "identity_name": "event series",
    },
    "event_occurrences": {
        "id": ["id"],
        "required_insert": ["id", "series_id", "occurrence_date"],
        "fields": {
            "id", "series_id", "occurrence_date", "start_time", "end_time",
            "evidence_state", "occurrence_status", "entry_fee", "capacity",
            "details",
        },
        "duplicate_key": ["series_id", "occurrence_date", "start_time"],
        "identity_name": "event occurrence",
    },
    "event_sources": {
        "id": ["source_id", "series_id", "occurrence_id"],
        "required_insert": ["source_id"],
        "fields": {"source_id", "series_id", "occurrence_id", "relationship"},
        "identity_name": "event/source relationship",
    },
    "evaluations": {
        "id": ["entity_type", "entity_id"],
        "required_insert": ["entity_type", "entity_id", "research_status", "confidence"],
        "fields": {
            "entity_type", "entity_id", "research_status", "candidate_status",
            "fit_grade", "fit_score", "confidence", "positives", "cautions",
            "open_questions",
        },
        "arrays": {"positives", "cautions", "open_questions"},
        "identity_name": "evaluation",
    },
    "venue_hours": {
        "id": ["venue_id"],
        "required_insert": ["venue_id"],
        "fields": {
            "venue_id", "status", "weekly_hours", "temporary_updates",
            "source_id", "last_verified", "notes",
        },
        "jsonb": {"weekly_hours", "temporary_updates"},
        "identity_name": "venue hours",
    },
    "research_changes": {
        "id": ["id"],
        "required_insert": [
            "id", "detected_at", "change_type", "entity_type", "entity_id",
            "summary", "review_status",
        ],
        "fields": {
            "id", "detected_at", "change_type", "entity_type", "entity_id",
            "summary", "review_status",
        },
        "identity_name": "research change",
    },
    "signals": {
        "id": ["id"],
        "required_insert": [
            "id", "category", "priority", "status", "captured_at", "summary",
            "confidence",
        ],
        "fields": {
            "id", "category", "priority", "status", "source_id",
            "captured_at", "observed_at", "expires_at", "related_entity_type",
            "related_entity_id", "summary", "details", "evidence_url",
            "confidence", "suggested_action", "promotion_target",
            "dedupe_key",
        },
        "identity_name": "signal",
    },
}

EVALUATION_CANDIDATE_STATUSES = {"promoted", "neutral", "deprioritized"}

ENUMS = {
    "venues.operating_status": {"open", "closed", "temporary_closed", "unknown"},
    "venues.research_status": {"discovery", "reviewed", "deepened"},
    "communities.research_status": {"discovery", "reviewed", "deepened"},
    "sources.health_status": {
        "current", "stale", "broken", "login_required", "blocked",
        "superseded", "unknown",
    },
    "entity_sources.entity_type": {"venue", "community"},
    "event_series.confidence": {"low", "medium", "high"},
    "event_series.event_status": {"active", "inactive", "cancelled", "unknown"},
    "event_occurrences.evidence_state": {
        "corroborated", "single_source", "projected", "needs_confirmation",
    },
    "event_occurrences.occurrence_status": {
        "confirmed", "projected", "cancelled", "moved", "at_risk",
    },
    "evaluations.entity_type": {"venue", "community"},
    "evaluations.research_status": {"discovery", "reviewed", "deepened"},
    # Keep this in sync with the live Supabase
    # public.evaluations_candidate_status_check constraint. In particular,
    # "promising" is an app/planning label, not a database candidate_status.
    "evaluations.candidate_status": EVALUATION_CANDIDATE_STATUSES,
    "venue_hours.status": {"verified", "variable", "stale", "unknown"},
    "signals.priority": {"low", "normal", "high", "urgent"},
    "signals.status": {"new", "reviewed", "promoted", "dismissed", "stale", "needs_followup"},
    "signals.confidence": {"low", "medium", "high"},
}

DATE_FIELDS = {
    "last_verified", "last_checked", "start_date", "end_date", "occurrence_date",
}
TIMESTAMP_FIELDS = {"detected_at"}
TIME_FIELDS = {"default_start_time", "start_time", "end_time"}


class WorkflowError(Exception):
    pass


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=False)
    path.write_text(text + "\n", encoding="utf-8", newline="\n")


def sql_literal(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def sql_value(table: str, field: str, value: Any) -> str:
    meta = TABLES[table]
    if field in meta.get("jsonb", set()):
        return sql_literal(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"
    if field in meta.get("arrays", set()):
        values = value or []
        if not isinstance(values, list) or not all(isinstance(item, str) for item in values):
            raise WorkflowError(f"{table}.{field} must be a list of strings")
        return "array[" + ", ".join(sql_literal(item) for item in values) + "]::text[]"
    return sql_literal(value)


def stable_key(table: str, fields: dict[str, Any]) -> tuple[Any, ...]:
    return tuple(fields.get(field) for field in TABLES[table]["id"])


def stable_key_text(table: str, fields: dict[str, Any]) -> str:
    return "|".join("" if part is None else str(part) for part in stable_key(table, fields))


def assert_id(value: str, label: str) -> None:
    if not isinstance(value, str) or not ID_RE.match(value):
        raise WorkflowError(f"{label} must be a stable lowercase ID; got {value!r}")


def validate_dateish(value: Any, label: str) -> None:
    if value is None:
        return
    if not isinstance(value, str):
        raise WorkflowError(f"{label} must be a string date/time value")
    if not re.match(r"^\d{4}-\d{2}-\d{2}", value) and not re.match(r"^\d{2}:\d{2}", value):
        raise WorkflowError(f"{label} has an unexpected date/time shape: {value!r}")


def load_local_snapshot() -> dict[str, list[dict[str, Any]]]:
    stores = read_json(ROOT / "stores.json")
    events = read_json(ROOT / "events.json")
    sources = read_json(ROOT / "sources.json")
    changes = read_json(ROOT / "changes.json")
    entity_sources = [
        {"entity_type": "venue", "entity_id": store["id"], "source_id": source_id}
        for store in stores
        for source_id in (store.get("sourceIds") or [])
    ]
    event_sources = []
    evaluations = []
    for event in events:
        if event.get("recurrence"):
            event_sources.append({
                "source_id": event.get("sourceId"),
                "series_id": event["id"],
                "occurrence_id": None,
            })
        else:
            event_sources.append({
                "source_id": event.get("sourceId"),
                "series_id": None,
                "occurrence_id": event["id"] + "--occurrence",
            })
    for store in stores:
        evaluation = store.get("evaluation")
        if evaluation:
            evaluations.append({"entity_type": "venue", "entity_id": store["id"]})

    return {
        "venues": [
            {
                "id": store["id"],
                "name": store["name"],
                "sourceIds": store.get("sourceIds") or [],
            }
            for store in stores
        ],
        "communities": [
            {"id": "legendary-creature-club", "name": "Legendary Creature Club"},
            {"id": "infinite-loop-mtg", "name": "Infinite Loop MTG"},
            {"id": "mtg-oc", "name": "MTG OC / ProjectCCG"},
        ],
        "sources": sources,
        "event_series": [
            {
                "id": event["id"],
                "venue_id": event.get("storeId"),
                "community_id": None,
                "title": event["title"],
            }
            for event in events
        ],
        "event_occurrences": [
            {
                "id": event["id"] + "--occurrence",
                "series_id": event["id"],
                "occurrence_date": event.get("startDate"),
                "start_time": event.get("startTime"),
            }
            for event in events
            if not event.get("recurrence")
        ],
        "entity_sources": entity_sources,
        "event_sources": event_sources,
        "evaluations": evaluations,
        "venue_hours": [],
        "research_changes": changes,
        "signals": [],
    }


def load_export_snapshot(output_dir: Path) -> dict[str, list[dict[str, Any]]]:
    files = {
        "venues": "stores.json",
        "communities": "communities.json",
        "sources": "sources.json",
        "entity_sources": "entity_sources.json",
        "event_series": "events.json",
        "event_occurrences": "event_occurrences.json",
        "event_sources": "event_sources.json",
        "evaluations": "evaluations.json",
        "venue_hours": "venue_hours.json",
        "research_changes": "changes.json",
        "signals": "signals.json",
    }
    snapshot: dict[str, list[dict[str, Any]]] = {}
    missing = []
    for table, filename in files.items():
        path = output_dir / filename
        if not path.exists():
            missing.append(filename)
        else:
            snapshot[table] = read_json(path)
    if missing:
        raise WorkflowError(f"Basis export is missing required files: {', '.join(missing)}")
    return snapshot


def indexes_from_snapshot(snapshot: dict[str, list[dict[str, Any]]]) -> dict[str, dict[tuple[Any, ...], dict[str, Any]]]:
    indexes: dict[str, dict[tuple[Any, ...], dict[str, Any]]] = {}
    for table in TABLES:
        indexes[table] = {}
        for row in snapshot.get(table, []):
            key_fields = {field: row.get(field) for field in TABLES[table]["id"]}
            if table == "event_sources":
                key_is_complete = (
                    key_fields.get("source_id") is not None
                    and (key_fields.get("series_id") is not None) != (key_fields.get("occurrence_id") is not None)
                )
            else:
                key_is_complete = all(value is not None for value in key_fields.values())
            if key_is_complete:
                indexes[table][stable_key(table, key_fields)] = row
    return indexes


def validate_proposal(proposal: dict[str, Any], basis_dir: Path | None = None) -> tuple[list[dict[str, Any]], list[str]]:
    if not isinstance(proposal, dict):
        raise WorkflowError("Proposal must be a JSON object")
    allowed_top = {"proposal_id", "description", "created_at", "author", "operations"}
    unknown_top = sorted(set(proposal) - allowed_top)
    if unknown_top:
        raise WorkflowError(f"Unknown top-level proposal fields: {', '.join(unknown_top)}")
    operations = proposal.get("operations")
    if not isinstance(operations, list) or not operations:
        raise WorkflowError("Proposal must contain a non-empty operations array")

    working = load_export_snapshot(basis_dir) if basis_dir else load_local_snapshot()
    indexes = indexes_from_snapshot(working)
    pending_occurrence_keys = {
        (row.get("series_id"), row.get("occurrence_date"), row.get("start_time"))
        for row in working["event_occurrences"]
    }
    warnings: list[str] = []
    normalized: list[dict[str, Any]] = []

    for index, op in enumerate(operations, start=1):
        if not isinstance(op, dict):
            raise WorkflowError(f"Operation {index} must be an object")
        allowed_op = {"action", "table", "key", "fields", "reason"}
        unknown_op = sorted(set(op) - allowed_op)
        if unknown_op:
            raise WorkflowError(f"Operation {index} has unknown fields: {', '.join(unknown_op)}")
        action = op.get("action")
        table = op.get("table")
        if action not in {"insert", "update", "upsert"}:
            raise WorkflowError(f"Operation {index} action must be insert, update, or upsert")
        if table not in TABLES:
            raise WorkflowError(f"Operation {index} table is not allowed: {table!r}")
        fields = deepcopy(op.get("fields") or {})
        if not isinstance(fields, dict):
            raise WorkflowError(f"Operation {index} fields must be an object")
        unknown_fields = sorted(set(fields) - TABLES[table]["fields"])
        if unknown_fields:
            raise WorkflowError(f"Operation {index} has unknown {table} fields: {', '.join(unknown_fields)}")
        key = deepcopy(op.get("key") or {})
        if not isinstance(key, dict):
            raise WorkflowError(f"Operation {index} key must be an object when provided")
        for key_field in TABLES[table]["id"]:
            if key_field not in fields and key_field in key:
                fields[key_field] = key[key_field]
        if table == "event_sources":
            missing_key = ["source_id"] if fields.get("source_id") is None else []
        else:
            missing_key = [field for field in TABLES[table]["id"] if fields.get(field) is None]
        if missing_key:
            raise WorkflowError(f"Operation {index} missing stable key fields: {', '.join(missing_key)}")
        for field in TABLES[table]["id"]:
            if field == "id":
                assert_id(str(fields[field]), f"Operation {index} {table}.id")
        for field in DATE_FIELDS & fields.keys():
            validate_dateish(fields[field], f"Operation {index} {table}.{field}")
        for field in TIMESTAMP_FIELDS & fields.keys():
            validate_dateish(fields[field], f"Operation {index} {table}.{field}")
        for field in TIME_FIELDS & fields.keys():
            validate_dateish(fields[field], f"Operation {index} {table}.{field}")
        for enum_field, valid in ENUMS.items():
            enum_table, field = enum_field.split(".")
            if enum_table == table and field in fields and fields[field] is not None and fields[field] not in valid:
                qualifier = "live schema values" if enum_field == "evaluations.candidate_status" else "values"
                raise WorkflowError(
                    f"Operation {index} {table}.{field} must be one of {sorted(valid)} {qualifier}"
                )
        if table == "event_series" and not fields.get("venue_id") and not fields.get("community_id"):
            raise WorkflowError(f"Operation {index} event_series requires venue_id or community_id")
        if table == "event_sources":
            if bool(fields.get("series_id")) == bool(fields.get("occurrence_id")):
                raise WorkflowError(f"Operation {index} event_sources requires exactly one of series_id or occurrence_id")
            if action == "upsert":
                raise WorkflowError("event_sources does not support upsert; use insert or update so the partial unique index remains explicit")
        if table == "evaluations" and fields.get("fit_grade") and not re.match(r"^[A-F][+-]?$", fields["fit_grade"]):
            raise WorkflowError(f"Operation {index} evaluations.fit_grade is invalid")

        row_key = stable_key(table, fields)
        exists = row_key in indexes.get(table, {})
        if action == "insert" and exists:
            raise WorkflowError(f"Operation {index} would duplicate existing {TABLES[table]['identity_name']}: {stable_key_text(table, fields)}")
        if action == "update" and not exists:
            raise WorkflowError(f"Operation {index} cannot update missing {TABLES[table]['identity_name']}: {stable_key_text(table, fields)}")
        if action in {"insert", "upsert"}:
            missing_required = [field for field in TABLES[table]["required_insert"] if fields.get(field) is None]
            if missing_required:
                raise WorkflowError(f"Operation {index} insert/upsert missing required fields: {', '.join(missing_required)}")

        validate_relationships(index, table, fields, indexes)
        if table == "event_occurrences":
            duplicate_key = tuple(fields.get(field) for field in TABLES[table]["duplicate_key"])
            if action in {"insert", "upsert"} and duplicate_key in pending_occurrence_keys and not exists:
                raise WorkflowError(f"Operation {index} would duplicate event occurrence {duplicate_key}")
            pending_occurrence_keys.add(duplicate_key)

        indexes.setdefault(table, {})[row_key] = fields
        normalized.append({"action": action, "table": table, "fields": fields, "reason": op.get("reason")})
    return normalized, warnings


def validate_relationships(index: int, table: str, fields: dict[str, Any], indexes: dict[str, dict[tuple[Any, ...], dict[str, Any]]]) -> None:
    def require(target_table: str, value: Any, label: str) -> None:
        if value is None:
            return
        if (value,) not in indexes.get(target_table, {}):
            raise WorkflowError(f"Operation {index} references missing {label}: {value}")

    if table == "entity_sources":
        require("sources", fields.get("source_id"), "source")
        entity_type = fields.get("entity_type")
        if entity_type == "venue":
            require("venues", fields.get("entity_id"), "venue")
        elif entity_type == "community":
            require("communities", fields.get("entity_id"), "community")
    elif table == "event_series":
        require("venues", fields.get("venue_id"), "venue")
        require("communities", fields.get("community_id"), "community")
    elif table == "event_occurrences":
        require("event_series", fields.get("series_id"), "event series")
    elif table == "event_sources":
        require("sources", fields.get("source_id"), "source")
        require("event_series", fields.get("series_id"), "event series")
        require("event_occurrences", fields.get("occurrence_id"), "event occurrence")
    elif table == "evaluations":
        entity_type = fields.get("entity_type")
        if entity_type == "venue":
            require("venues", fields.get("entity_id"), "venue")
        elif entity_type == "community":
            require("communities", fields.get("entity_id"), "community")
    elif table == "venue_hours":
        require("venues", fields.get("venue_id"), "venue")
        require("sources", fields.get("source_id"), "source")
    elif table == "research_changes":
        entity_type = fields.get("entity_type")
        entity_id = fields.get("entity_id")
        if entity_type == "venue":
            require("venues", entity_id, "venue")
        elif entity_type == "community":
            require("communities", entity_id, "community")
        elif entity_type == "event_series":
            require("event_series", entity_id, "event series")
        elif entity_type == "event_occurrence":
            require("event_occurrences", entity_id, "event occurrence")
    elif table == "signals":
        require("sources", fields.get("source_id"), "source")
        related_type = fields.get("related_entity_type")
        related_id = fields.get("related_entity_id")
        if related_type == "venue":
            require("venues", related_id, "venue")
        elif related_type == "community":
            require("communities", related_id, "community")
        elif related_type == "event_series":
            require("event_series", related_id, "event series")
        elif related_type == "event_occurrence":
            require("event_occurrences", related_id, "event occurrence")


def insert_or_update_sql(operation: dict[str, Any]) -> str:
    table = operation["table"]
    action = operation["action"]
    fields = operation["fields"]
    columns = list(fields.keys())
    values = [sql_value(table, column, fields[column]) for column in columns]
    key_columns = TABLES[table]["id"]
    if action == "insert":
        return (
            f"insert into public.{table} ({', '.join(columns)}) values "
            f"({', '.join(values)});"
        )
    if action == "update":
        update_columns = [column for column in columns if column not in key_columns]
        if not update_columns:
            raise WorkflowError(f"Update for {table} has no non-key fields")
        assignments = ", ".join(
            f"{column} = {sql_value(table, column, fields[column])}"
            for column in update_columns
        )
        predicates = " and ".join(
            f"{column} is not distinct from {sql_value(table, column, fields[column])}"
            for column in key_columns
        )
        return f"update public.{table} set {assignments} where {predicates};"
    update_columns = [column for column in columns if column not in key_columns]
    conflict = ", ".join(key_columns)
    if update_columns:
        assignments = ", ".join(f"{column} = excluded.{column}" for column in update_columns)
        conflict_clause = f"do update set {assignments}"
    else:
        conflict_clause = "do nothing"
    return (
        f"insert into public.{table} ({', '.join(columns)}) values "
        f"({', '.join(values)}) on conflict ({conflict}) {conflict_clause};"
    )


def generate_sql(proposal: dict[str, Any], operations: list[dict[str, Any]]) -> str:
    proposal_id = proposal.get("proposal_id") or "unnamed-proposal"
    generated_at = datetime.now(timezone.utc).isoformat()
    lines = [
        "-- Generated by scripts/supabase_research_workflow.py. Review before applying.",
        f"-- Proposal: {proposal_id}",
        f"-- Generated at: {generated_at}",
        "-- Before applying to live Supabase, create a deterministic export/backup.",
        "begin;",
        "set constraints all immediate;",
    ]
    for operation in operations:
        if operation.get("reason"):
            lines.append(f"-- Reason: {operation['reason']}")
        lines.append(insert_or_update_sql(operation))
    affected_tables = sorted({operation["table"] for operation in operations})
    lines.extend([
        "",
        "-- Post-write row-count verification:",
        "select * from (",
        "\nunion all\n".join(
            f"  select '{table}' as table_name, count(*)::bigint as row_count from public.{table}"
            for table in affected_tables
        ),
        ") counts order by table_name;",
        "",
        "-- Post-write duplicate occurrence check:",
        "select series_id, occurrence_date, start_time, count(*)",
        "from public.event_occurrences",
        "group by series_id, occurrence_date, start_time",
        "having count(*) > 1;",
        "commit;",
        "",
    ])
    return "\n".join(lines)


RISK_ORDER = {"lean": 0, "standard": 1, "high": 2}


def classify_operations(operations: list[dict[str, Any]]) -> dict[str, Any]:
    """Classify proposal scope for validation overhead and apply safety."""
    touched_tables = sorted({operation["table"] for operation in operations})
    operation_counts = Counter(operation["table"] for operation in operations)
    risk = "lean"
    reasons: list[str] = []

    def raise_risk(level: str, reason: str) -> None:
        nonlocal risk
        if RISK_ORDER[level] > RISK_ORDER[risk]:
            risk = level
        if reason not in reasons:
            reasons.append(reason)

    for operation in operations:
        table = operation["table"]
        action = operation["action"]
        fields = operation["fields"]
        key_fields = set(TABLES[table]["id"])
        changed_fields = set(fields) - key_fields

        if table in {"venues", "communities"}:
            identity_fields = {"name", "city", "address", "operating_status"}
            if action in {"insert", "upsert"} or identity_fields & changed_fields:
                raise_risk("high", f"{table} identity/status fields touched")
            else:
                raise_risk("standard", f"{table} assessment fields touched")

        if table == "venue_hours":
            raise_risk("high", "venue_hours can affect user-facing open/closed trust")

        if table == "signals":
            raise_risk("standard", "Signals affect the attention layer")

        if table == "event_occurrences":
            if action in {"insert", "upsert"}:
                raise_risk("standard", "event occurrence rows inserted/upserted")
            if fields.get("occurrence_status") in {"cancelled", "moved", "at_risk"}:
                raise_risk("standard", "event occurrence status changes planning")

        if table == "event_series":
            identity_or_projection_fields = {
                "venue_id", "community_id", "title", "recurrence",
                "default_start_time", "start_date", "end_date",
            }
            if action in {"insert", "upsert"}:
                raise_risk("standard", "event series rows inserted/upserted")
            if fields.get("event_status") in {"inactive", "cancelled"}:
                raise_risk("standard", "event series retired/cancelled")
            if action == "update" and identity_or_projection_fields & changed_fields:
                raise_risk("standard", "event series identity/projection fields updated")

        if table in {"event_sources", "entity_sources"} and action in {"insert", "upsert"}:
            raise_risk("standard", f"{table} relationship rows inserted/upserted")

    if not reasons:
        reasons.append("source freshness, event detail refresh, evaluation wording/status, or research marker only")

    return {
        "risk": risk,
        "touched_tables": touched_tables,
        "operation_counts": dict(sorted(operation_counts.items())),
        "reasons": reasons,
    }


def generate_targeted_verification_sql(operations: list[dict[str, Any]]) -> str:
    """Generate focused readbacks for affected stable keys."""
    lines = [
        "-- Targeted verification generated by scripts/supabase_research_workflow.py.",
        "-- Run after applying the proposal SQL.",
    ]
    by_table: dict[str, list[dict[str, Any]]] = {}
    for operation in operations:
        by_table.setdefault(operation["table"], []).append(operation["fields"])

    for table in sorted(by_table):
        meta = TABLES[table]
        key_columns = meta["id"]
        predicates = []
        for fields in by_table[table]:
            predicates.append(
                "(" + " and ".join(
                    f"{column} is not distinct from {sql_value(table, column, fields[column])}"
                    for column in key_columns
                ) + ")"
            )
        lines.append("")
        lines.append(f"-- {table}: {len(by_table[table])} affected key(s)")
        lines.append(f"select * from public.{table}")
        lines.append("where " + "\n   or ".join(predicates) + ";")

    if "event_occurrences" in by_table or "event_series" in by_table:
        lines.extend([
            "",
            "-- Duplicate occurrence check:",
            "select series_id, occurrence_date, start_time, count(*)",
            "from public.event_occurrences",
            "group by series_id, occurrence_date, start_time",
            "having count(*) > 1;",
        ])
    return "\n".join(lines) + "\n"


def run_sql_with_psql(sql: str, database_url: str) -> subprocess.CompletedProcess[str]:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="\n", suffix=".sql", delete=False) as handle:
        handle.write(sql)
        temp_path = Path(handle.name)
    try:
        return subprocess.run(
            ["psql", database_url, "-v", "ON_ERROR_STOP=1", "-f", str(temp_path)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=120,
            check=False,
        )
    finally:
        try:
            temp_path.unlink()
        except OSError:
            pass


def load_public_config() -> tuple[str, str]:
    if PUBLIC_CONFIG.exists():
        config = read_json(PUBLIC_CONFIG)
        os.environ.setdefault("SUPABASE_URL", config.get("url", ""))
        os.environ.setdefault("SUPABASE_PUBLISHABLE_KEY", config.get("publishableKey", ""))
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
    if not url or not key:
        raise WorkflowError("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY")
    return url, key


def fetch_table(table: str, columns: str = "*") -> list[dict[str, Any]]:
    url, key = load_public_config()
    all_rows: list[dict[str, Any]] = []
    offset = 0
    page_size = 1000
    while True:
        query = urllib.parse.urlencode({
            "select": columns,
            "limit": page_size,
            "offset": offset,
        })
        request = urllib.request.Request(
            f"{url}/rest/v1/{table}?{query}",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Accept": "application/json",
            },
        )
        context = None
        if ALLOW_INSECURE_LOCAL_DEV_TLS:
            context = ssl._create_unverified_context()
        with urllib.request.urlopen(request, timeout=30, context=context) as response:
            rows = json.load(response)
        all_rows.extend(rows)
        if len(rows) < page_size:
            return all_rows
        offset += page_size


def normalize_supabase_rows(rows: list[dict[str, Any]], key: str = "id") -> list[dict[str, Any]]:
    return sorted(rows, key=lambda row: "" if row.get(key) is None else str(row.get(key)))


def export_supabase(output_dir: Path) -> None:
    tables = {
        "stores.json": "venues",
        "communities.json": "communities",
        "sources.json": "sources",
        "entity_sources.json": "entity_sources",
        "events.json": "event_series",
        "event_occurrences.json": "event_occurrences",
        "event_sources.json": "event_sources",
        "evaluations.json": "evaluations",
        "venue_hours.json": "venue_hours",
        "changes.json": "research_changes",
        "signals.json": "signals",
        "dataset_metadata.json": "dataset_metadata",
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "generatedBy": "scripts/supabase_research_workflow.py export-json",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "Supabase public read API",
        "files": [],
        "rule": "Generated exports are recovery/export artifacts and must not be manually edited.",
    }
    for filename, table in tables.items():
        rows = normalize_supabase_rows(fetch_table(table))
        write_json(output_dir / filename, rows)
        manifest["files"].append({"file": filename, "table": table, "rows": len(rows)})
    write_json(output_dir / "manifest.json", manifest)


def verify_export(output_dir: Path) -> None:
    required = [
        "stores.json", "communities.json", "sources.json", "events.json",
        "event_occurrences.json", "changes.json", "signals.json",
        "manifest.json",
    ]
    missing = [name for name in required if not (output_dir / name).exists()]
    if missing:
        raise WorkflowError(f"Export is missing required files: {', '.join(missing)}")
    stores = read_json(output_dir / "stores.json")
    communities = read_json(output_dir / "communities.json")
    sources = read_json(output_dir / "sources.json")
    events = read_json(output_dir / "events.json")
    occurrences = read_json(output_dir / "event_occurrences.json")
    changes = read_json(output_dir / "changes.json")
    ids = {
        "venues": {row["id"] for row in stores},
        "communities": {row["id"] for row in communities},
        "sources": {row["id"] for row in sources},
        "event_series": {row["id"] for row in events},
        "event_occurrences": {row["id"] for row in occurrences},
        "research_changes": {row["id"] for row in changes},
    }
    for label, rows in [
        ("venues", stores), ("communities", communities), ("sources", sources),
        ("event_series", events), ("event_occurrences", occurrences),
        ("research_changes", changes),
    ]:
        if len(ids[label]) != len(rows):
            raise WorkflowError(f"Export has duplicate IDs in {label}")
    for event in events:
        if event.get("venue_id") and event["venue_id"] not in ids["venues"]:
            raise WorkflowError(f"Event {event['id']} references missing venue {event['venue_id']}")
        if event.get("community_id") and event["community_id"] not in ids["communities"]:
            raise WorkflowError(f"Event {event['id']} references missing community {event['community_id']}")
    occurrence_keys = set()
    for occurrence in occurrences:
        if occurrence["series_id"] not in ids["event_series"]:
            raise WorkflowError(f"Occurrence {occurrence['id']} references missing series {occurrence['series_id']}")
        key = (occurrence["series_id"], occurrence.get("occurrence_date"), occurrence.get("start_time"))
        if key in occurrence_keys:
            raise WorkflowError(f"Export has duplicate occurrence key {key}")
        occurrence_keys.add(key)
    print(
        "PASS export verification: "
        f"{len(stores)} venues, {len(communities)} communities, "
        f"{len(sources)} sources, {len(events)} event series, "
        f"{len(occurrences)} occurrences, {len(changes)} changes."
    )


def command_validate(args: argparse.Namespace) -> int:
    proposal = read_json(Path(args.proposal))
    operations, warnings = validate_proposal(proposal, Path(args.basis_dir) if args.basis_dir else None)
    print(f"PASS proposal validation: {len(operations)} operations")
    for warning in warnings:
        print(f"WARN {warning}")
    return 0


def command_plan(args: argparse.Namespace) -> int:
    proposal = read_json(Path(args.proposal))
    operations, warnings = validate_proposal(proposal, Path(args.basis_dir) if args.basis_dir else None)
    sql = generate_sql(proposal, operations)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(sql, encoding="utf-8", newline="\n")
    print(f"PASS generated dry-run SQL plan: {output}")
    print(f"Operations: {len(operations)}")
    for warning in warnings:
        print(f"WARN {warning}")
    return 0


def command_apply_approved(args: argparse.Namespace) -> int:
    proposal_path = Path(args.proposal)
    proposal = read_json(proposal_path)
    operations, warnings = validate_proposal(proposal, Path(args.basis_dir) if args.basis_dir else None)
    classification = classify_operations(operations)
    risk = classification["risk"]
    max_risk = args.max_risk
    if RISK_ORDER[risk] > RISK_ORDER[max_risk]:
        raise WorkflowError(
            f"Proposal classified as {risk}, above --max-risk {max_risk}. "
            "Use validate-proposal/plan-sql for review, or rerun with an explicit higher max risk after approval."
        )
    if risk == "high" and not args.reviewed_high_risk:
        raise WorkflowError("High-risk proposals require --reviewed-high-risk and should normally stay in review/plan mode")

    sql = generate_sql(proposal, operations)
    verification_sql = generate_targeted_verification_sql(operations)
    execution_requested = bool(args.execute)
    database_url = args.database_url or os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")

    print("PASS proposal validation")
    print(f"Proposal: {proposal.get('proposal_id') or proposal_path.name}")
    print(f"Operations: {len(operations)}")
    print(f"Risk: {risk}")
    print("Tables touched: " + ", ".join(classification["touched_tables"]))
    print("Operation counts: " + json.dumps(classification["operation_counts"], sort_keys=True))
    for reason in classification["reasons"]:
        print(f"Risk note: {reason}")
    for warning in warnings:
        print(f"WARN {warning}")

    if args.print_sql:
        print("\n-- BEGIN GENERATED APPLY SQL --")
        print(sql.rstrip())
        print("-- END GENERATED APPLY SQL --")
    if args.print_verification_sql:
        print("\n-- BEGIN GENERATED VERIFICATION SQL --")
        print(verification_sql.rstrip())
        print("-- END GENERATED VERIFICATION SQL --")

    if not execution_requested:
        print("DRY RUN: no live write performed. Rerun with --execute and a database URL backend to apply.")
        print("Checks prepared: targeted affected-row readbacks" + (" plus duplicate occurrence check" if "event_occurrences" in classification["touched_tables"] or "event_series" in classification["touched_tables"] else ""))
        return 0

    if not database_url:
        raise WorkflowError("Live execution requested, but no --database-url, DATABASE_URL, or SUPABASE_DB_URL is configured")

    apply_result = run_sql_with_psql(sql, database_url)
    if apply_result.returncode != 0:
        if apply_result.stdout:
            print(apply_result.stdout)
        if apply_result.stderr:
            print(apply_result.stderr, file=sys.stderr)
        raise WorkflowError("psql apply failed")
    print("PASS applied generated SQL")
    if apply_result.stdout.strip():
        print(apply_result.stdout.strip())

    verify_result = run_sql_with_psql(verification_sql, database_url)
    if verify_result.returncode != 0:
        if verify_result.stdout:
            print(verify_result.stdout)
        if verify_result.stderr:
            print(verify_result.stderr, file=sys.stderr)
        raise WorkflowError("targeted verification SQL failed")
    print("PASS targeted verification queries completed")
    if verify_result.stdout.strip():
        print(verify_result.stdout.strip())
    print("Temporary SQL artifacts cleaned up")
    return 0


def command_export(args: argparse.Namespace) -> int:
    global ALLOW_INSECURE_LOCAL_DEV_TLS
    ALLOW_INSECURE_LOCAL_DEV_TLS = bool(args.allow_insecure_local_dev_tls)
    output_dir = Path(args.output_dir)
    export_supabase(output_dir)
    verify_export(output_dir)
    print(f"PASS deterministic export written to: {output_dir}")
    return 0


def command_verify_export(args: argparse.Namespace) -> int:
    verify_export(Path(args.output_dir))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    validate = sub.add_parser("validate-proposal", help="Validate a reviewable proposal without writing")
    validate.add_argument("proposal")
    validate.add_argument(
        "--basis-dir",
        help="Use a deterministic Supabase export directory as the validation basis instead of local JSON.",
    )
    validate.set_defaults(func=command_validate)
    plan = sub.add_parser("plan-sql", help="Generate reviewable SQL from a validated proposal")
    plan.add_argument("proposal")
    plan.add_argument("--output", required=True)
    plan.add_argument(
        "--basis-dir",
        help="Use a deterministic Supabase export directory as the validation basis instead of local JSON.",
    )
    plan.set_defaults(func=command_plan)
    apply = sub.add_parser(
        "apply-approved",
        help=(
            "Validate, classify, and optionally apply an approved proposal via a "
            "temporary SQL artifact. Defaults to dry-run."
        ),
    )
    apply.add_argument("proposal")
    apply.add_argument(
        "--basis-dir",
        help="Use a deterministic Supabase export directory as the validation basis instead of local JSON.",
    )
    apply.add_argument(
        "--max-risk",
        choices=["lean", "standard", "high"],
        default="standard",
        help="Refuse proposals classified above this risk level. Default: standard.",
    )
    apply.add_argument(
        "--reviewed-high-risk",
        action="store_true",
        help="Required with --max-risk high before a high-risk proposal can execute.",
    )
    apply.add_argument(
        "--execute",
        action="store_true",
        help="Apply using psql and --database-url/DATABASE_URL/SUPABASE_DB_URL. Omit for dry-run.",
    )
    apply.add_argument(
        "--database-url",
        help="Postgres connection string for psql execution. Prefer an ephemeral/local secret; never commit it.",
    )
    apply.add_argument(
        "--print-sql",
        action="store_true",
        help="Print the exact generated apply SQL for connector-backed execution/review.",
    )
    apply.add_argument(
        "--print-verification-sql",
        action="store_true",
        help="Print targeted post-apply readback SQL.",
    )
    apply.set_defaults(func=command_apply_approved)
    export = sub.add_parser("export-json", help="Export deterministic JSON recovery files from Supabase")
    export.add_argument("--output-dir", default=str(DEFAULT_EXPORT_DIR))
    export.add_argument(
        "--allow-insecure-local-dev-tls",
        action="store_true",
        help=(
            "Bypass local Python TLS verification only for this known dev-machine "
            "certificate issue. Do not use in production automation."
        ),
    )
    export.set_defaults(func=command_export)
    verify = sub.add_parser("verify-export", help="Verify a generated export directory")
    verify.add_argument("output_dir")
    verify.set_defaults(func=command_verify_export)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except (WorkflowError, urllib.error.HTTPError, urllib.error.URLError) as error:
        print(f"FAIL {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
