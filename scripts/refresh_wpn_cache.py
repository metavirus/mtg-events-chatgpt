#!/usr/bin/env python3
"""Refresh the 25-mile WPN snapshot and atomically cache it in Supabase."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unicodedata
from datetime import datetime, timezone
from urllib.parse import urlparse
from uuid import uuid4
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "wizards"
CRAWLER = ROOT / "crawler" / "wizards_locator.py"
SECRET_URL = ROOT / ".codex-secrets" / "supabase-db-url.txt"
CACHE_ID = "los-alamitos-25mi"
WPN_EVENT_URL = "https://locator.wizards.com/event/{event_id}"
WPN_STORE_URL = "https://locator.wizards.com/store/{organization_id}"
ADAPTER_CONTRACT_VERSION = 4

NO_PROXY_PATTERN = re.compile(
    r"\b(?:no\s+prox(?:y|ies)|prox(?:y|ies)\s+(?:are\s+)?(?:not\s+allowed|prohibited|banned)|"
    r"official\s+(?:wizards\s+)?cards\s+only)\b",
    re.IGNORECASE,
)
PROXY_ALLOWED_PATTERN = re.compile(
    r"\b(?:prox(?:y|ies)\s+(?:are\s+)?(?:allowed|welcome|permitted|okay|ok)|proxy[- ]friendly)\b",
    re.IGNORECASE,
)


def load_json(name: str):
    return json.loads((OUTPUT / name).read_text(encoding="utf-8"))


def database_args() -> list[str]:
    value = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
    if not value and SECRET_URL.exists():
        value = SECRET_URL.read_text(encoding="utf-8").strip()
    if value:
        parsed = urlparse(value)
        if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
            raise SystemExit("SUPABASE_DB_URL is not a valid Postgres connection URL.")
        return ["--db-url", value]
    return ["--linked"]


def run_cli(sql: str) -> str:
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".sql", encoding="utf-8", delete=False
    ) as handle:
        handle.write(sql)
        sql_path = Path(handle.name)
    try:
        command = [
            "supabase", "db", "query", *database_args(),
            "--output-format", "json", "--file", str(sql_path),
        ]
        environment = os.environ.copy()
        environment["SUPABASE_TELEMETRY_DISABLED"] = "1"
        environment["DO_NOT_TRACK"] = "1"
        result = subprocess.run(
            command, cwd=ROOT, env=environment, text=True, capture_output=True, check=False
        )
        combined = "\n".join(part for part in (result.stdout, result.stderr) if part)
        combined = combined.replace("Initialising login role...", "").strip()
        telemetry_shutdown_only = (
            "Timeout while shutting down PostHog" in combined
            and '"rows"' in combined
            and "LegacyDbQueryExecError" not in combined
        )
        if result.returncode != 0 and not telemetry_shutdown_only:
            raise SystemExit(f"Supabase WPN cache write failed:\n{combined}")
        return combined
    finally:
        sql_path.unlink(missing_ok=True)


def rows_from_cli(output: str) -> list[dict]:
    decoder = json.JSONDecoder()
    for match in re.finditer(r"\{", output):
        try:
            value, _ = decoder.raw_decode(output[match.start():])
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict) and isinstance(value.get("rows"), list):
            return value["rows"]
    for match in re.finditer(r"\[", output):
        try:
            value, _ = decoder.raw_decode(output[match.start():])
        except json.JSONDecodeError:
            continue
        if isinstance(value, list):
            return value
    excerpt = output.strip()
    if len(excerpt) > 4000:
        excerpt = f"{excerpt[:2000]}\n\n... truncated {len(output):,} characters ...\n\n{excerpt[-2000:]}"
    raise SystemExit(f"Supabase query returned no readable rows:\n{excerpt}")


def query_rows(sql: str) -> list[dict]:
    return rows_from_cli(run_cli(sql))


def dollar_json(value, tag: str) -> str:
    return f"${tag}${json.dumps(value, ensure_ascii=False, separators=(',', ':'))}${tag}$::jsonb"


def stable_hash(value) -> str:
    encoded = json.dumps(
        value, ensure_ascii=False, separators=(",", ":"), sort_keys=True
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def normalized_text(value) -> str:
    return " ".join(str(value or "").lower().split())


def normalized_title_key(value) -> str:
    """Normalize source titles without guessing that similar titles are identical."""
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.casefold().replace("&", " and ")
    return " ".join(re.sub(r"[^a-z0-9]+", " ", text).split())


def title_schedule_facts(title, local_start_time) -> dict:
    """Expose an exact leading title time without overriding structured schedule data."""
    match = re.match(
        r"^\s*([0-9]{1,2})(?::([0-9]{2}))?\s*(am|pm)\b",
        str(title or ""),
        flags=re.IGNORECASE,
    )
    if not match:
        return {"leadingTitleTime": None, "titleScheduleConflict": False}
    hour = int(match.group(1)) % 12
    if match.group(3).casefold() == "pm":
        hour += 12
    title_time = f"{hour:02d}:{int(match.group(2) or 0):02d}:00"
    structured_time = str(local_start_time or "")[:8] or None
    return {
        "leadingTitleTime": title_time,
        "titleScheduleConflict": bool(
            structured_time and structured_time != title_time
        ),
    }


def event_local_schedule(event: dict) -> dict:
    scheduled_text = str(event.get("scheduledStartTime") or "").strip()
    if not scheduled_text:
        return {"localStartDate": None, "localStartTime": None, "localWeekday": None}
    try:
        scheduled = datetime.fromisoformat(scheduled_text.replace("Z", "+00:00"))
        zone_name = str(event.get("timeZone") or "America/Los_Angeles")
        try:
            local = scheduled.astimezone(ZoneInfo(zone_name))
        except ZoneInfoNotFoundError:
            local = scheduled.astimezone(ZoneInfo("America/Los_Angeles"))
        return {
            "localStartDate": local.date().isoformat(),
            "localStartTime": local.time().replace(microsecond=0).isoformat(),
            "localWeekday": local.strftime("%A"),
        }
    except ValueError:
        return {"localStartDate": None, "localStartTime": None, "localWeekday": None}


def event_promotion_state(event: dict, venue_match_status: str, retrieved_at: str) -> dict:
    """Classify source eligibility without deciding canonical event identity."""
    scheduled_text = str(event.get("scheduledStartTime") or "").strip()
    status = str(event.get("status") or "").strip().upper()
    if venue_match_status != "matched":
        reason = "venue_identity_conflict" if venue_match_status == "conflict" else "unmatched_venue"
    elif not scheduled_text:
        reason = "missing_schedule"
    elif status != "SCHEDULED":
        reason = f"upstream_status_{status.casefold() or 'missing'}"
    else:
        try:
            scheduled = datetime.fromisoformat(scheduled_text.replace("Z", "+00:00"))
            retrieved = datetime.fromisoformat(retrieved_at.replace("Z", "+00:00"))
            reason = "eligible" if scheduled >= retrieved else "already_started_or_past"
        except ValueError:
            reason = "malformed_schedule"
    return {"promotionEligible": reason == "eligible", "promotionEligibility": reason}


def event_field_presence(event: dict) -> dict:
    return {
        field: field in event and event.get(field) is not None
        for field in (
            "capacity", "description", "entryFee", "eventFormat", "cardSet",
            "eventTemplateId", "pairingType", "playerSaved", "requiredTeamSize",
            "rulesEnforcementLevel", "scheduledStartTime", "status", "tags",
            "timeZone", "title",
        )
    }


def event_rule_flags(event: dict) -> dict:
    evidence = " ".join(
        str(value or "") for value in (event.get("title"), event.get("description"))
    )
    return {
        "explicitNoProxy": bool(NO_PROXY_PATTERN.search(evidence)),
        "explicitProxyAllowed": bool(PROXY_ALLOWED_PATTERN.search(evidence)),
    }


def source_hint_keys(
    org_id: str, title_key: str, schedule: dict, template_id=None,
    format_name=None, team_size=None, rule_flags=None,
) -> dict:
    weekday = schedule.get("localWeekday") or "unknown-day"
    local_time = (schedule.get("localStartTime") or "unknown-time")[:5]
    format_key = normalized_title_key(format_name) or "unknown-format"
    team_key = f"team-{team_size}" if team_size is not None else "team-unknown"
    rule_flags = rule_flags or {}
    proxy_key = (
        "no-proxy" if rule_flags.get("explicitNoProxy")
        else "proxy-allowed" if rule_flags.get("explicitProxyAllowed")
        else "proxy-unspecified"
    )
    result = {
        "sourceVenueTitleKey": f"wpn:{org_id}:{title_key}",
        "sourceScheduleLaneKey": f"wpn:{org_id}:{weekday.casefold()}:{local_time}",
        "sourceSeriesHintKey": (
            f"wpn:{org_id}:{title_key}:{weekday.casefold()}:{local_time}:"
            f"{format_key}:{team_key}:{proxy_key}"
        ),
    }
    result["sourceTemplateHintKey"] = (
        f"wpn:{org_id}:template:{template_id}" if template_id else None
    )
    return result


def summarize_series_hints(events: list[dict]) -> dict:
    clusters: dict[str, dict] = {}
    template_clusters: dict[str, dict] = {}
    eligibility: dict[str, int] = {}
    for event in events:
        reason = str(event.get("promotionEligibility") or "unknown")
        eligibility[reason] = eligibility.get(reason, 0) + 1
        if not event.get("promotionEligible"):
            continue
        key = event["sourceSeriesHintKey"]
        cluster = clusters.setdefault(key, {
            "sourceSeriesHintKey": key,
            "sourceOrganizationId": event.get("sourceOrganizationId"),
            "canonicalVenueId": event.get("canonicalVenueId"),
            "normalizedTitleKey": event.get("normalizedTitleKey"),
            "titleSample": event.get("title"),
            "localWeekday": event.get("localWeekday"),
            "localStartTime": event.get("localStartTime"),
            "eventFormatName": (event.get("normalizedFacts") or {}).get("formatName"),
            "eventTemplateIds": [],
            "sourceEventIds": [],
            "firstLocalDate": event.get("localStartDate"),
            "lastLocalDate": event.get("localStartDate"),
            "occurrenceCount": 0,
        })
        cluster["occurrenceCount"] += 1
        cluster["sourceEventIds"].append(event.get("sourceEventId"))
        template_id = event.get("eventTemplateId")
        if template_id and template_id not in cluster["eventTemplateIds"]:
            cluster["eventTemplateIds"].append(template_id)
        local_date = event.get("localStartDate")
        if local_date:
            cluster["firstLocalDate"] = min(cluster["firstLocalDate"] or local_date, local_date)
            cluster["lastLocalDate"] = max(cluster["lastLocalDate"] or local_date, local_date)
        template_key = event.get("sourceTemplateHintKey")
        if template_key:
            template = template_clusters.setdefault(template_key, {
                "sourceTemplateHintKey": template_key,
                "sourceOrganizationId": event.get("sourceOrganizationId"),
                "canonicalVenueId": event.get("canonicalVenueId"),
                "eventTemplateId": event.get("eventTemplateId"),
                "titleSamples": [],
                "sourceSeriesHintKeys": [],
                "sourceEventIds": [],
                "firstLocalDate": event.get("localStartDate"),
                "lastLocalDate": event.get("localStartDate"),
                "occurrenceCount": 0,
            })
            template["occurrenceCount"] += 1
            template["sourceEventIds"].append(event.get("sourceEventId"))
            for field, value in (
                ("titleSamples", event.get("title")),
                ("sourceSeriesHintKeys", event.get("sourceSeriesHintKey")),
            ):
                if value and value not in template[field]:
                    template[field].append(value)
            if local_date:
                template["firstLocalDate"] = min(template["firstLocalDate"] or local_date, local_date)
                template["lastLocalDate"] = max(template["lastLocalDate"] or local_date, local_date)
    ordered = sorted(clusters.values(), key=lambda value: value["sourceSeriesHintKey"])
    ordered_templates = sorted(
        template_clusters.values(), key=lambda value: value["sourceTemplateHintKey"]
    )
    return {
        "adapterContractVersion": ADAPTER_CONTRACT_VERSION,
        "eligibleObservationCount": sum(eligibility.get(key, 0) for key in ("eligible",)),
        "eligibilityCounts": dict(sorted(eligibility.items())),
        "seriesHintClusterCount": len(ordered),
        "repeatedSeriesHintClusterCount": sum(1 for item in ordered if item["occurrenceCount"] > 1),
        "singleOccurrenceSeriesHintClusterCount": sum(1 for item in ordered if item["occurrenceCount"] == 1),
        "seriesHintClusters": ordered,
        "templateHintClusterCount": len(ordered_templates),
        "multiSessionTemplateHintClusterCount": sum(
            1 for item in ordered_templates if len(item["sourceSeriesHintKeys"]) > 1
        ),
        "templateHintClusters": ordered_templates,
    }


def website_host(value) -> str | None:
    text = str(value or "").strip()
    if not text:
        return None
    parsed = urlparse(text if "://" in text else f"https://{text}")
    return (parsed.hostname or "").lower() or None


def field_paths(value, prefix: str = "") -> set[str]:
    paths: set[str] = set()
    if isinstance(value, dict):
        for key, child in value.items():
            path = f"{prefix}.{key}" if prefix else str(key)
            paths.add(path)
            paths.update(field_paths(child, path))
    elif isinstance(value, list):
        for child in value[:25]:
            paths.update(field_paths(child, f"{prefix}[]"))
    return paths


def load_cache_context() -> dict:
    rows = query_rows(
        "select events_all, organizations, metadata, retrieved_at, to_jsonb(c) as cache_row "
        "from public.wpn_snapshot_cache c where id = 'los-alamitos-25mi'"
    )
    return rows[0] if rows else {}


def load_exact_venue_matches() -> dict[str, list[dict]]:
    rows = query_rows(
        "select replace(s.id, 'src-wpn-', '') as organization_id, "
        "es.entity_id as venue_id, v.name as venue_name "
        "from public.sources s "
        "join public.entity_sources es on es.source_id = s.id and es.entity_type = 'venue' "
        "join public.venues v on v.id = es.entity_id "
        "where s.id like 'src-wpn-%' order by organization_id, venue_id"
    )
    result: dict[str, list[dict]] = {}
    for row in rows:
        result.setdefault(str(row["organization_id"]), []).append(row)
    return result


def event_content_fingerprint(event: dict) -> str:
    return stable_hash({
        key: event.get(key)
        for key in (
            "capacity", "description", "entryFee", "eventFormat", "cardSet",
            "eventTemplateId", "hasTop8", "isAdHoc", "isOnline", "latitude",
            "longitude", "pairingType", "requiredTeamSize",
            "rulesEnforcementLevel", "scheduledStartTime", "status", "tags",
            "timeZone", "title",
        )
    })


def enrich_snapshot(
    events: list[dict],
    organizations: list[dict],
    previous: dict,
    exact_matches: dict[str, list[dict]],
    retrieved_at: str,
) -> tuple[list[dict], list[dict], dict, dict, list[dict], dict]:
    previous_events = {
        str(event.get("id")): event
        for event in (previous.get("events_all") or [])
        if event.get("id") is not None
    }
    previous_organizations = {
        str(org.get("id")): org
        for org in (previous.get("organizations") or [])
        if org.get("id") is not None
    }
    previous_row = previous.get("cache_row") or {}
    previous_state = previous_row.get("event_observation_state") or {}
    previous_inventory = previous_row.get("field_inventory") or {}
    now = datetime.fromisoformat(retrieved_at.replace("Z", "+00:00"))

    enriched_organizations: list[dict] = []
    organization_lookup: dict[str, dict] = {}
    findings: list[dict] = []
    for org in organizations:
        item = dict(org)
        org_id = str(org.get("id") or org.get("sourceOrganizationId") or "").strip()
        if not org_id:
            continue
        matches = exact_matches.get(org_id, [])
        identity_basis = {
            "name": normalized_text(org.get("name")),
            "address": normalized_text(org.get("postalAddress") or org.get("address")),
            "websiteHost": website_host(org.get("website")),
            "latitude": org.get("latitude"),
            "longitude": org.get("longitude"),
        }
        item.update({
            "sourceOrganizationId": org_id,
            "sourceStoreKey": f"wpn:{org_id}",
            "sourceStoreUrl": WPN_STORE_URL.format(organization_id=org_id),
            "normalizedWebsiteHost": identity_basis["websiteHost"],
            "identityFingerprintVersion": 1,
            "identityFingerprint": stable_hash(identity_basis),
            "canonicalVenueId": matches[0]["venue_id"] if len(matches) == 1 else None,
            "canonicalVenueName": matches[0]["venue_name"] if len(matches) == 1 else None,
            "venueMatchStatus": "matched" if len(matches) == 1 else ("conflict" if matches else "unmatched"),
            "venueMatchMethod": "exact_wpn_source_link" if len(matches) == 1 else None,
            "venueMatchConfidence": "exact" if len(matches) == 1 else None,
        })
        enriched_organizations.append(item)
        organization_lookup[org_id] = item
        if len(matches) > 1:
            findings.append({
                "deduplicationKey": f"wpn:identity-conflict:{org_id}",
                "itemType": "correction", "priority": 90,
                "title": f"WPN organization {org_id} maps to multiple venues",
                "summary": f"{org.get('name') or org_id} has conflicting exact WPN source links and needs identity review.",
                "relatedEntityType": "other", "relatedEntityId": f"wpn:{org_id}",
                "details": {"rule": "identity_conflict", "organization": item, "matches": matches},
            })
        elif org_id not in previous_organizations and not matches and previous_organizations:
            findings.append({
                "deduplicationKey": f"wpn:new-organization:{org_id}",
                "itemType": "source_lead", "priority": 65,
                "title": f"New WPN venue: {org.get('name') or org_id}",
                "summary": "A WPN organization not present in the prior snapshot appeared and is not matched to a canonical venue.",
                "relatedEntityType": "other", "relatedEntityId": f"wpn:{org_id}",
                "details": {"rule": "new_unmatched_organization", "organization": item},
            })

    enriched_events: list[dict] = []
    current_ids: set[str] = set()
    duplicate_ids: set[str] = set()
    new_ids: list[str] = []
    changed_ids: list[str] = []
    unchanged_ids: list[str] = []
    event_state: dict[str, dict] = {}
    for event in events:
        event_id = str(event.get("id") or event.get("sourceEventId") or "").strip()
        if not event_id:
            findings.append({
                "deduplicationKey": f"wpn:malformed-event:{stable_hash(event)[:24]}",
                "itemType": "app_issue", "priority": 85,
                "title": "WPN event arrived without an event ID",
                "summary": "The ingest skipped stable event identity for one malformed upstream record.",
                "relatedEntityType": "app", "relatedEntityId": "wpn-ingest",
                "details": {"rule": "missing_event_id", "event": event},
            })
            continue
        if event_id in current_ids:
            duplicate_ids.add(event_id)
        current_ids.add(event_id)
        org_id = str((event.get("organization") or {}).get("id") or event.get("sourceOrganizationId") or "")
        org = organization_lookup.get(org_id, {})
        item = dict(event)
        schedule = event_local_schedule(event)
        title_key = normalized_title_key(event.get("title")) or "untitled"
        rule_flags = event_rule_flags(event)
        event_format = event.get("eventFormat") or {}
        entry_fee = event.get("entryFee") or {}
        title_schedule = title_schedule_facts(
            event.get("title"), schedule.get("localStartTime")
        )
        item.update({
            "adapterContractVersion": ADAPTER_CONTRACT_VERSION,
            "source": "wpn_eventlink",
            "sourceEventId": event_id,
            "sourceEventUrl": WPN_EVENT_URL.format(event_id=event_id),
            "sourceOrganizationId": org_id or None,
            "sourceStoreUrl": WPN_STORE_URL.format(organization_id=org_id) if org_id else None,
            "canonicalVenueId": org.get("canonicalVenueId"),
            "venueMatchStatus": org.get("venueMatchStatus", "unmatched"),
            "venueMatchMethod": org.get("venueMatchMethod"),
            "venueMatchConfidence": org.get("venueMatchConfidence"),
            "normalizedTitleKey": title_key,
            **schedule,
            **source_hint_keys(
                org_id or "unknown", title_key, schedule, event.get("eventTemplateId"),
                event_format.get("name"), event.get("requiredTeamSize"), rule_flags,
            ),
            **event_promotion_state(event, org.get("venueMatchStatus", "unmatched"), retrieved_at),
            "fieldPresence": event_field_presence(event),
            "rulesFlags": rule_flags,
            "normalizedFacts": {
                "formatId": event_format.get("id"),
                "formatName": event_format.get("name"),
                "feeAmount": entry_fee.get("amount"),
                "feeCurrency": entry_fee.get("currency"),
                "isFree": event.get("isFree") if "isFree" in event else entry_fee.get("amount") == 0,
                "capacity": event.get("capacity"),
                "teamSize": event.get("requiredTeamSize"),
                "rulesEnforcementLevel": event.get("rulesEnforcementLevel"),
                "pairingType": event.get("pairingType"),
                "templateId": event.get("eventTemplateId") or None,
                "cardSetId": (event.get("cardSet") or {}).get("id"),
                "playerSaved": event.get("playerSaved"),
                "isOnline": event.get("isOnline"),
                "explicitNoProxy": rule_flags["explicitNoProxy"],
                "explicitProxyAllowed": rule_flags["explicitProxyAllowed"],
                **title_schedule,
            },
        })
        item["eventIdentityFingerprintVersion"] = 1
        item["eventIdentityFingerprint"] = stable_hash({
            "organizationId": org_id,
            "scheduledStartTime": event.get("scheduledStartTime"),
            "title": normalized_text(event.get("title")),
        })
        item["eventContentFingerprintVersion"] = 1
        item["eventContentFingerprint"] = event_content_fingerprint(event)
        enriched_events.append(item)
        prior = previous_events.get(event_id)
        prior_state = previous_state.get(event_id) or {}
        if prior is None and not prior_state:
            new_ids.append(event_id)
        elif (
            event_content_fingerprint(prior) if prior
            else prior_state.get("lastContentFingerprint")
        ) != item["eventContentFingerprint"]:
            changed_ids.append(event_id)
            prior_org_id = str(
                ((prior or {}).get("organization") or {}).get("id")
                or (prior or {}).get("sourceOrganizationId")
                or prior_state.get("organizationId")
                or ""
            )
            if prior_org_id and org_id and prior_org_id != org_id:
                findings.append({
                    "deduplicationKey": f"wpn:event-organization-move:{event_id}:{org_id}",
                    "itemType": "correction", "priority": 85,
                    "title": f"WPN event {event_id} changed organizations",
                    "summary": "An existing WPN event ID moved to a different organization and needs attribution review.",
                    "relatedEntityType": "other", "relatedEntityId": f"wpn-event:{event_id}",
                    "details": {"rule": "event_organization_changed", "beforeOrganizationId": prior_org_id, "afterOrganizationId": org_id, "event": item},
                })
        else:
            unchanged_ids.append(event_id)
        event_state[event_id] = {
            "firstSeenAt": prior_state.get("firstSeenAt") or retrieved_at,
            "lastSeenAt": retrieved_at,
            "seenCount": int(prior_state.get("seenCount") or (1 if prior else 0)) + 1,
            "consecutiveMissing": 0,
            "lastContentFingerprint": item["eventContentFingerprint"],
            "scheduledStartTime": event.get("scheduledStartTime"),
            "organizationId": org_id or None,
            "lastEventSummary": {
                "id": event_id,
                "title": event.get("title"),
                "scheduledStartTime": event.get("scheduledStartTime"),
                "sourceEventUrl": WPN_EVENT_URL.format(event_id=event_id),
                "sourceOrganizationId": org_id or None,
            },
        }

    for event_id in sorted(duplicate_ids):
        findings.append({
            "deduplicationKey": f"wpn:duplicate-event-id:{event_id}",
            "itemType": "app_issue", "priority": 90,
            "title": f"Duplicate WPN event ID {event_id}",
            "summary": "The current WPN response contains the same event ID more than once.",
            "relatedEntityType": "other", "relatedEntityId": f"wpn-event:{event_id}",
            "details": {"rule": "duplicate_event_id", "eventId": event_id},
        })

    missing_future_ids: list[str] = []
    confirmed_missing_ids: list[str] = []
    for event_id in sorted(set(previous_events) | set(previous_state)):
        if event_id in current_ids:
            continue
        stored_state = previous_state.get(event_id) or {}
        prior = previous_events.get(event_id) or stored_state.get("lastEventSummary") or {}
        scheduled_text = prior.get("scheduledStartTime") or stored_state.get("scheduledStartTime")
        if not scheduled_text:
            continue
        scheduled = datetime.fromisoformat(str(scheduled_text).replace("Z", "+00:00"))
        if scheduled <= now:
            continue
        missing_future_ids.append(event_id)
        prior_state = stored_state or {
            "firstSeenAt": previous.get("retrieved_at") or retrieved_at,
            "lastSeenAt": previous.get("retrieved_at") or retrieved_at,
            "seenCount": 1,
            "consecutiveMissing": 0,
            "lastContentFingerprint": event_content_fingerprint(prior),
            "scheduledStartTime": scheduled_text,
            "organizationId": str((prior.get("organization") or {}).get("id") or "") or None,
            "lastEventSummary": {
                "id": event_id,
                "title": prior.get("title"),
                "scheduledStartTime": scheduled_text,
                "sourceEventUrl": WPN_EVENT_URL.format(event_id=event_id),
                "sourceOrganizationId": str((prior.get("organization") or {}).get("id") or "") or None,
            },
        }
        missing_count = int(prior_state.get("consecutiveMissing") or 0) + 1
        prior_state["consecutiveMissing"] = missing_count
        event_state[event_id] = prior_state
        if missing_count >= 2:
            confirmed_missing_ids.append(event_id)
            findings.append({
                "deduplicationKey": f"wpn:future-event-missing:{event_id}",
                "itemType": "research_finding", "priority": 60,
                "title": f"Future WPN event {event_id} missing twice",
                "summary": "A previously scheduled future event is absent from two consecutive WPN snapshots and may need reconciliation.",
                "relatedEntityType": "other", "relatedEntityId": f"wpn-event:{event_id}",
                "details": {"rule": "future_event_missing_twice", "event": prior, "consecutiveMissing": missing_count},
            })

    current_event_paths = sorted(field_paths(events))
    current_org_paths = sorted(field_paths(organizations))
    field_inventory = {"eventPaths": current_event_paths, "organizationPaths": current_org_paths}
    if previous_inventory:
        added_event_paths = sorted(set(current_event_paths) - set(previous_inventory.get("eventPaths") or []))
        added_org_paths = sorted(set(current_org_paths) - set(previous_inventory.get("organizationPaths") or []))
        for scope, paths in (("event", added_event_paths), ("organization", added_org_paths)):
            for path in paths:
                findings.append({
                    "deduplicationKey": f"wpn:new-field:{scope}:{path}",
                    "itemType": "app_issue", "priority": 55,
                    "title": f"New WPN {scope} field: {path}",
                    "summary": "The upstream WPN response contains a field not present in the prior field inventory.",
                    "relatedEntityType": "app", "relatedEntityId": "wpn-ingest",
                    "details": {"rule": "upstream_field_added", "scope": scope, "fieldPath": path},
                })

    previous_count = len(previous_events)
    if previous_count >= 20 and len(missing_future_ids) > max(50, int(previous_count * 0.2)):
        findings.append({
            "deduplicationKey": f"wpn:large-future-disappearance:{retrieved_at[:10]}",
            "itemType": "app_issue", "priority": 95,
            "title": "Large WPN future-event disappearance",
            "summary": f"{len(missing_future_ids)} future events disappeared in one snapshot; treat this as an ingest anomaly until reviewed.",
            "relatedEntityType": "app", "relatedEntityId": "wpn-ingest",
            "details": {"rule": "large_future_disappearance", "previousCount": previous_count, "missingFutureCount": len(missing_future_ids)},
        })

    matched_orgs = sum(1 for org in enriched_organizations if org.get("venueMatchStatus") == "matched")
    series_hints = summarize_series_hints(enriched_events)
    delta = {
        "newEventCount": len(new_ids), "newEventIds": new_ids,
        "changedEventCount": len(changed_ids), "changedEventIds": changed_ids,
        "unchangedEventCount": len(unchanged_ids),
        "missingFutureEventCount": len(missing_future_ids), "missingFutureEventIds": missing_future_ids,
        "confirmedMissingEventCount": len(confirmed_missing_ids), "confirmedMissingEventIds": confirmed_missing_ids,
        "matchedOrganizationCount": matched_orgs,
        "unmatchedOrganizationCount": len(enriched_organizations) - matched_orgs,
        "adapterContractVersion": ADAPTER_CONTRACT_VERSION,
        "promotionEligibilityCounts": series_hints["eligibilityCounts"],
        "eligibleObservationCount": series_hints["eligibleObservationCount"],
        "seriesHintClusterCount": series_hints["seriesHintClusterCount"],
        "repeatedSeriesHintClusterCount": series_hints["repeatedSeriesHintClusterCount"],
        "singleOccurrenceSeriesHintClusterCount": series_hints["singleOccurrenceSeriesHintClusterCount"],
        "seriesHintClusters": series_hints["seriesHintClusters"],
        "templateHintClusterCount": series_hints["templateHintClusterCount"],
        "multiSessionTemplateHintClusterCount": series_hints["multiSessionTemplateHintClusterCount"],
        "templateHintClusters": series_hints["templateHintClusters"],
        "findingCount": len(findings),
    }
    return enriched_events, enriched_organizations, event_state, field_inventory, findings, delta


def build_sql(
    metadata: dict, events_all: list[dict], events_commander: list[dict],
    organizations: list[dict], enriched_events: list[dict],
    enriched_organizations: list[dict], event_state: dict,
    field_inventory: dict, delta: dict, findings: list[dict], digest: str,
) -> str:
    tag = "wpn_" + uuid4().hex
    findings_json = dollar_json(findings, tag + "_findings")
    return f"""
