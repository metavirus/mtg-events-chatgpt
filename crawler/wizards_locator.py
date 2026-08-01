#!/usr/bin/env python3
"""Collect public Wizards Store & Event Locator data around Los Alamitos.

The repository intentionally stores only a public Los Alamitos centroid, never the
user's home address. Routine collection uses the Wizards locator's 25-mile search
radius. Distance remains descriptive rather than a catalog inclusion cutoff.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import requests
import truststore

truststore.inject_into_ssl()

ENDPOINT = "https://api.tabletop.wizards.com/silverbeak-griffin-service/graphql"
PUBLIC_ORIGIN = {
    "label": "Los Alamitos, CA",
    "latitude": 33.8031,
    "longitude": -118.0726,
}
MILES_TO_METERS = 1609.344

QUERY = r"""
query queryEvents(
  $latitude: Float!,
  $longitude: Float!,
  $maxMeters: Int!,
  $tags: [String!]!,
  $sort: EventSearchSortField,
  $sortDirection: EventSearchSortDirection,
  $orgs: [ID!],
  $startDate: DateTime,
  $endDate: DateTime,
  $page: Int,
  $pageSize: Int
) {
  searchEvents(query: {
    latitude: $latitude,
    longitude: $longitude,
    maxMeters: $maxMeters,
    tags: $tags,
    sort: $sort,
    sortDirection: $sortDirection,
    orgs: $orgs,
    startDate: $startDate,
    endDate: $endDate,
    page: $page,
    pageSize: $pageSize
  }) {
    events {
      id
      capacity
      description
      distance
      emailAddress
      hasTop8
      isAdHoc
      isOnline
      latitude
      longitude
      title
      eventTemplateId
      pairingType
      phoneNumber
      requiredTeamSize
      rulesEnforcementLevel
      scheduledStartTime
      startingTableNumber
      status
      tags
      timeZone
      playerSaved
      entryFee { amount currency }
      organization {
        id
        isPremium
        name
        postalAddress
        website
        phoneNumber
        emailAddress
        address
        city
        state
        postalCode
        showEmailInSEL
        showInInternalSearch
      }
      eventFormat { id name }
      cardSet { id }
    }
    pageInfo { page pageSize totalResults }
  }
}
"""


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 3958.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = (
        math.sin(dp / 2) ** 2
        + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    )
    return 2 * radius * math.asin(math.sqrt(a))


def request_page(
    session: requests.Session,
    variables: dict[str, Any],
    retries: int = 4,
) -> dict[str, Any]:
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "origin": "https://locator.wizards.com",
        "referer": "https://locator.wizards.com/",
        "user-agent": "Mozilla/5.0 CommanderResearchBot/1.0",
        "x-wotc-client": (
            "client:locator version:research platform:github-actions"
        ),
    }
    payload = {
        "operationName": "queryEvents",
        "variables": variables,
        "query": QUERY,
    }

    for attempt in range(retries):
        try:
            response = session.post(
                ENDPOINT,
                headers=headers,
                json=payload,
                timeout=45,
            )
            response.raise_for_status()
            data = response.json()
            if data.get("errors"):
                raise RuntimeError(json.dumps(data["errors"], indent=2))
            return data
        except (requests.RequestException, ValueError, RuntimeError) as exc:
            if attempt == retries - 1:
                raise
            delay = 2 ** attempt
            print(f"Retrying in {delay}s after: {exc}", file=sys.stderr)
            time.sleep(delay)

    raise AssertionError("unreachable")


def fetch_all(
    latitude: float,
    longitude: float,
    radius_miles: float,
    start_date: str | None,
    end_date: str | None,
) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    page = 0
    page_size = 200

    with requests.Session() as session:
        while True:
            variables = {
                "latitude": latitude,
                "longitude": longitude,
                "maxMeters": int(radius_miles * MILES_TO_METERS),
                "tags": ["magic:_the_gathering"],
                "sort": "date",
                "sortDirection": "Asc",
                "orgs": [],
                "page": page,
                "pageSize": page_size,
            }
            if start_date is not None:
                variables["startDate"] = start_date
            if end_date is not None:
                variables["endDate"] = end_date
            data = request_page(session, variables)
            result = data["data"]["searchEvents"]
            batch = result.get("events") or []
            events.extend(batch)
            total = int(result["pageInfo"]["totalResults"])

            print(
                f"Fetched page {page}: {len(batch)} events "
                f"({len(events)}/{total})"
            )

            if not batch or len(events) >= total:
                break
            page += 1

    return events


def normalize(
    events: list[dict[str, Any]],
    latitude: float,
    longitude: float,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    organizations: dict[str, dict[str, Any]] = {}
    normalized: list[dict[str, Any]] = []
    commander: list[dict[str, Any]] = []
    retrieved_at = datetime.now(timezone.utc).isoformat()

    for event in events:
        item = dict(event)

        event_id = str(event.get("id") or "").strip()
        organization = event.get("organization") or {}
        organization_id = str(organization.get("id") or "").strip()
        if event_id:
            item["sourceEventId"] = event_id
            item["sourceEventUrl"] = f"https://locator.wizards.com/event/{event_id}"
        if organization_id:
            item["sourceOrganizationId"] = organization_id
            item["sourceStoreKey"] = f"wpn:{organization_id}"
            item["sourceStoreUrl"] = f"https://locator.wizards.com/store/{organization_id}"

        scheduled = event.get("scheduledStartTime")
        event_timezone = event.get("timeZone")
        if scheduled:
            instant = datetime.fromisoformat(str(scheduled).replace("Z", "+00:00"))
            local = instant
            if event_timezone:
                try:
                    local = instant.astimezone(ZoneInfo(str(event_timezone)))
                except Exception:
                    pass
            item["localStartDate"] = local.date().isoformat()
            item["localStartTime"] = local.strftime("%H:%M:%S")
            item["localWeekday"] = local.strftime("%A")

        fee = event.get("entryFee") or {}
        raw_amount = fee.get("amount")
        currency = fee.get("currency") or "USD"
        if raw_amount is not None:
            value = Decimal(str(raw_amount)) / Decimal("100")
            item["entryFeeRawAmount"] = raw_amount
            item["entryFeeMinorUnits"] = int(raw_amount)
            item["entryFeeValue"] = float(value)
            item["entryFeeDisplay"] = "Free" if value == 0 else f"${value:.2f}"
            item["isFree"] = value == 0
            item["entryFeeCurrency"] = currency

        if event.get("latitude") is not None and event.get("longitude") is not None:
            item["calculatedDistanceMiles"] = round(
                haversine_miles(
                    latitude,
                    longitude,
                    float(event["latitude"]),
                    float(event["longitude"]),
                ),
                2,
            )

        searchable = " ".join(
            [
                str(event.get("title") or ""),
                str(event.get("description") or ""),
                " ".join(event.get("tags") or []),
                str((event.get("eventFormat") or {}).get("id") or ""),
            ]
        ).lower()

        item["commanderCandidate"] = any(
            term in searchable for term in ("commander", "edh", "cedh")
        )
        item["isCommander"] = item["commanderCandidate"]
        item["isDraft"] = "draft" in searchable
        item["isPrerelease"] = any(
            term in searchable for term in ("prerelease", "pre-release", "pre release")
        )
        item["retrievedAt"] = retrieved_at
        normalized.append(item)

        if item["commanderCandidate"]:
            commander.append(item)

        org = organization
        org_id = org.get("id")
        if org_id:
            previous = organizations.get(str(org_id), {})
            organizations[str(org_id)] = {
                **org,
                "sourceOrganizationId": str(org_id),
                "sourceStoreKey": f"wpn:{org_id}",
                "sourceStoreUrl": f"https://locator.wizards.com/store/{org_id}",
                "normalizedWebsiteHost": (
                    urlparse(
                        str(org.get("website") or "")
                        if "://" in str(org.get("website") or "")
                        else "https://" + str(org.get("website") or "")
                    ).hostname
                    if org.get("website")
                    else None
                ),
                "latitude": event.get("latitude"),
                "longitude": event.get("longitude"),
                "calculatedDistanceMiles": item.get("calculatedDistanceMiles"),
                "observedEventCount": previous.get("observedEventCount", 0) + 1,
            }

    normalized.sort(
        key=lambda e: (e.get("scheduledStartTime") or "", e.get("title") or "")
    )
    commander.sort(
        key=lambda e: (e.get("scheduledStartTime") or "", e.get("title") or "")
    )
    organization_list = sorted(
        organizations.values(),
        key=lambda org: (
            org.get("calculatedDistanceMiles") or 9999,
            org.get("name") or "",
        ),
    )
    return normalized, commander, organization_list


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--latitude",
        type=float,
        default=float(
            os.getenv("LOCATOR_LATITUDE", PUBLIC_ORIGIN["latitude"])
        ),
    )
    parser.add_argument(
        "--longitude",
        type=float,
        default=float(
            os.getenv("LOCATOR_LONGITUDE", PUBLIC_ORIGIN["longitude"])
        ),
    )
    parser.add_argument(
        "--radius-miles",
        type=float,
        default=float(os.getenv("LOCATOR_RADIUS_MILES", "25")),
    )
    parser.add_argument(
        "--start-date",
        default=os.getenv("LOCATOR_START_DATE"),
    )
    parser.add_argument(
        "--end-date",
        default=os.getenv("LOCATOR_END_DATE"),
    )
    parser.add_argument(
        "--output",
        default="output/wizards",
    )
    args = parser.parse_args()

    events = fetch_all(
        args.latitude,
        args.longitude,
        args.radius_miles,
        args.start_date,
        args.end_date,
    )
    normalized, commander, organizations = normalize(
        events,
        args.latitude,
        args.longitude,
    )

    output = Path(args.output)
    metadata = {
        "retrievedAt": datetime.now(timezone.utc).isoformat(),
        "publicOrigin": PUBLIC_ORIGIN,
        "queryOrigin": {
            "latitude": args.latitude,
            "longitude": args.longitude,
        },
        "radiusMiles": args.radius_miles,
        "startDate": args.start_date,
        "endDate": args.end_date,
        "allEventCount": len(normalized),
        "commanderCandidateCount": len(commander),
        "organizationCount": len(organizations),
        "privacyNote": (
            "No home street address is stored. The default query uses a public "
            "Los Alamitos centroid and a discovery buffer."
        ),
    }

    write_json(output / "metadata.json", metadata)
    write_json(output / "events-all.json", normalized)
    write_json(output / "events-commander.json", commander)
    write_json(output / "organizations.json", organizations)

    print(json.dumps(metadata, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