with cached as (
insert into public.wpn_snapshot_cache (
  id, retrieved_at, origin_label, origin_latitude, origin_longitude, radius_miles,
  all_event_count, commander_candidate_count, organization_count,
  metadata, events_all, events_commander, organizations, content_sha256,
  enriched_events, enriched_organizations, event_observation_state,
  field_inventory, delta_summary
) values (
  '{CACHE_ID}', '{metadata['retrievedAt']}'::timestamptz,
  {dollar_json(metadata['publicOrigin']['label'], tag + '_label')} #>> '{{}}',
  {float(metadata['publicOrigin']['latitude'])}, {float(metadata['publicOrigin']['longitude'])}, 25,
  {len(events_all)}, {len(events_commander)}, {len(organizations)},
  {dollar_json(metadata, tag + '_meta')},
  {dollar_json(events_all, tag + '_all')},
  {dollar_json(events_commander, tag + '_cmdr')},
  {dollar_json(organizations, tag + '_orgs')},
  '{digest}',
  {dollar_json(enriched_events, tag + '_enriched_events')},
  {dollar_json(enriched_organizations, tag + '_enriched_orgs')},
  {dollar_json(event_state, tag + '_state')},
  {dollar_json(field_inventory, tag + '_inventory')},
  {dollar_json(delta, tag + '_delta')}
)
on conflict (id) do update set
  retrieved_at = excluded.retrieved_at,
  origin_label = excluded.origin_label,
  origin_latitude = excluded.origin_latitude,
  origin_longitude = excluded.origin_longitude,
  radius_miles = excluded.radius_miles,
  all_event_count = excluded.all_event_count,
  commander_candidate_count = excluded.commander_candidate_count,
  organization_count = excluded.organization_count,
  metadata = excluded.metadata,
  events_all = excluded.events_all,
  events_commander = excluded.events_commander,
  organizations = excluded.organizations,
  content_sha256 = excluded.content_sha256,
  enriched_events = excluded.enriched_events,
  enriched_organizations = excluded.enriched_organizations,
  event_observation_state = excluded.event_observation_state,
  field_inventory = excluded.field_inventory,
  delta_summary = excluded.delta_summary
returning id
), finding_payload as (
  select value as finding from jsonb_array_elements({findings_json})
), finding_upsert as (
  insert into public.coordination_items (
    origin, target, item_type, status, priority, title, summary, details,
    related_entity_type, related_entity_id, observed_at, recommended_action,
    deduplication_key
  )
  select 'automation', 'codex', finding->>'itemType', 'new',
    (finding->>'priority')::smallint, finding->>'title', finding->>'summary',
    coalesce(finding->'details', '{{}}'::jsonb) || jsonb_build_object(
      'inboxKind', 'wpn_ingest_finding', 'firstSeenAt', '{metadata['retrievedAt']}',
      'lastSeenAt', '{metadata['retrievedAt']}', 'occurrenceCount', 1
    ), finding->>'relatedEntityType', finding->>'relatedEntityId',
    '{metadata['retrievedAt']}'::timestamptz,
    'Review the cached WPN record and promote only if it changes canonical research truth.',
    finding->>'deduplicationKey'
  from finding_payload
  on conflict (deduplication_key) do update set
    updated_at = now(), observed_at = excluded.observed_at,
    title = excluded.title, summary = excluded.summary,
    details = public.coordination_items.details || excluded.details || jsonb_build_object(
      'firstSeenAt', coalesce(public.coordination_items.details->>'firstSeenAt', excluded.details->>'firstSeenAt'),
      'lastSeenAt', excluded.details->>'lastSeenAt',
      'occurrenceCount', coalesce((public.coordination_items.details->>'occurrenceCount')::integer, 0) + 1
    )
  returning id
)
select cached.id, {len(findings)}::integer as finding_count,
       {dollar_json(delta, tag + '_result_delta')} as delta_summary,
       (select count(*) from finding_upsert) as finding_rows_touched
from cached;
"""


def build_legacy_sql(
    metadata: dict, events_all: list[dict], events_commander: list[dict],
    organizations: list[dict], digest: str,
) -> str:
    """Keep the deployed refresh safe until the enrichment migration lands."""
    tag = "wpn_legacy_" + uuid4().hex
    return f"""
with cached as (
insert into public.wpn_snapshot_cache (
  id, retrieved_at, origin_label, origin_latitude, origin_longitude, radius_miles,
  all_event_count, commander_candidate_count, organization_count,
  metadata, events_all, events_commander, organizations, content_sha256
) values (
  '{CACHE_ID}', '{metadata['retrievedAt']}'::timestamptz,
  {dollar_json(metadata['publicOrigin']['label'], tag + '_label')} #>> '{{}}',
  {float(metadata['publicOrigin']['latitude'])}, {float(metadata['publicOrigin']['longitude'])}, 25,
  {len(events_all)}, {len(events_commander)}, {len(organizations)},
  {dollar_json(metadata, tag + '_meta')},
  {dollar_json(events_all, tag + '_all')},
  {dollar_json(events_commander, tag + '_cmdr')},
  {dollar_json(organizations, tag + '_orgs')}, '{digest}'
)
on conflict (id) do update set
  retrieved_at = excluded.retrieved_at, origin_label = excluded.origin_label,
  origin_latitude = excluded.origin_latitude, origin_longitude = excluded.origin_longitude,
  radius_miles = excluded.radius_miles, all_event_count = excluded.all_event_count,
  commander_candidate_count = excluded.commander_candidate_count,
  organization_count = excluded.organization_count, metadata = excluded.metadata,
  events_all = excluded.events_all, events_commander = excluded.events_commander,
  organizations = excluded.organizations, content_sha256 = excluded.content_sha256
returning id, content_sha256
)
select * from cached;
"""


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch the normalized WPN feed, upsert its Supabase cache row, and verify it."
    )
    parser.add_argument("--force", action="store_true", help="Refresh even if the local snapshot is under 24 hours old.")
    parser.add_argument("--max-age-hours", type=float, default=24.0)
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Read current Supabase context and print the enriched delta plan without writing."
    )
    args = parser.parse_args()

    metadata_path = OUTPUT / "metadata.json"
    should_fetch = args.force or not metadata_path.exists()
    if not should_fetch:
        metadata = load_json("metadata.json")
        retrieved = datetime.fromisoformat(metadata["retrievedAt"].replace("Z", "+00:00"))
        age_hours = (datetime.now(timezone.utc) - retrieved).total_seconds() / 3600
        should_fetch = age_hours >= args.max_age_hours

    if should_fetch:
        subprocess.run(
            [sys.executable, str(CRAWLER), "--radius-miles", "25", "--output", str(OUTPUT)],
            cwd=ROOT,
            check=True,
        )

    metadata = load_json("metadata.json")
    events_all = load_json("events-all.json")
    events_commander = load_json("events-commander.json")
    organizations = load_json("organizations.json")
    if float(metadata["radiusMiles"]) != 25.0:
        raise SystemExit("Refusing to cache a non-canonical WPN radius.")
    expected = (
        ("allEventCount", len(events_all)),
        ("commanderCandidateCount", len(events_commander)),
        ("organizationCount", len(organizations)),
    )
    for field, actual in expected:
        if int(metadata[field]) != actual:
            raise SystemExit(f"WPN snapshot count mismatch for {field}: metadata={metadata[field]}, actual={actual}")

    canonical = json.dumps(
        {"metadata": metadata, "eventsAll": events_all, "eventsCommander": events_commander, "organizations": organizations},
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    digest = hashlib.sha256(canonical).hexdigest()
    previous = load_cache_context()
    exact_matches = load_exact_venue_matches()
    (
        enriched_events, enriched_organizations, event_state,
        field_inventory, findings, delta,
    ) = enrich_snapshot(
        events_all, organizations, previous, exact_matches, metadata["retrievedAt"]
    )
    enriched_schema_ready = "enriched_events" in (previous.get("cache_row") or {})
    previous_row = previous.get("cache_row") or {}
    previous_contract = (previous_row.get("delta_summary") or {}).get(
        "adapterContractVersion"
    )
    cache_is_current = (
        enriched_schema_ready
        and previous_row.get("content_sha256") == digest
        and previous_contract == ADAPTER_CONTRACT_VERSION
    )
    sql = build_sql(
        metadata, events_all, events_commander, organizations,
        enriched_events, enriched_organizations, event_state,
        field_inventory, delta, findings, digest,
    )
    if args.dry_run:
        compact_delta = {
            "newEventCount": delta["newEventCount"],
            "newEventIdsSample": delta["newEventIds"][:10],
            "changedEventCount": delta["changedEventCount"],
            "changedEventIdsSample": delta["changedEventIds"][:10],
            "unchangedEventCount": delta["unchangedEventCount"],
            "missingFutureEventCount": delta["missingFutureEventCount"],
            "missingFutureEventIdsSample": delta["missingFutureEventIds"][:10],
            "confirmedMissingEventCount": delta["confirmedMissingEventCount"],
            "confirmedMissingEventIdsSample": delta["confirmedMissingEventIds"][:10],
            "matchedOrganizationCount": delta["matchedOrganizationCount"],
            "unmatchedOrganizationCount": delta["unmatchedOrganizationCount"],
            "eligibleObservationCount": delta["eligibleObservationCount"],
            "promotionEligibilityCounts": delta["promotionEligibilityCounts"],
            "seriesHintClusterCount": delta["seriesHintClusterCount"],
            "repeatedSeriesHintClusterCount": delta["repeatedSeriesHintClusterCount"],
            "singleOccurrenceSeriesHintClusterCount": delta["singleOccurrenceSeriesHintClusterCount"],
            "templateHintClusterCount": delta["templateHintClusterCount"],
            "multiSessionTemplateHintClusterCount": delta["multiSessionTemplateHintClusterCount"],
            "findingCount": delta["findingCount"],
        }
        print("WPN INGEST PLAN — NO WRITE")
        print(json.dumps({
            "retrievedAt": metadata["retrievedAt"],
            "eventCount": len(enriched_events),
            "organizationCount": len(enriched_organizations),
            "delta": compact_delta,
            "findingSamples": [
                {
                    "deduplicationKey": finding.get("deduplicationKey"),
                    "itemType": finding.get("itemType"),
                    "priority": finding.get("priority"),
                    "title": finding.get("title"),
                }
                for finding in findings[:10]
            ],
            "matchedOrganizations": [
                {"sourceOrganizationId": org["sourceOrganizationId"], "canonicalVenueId": org.get("canonicalVenueId")}
                for org in enriched_organizations if org.get("canonicalVenueId")
            ][:5],
            "seriesHintSamples": delta["seriesHintClusters"][:5],
            "templateHintSamples": delta["templateHintClusters"][:3],
        }, indent=2, ensure_ascii=False))
        return 0
    if cache_is_current:
        print(
            "WPN CACHE UNCHANGED — raw snapshot and adapter contract already cached; "
            "no Supabase write needed"
        )
        print(f"Retrieved: {metadata['retrievedAt']}")
        print(f"SHA-256: {digest}")
        return 0
    if not enriched_schema_ready:
        sql = build_legacy_sql(
            metadata, events_all, events_commander, organizations, digest
        )
        print(
            "WPN enrichment migration is not deployed; using the existing safe cache write."
        )
    output = run_cli(sql)
    required = [CACHE_ID, digest] if not enriched_schema_ready else [CACHE_ID, str(len(findings))]
    if not all(item in output for item in required):
        raise SystemExit(f"WPN cache verification did not return expected values:\n{output}")
    print(f"WPN CACHE READY — {len(events_all)} events, {len(events_commander)} Commander candidates, {len(organizations)} organizations")
    print(
        "Delta: "
        f"{delta['newEventCount']} new, {delta['changedEventCount']} changed, "
        f"{delta['missingFutureEventCount']} missing future, {len(findings)} findings"
    )
    print(f"Retrieved: {metadata['retrievedAt']}")
    print(f"SHA-256: {digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
