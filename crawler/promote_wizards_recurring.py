#!/usr/bin/env python3
"""Promote repeated Wizards Commander listings from the review report.

This is intentionally a review step, not part of the weekly raw-data refresh.
It promotes explicit recurring listings in the outer discovery ring while
leaving one-off events and organizations without repeated schedules untouched.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REVIEW_DATE = "2026-07-14"
MIN_DISTANCE = 15.0
# This is the outer edge of the snapshot currently being reconciled, not a
# product inclusion cutoff. Routine Wizards searches use 25 miles; credible
# farther results discovered incidentally may still be curated.
MAX_DISTANCE = 26.0


def load(name: str):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def save(name: str, value) -> None:
    (ROOT / name).write_text(
        json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def slug(value: str) -> str:
    value = value.lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def city_from_address(address: str) -> str:
    match = re.search(r",\s*([^,]+),\s*CA(?:\s|,)", address, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    for city in (
        "Manhattan Beach",
        "Mission Viejo",
        "San Dimas",
        "La Puente",
        "Los Angeles",
        "Pasadena",
        "Arcadia",
    ):
        if re.search(rf"\b{re.escape(city)},\s*CA\b", address, re.IGNORECASE):
            return city
    return ""


def main() -> None:
    stores = load("stores.json")
    events = load("events.json")
    sources = load("sources.json")
    changes = load("changes.json")
    report = load("research/wizards-reconciliation-2026-07-14.json")
    raw_orgs = {str(item["id"]): item for item in load("output/wizards/organizations.json")}

    expansion_base_stores = 0
    expansion_base_events = 0
    if report.get("secondPass"):
        prior = report["secondPass"]
        if prior.get("maxDistanceMiles", MAX_DISTANCE) < MAX_DISTANCE:
            expansion_base_stores = prior["newStoreCount"]
            expansion_base_events = prior["newEventCount"]
            for item in report["organizations"]:
                if item.get("decision") == "promoted-second-pass":
                    item["decision"] = "review-later"
            del report["secondPass"]
        else:
            prior = report["secondPass"]
        if report.get("secondPass") and prior.get("maxDistanceMiles") != MAX_DISTANCE:
            excluded = [
                item
                for item in report["organizations"]
                if item.get("decision") == "promoted-second-pass"
                and float(item["distanceMiles"]) > MAX_DISTANCE
            ]
            excluded_source_ids = {
                f"src-wpn-{item['organizationId']}" for item in excluded
            }
            excluded_store_ids = {
                slug(item["name"])
                for item in excluded
                if any(
                    store["id"] == slug(item["name"])
                    and store.get("researchStatus") == "wizards-discovery"
                    for store in stores
                )
            }
            removed_events = sum(
                1 for event in events if event["sourceId"] in excluded_source_ids
            )
            events = [event for event in events if event["sourceId"] not in excluded_source_ids]
            stores = [store for store in stores if store["id"] not in excluded_store_ids]
            sources = [source for source in sources if source["id"] not in excluded_source_ids]
            for item in excluded:
                item["decision"] = "review-later"
                item["reason"] = "Outside the curated 25-mile Wizards radius."
            excluded_org_ids = {str(item["organizationId"]) for item in excluded}
            report["promotedOrganizationIds"] = [
                value
                for value in report["promotedOrganizationIds"]
                if str(value) not in excluded_org_ids
            ]
            prior["rule"] = f"Promote repeated explicit Commander/EDH/cEDH listings from more than 15 through {MAX_DISTANCE:g} miles; retain one-offs and farther listings for review."
            prior["maxDistanceMiles"] = MAX_DISTANCE
            prior["organizationCount"] -= len(excluded)
            prior["newStoreCount"] -= len(excluded_store_ids)
            prior["newEventCount"] -= removed_events
            for change in changes:
                if change["id"] == "wizards-outer-ring-reconciliation-2026-07-14":
                    change["summary"] = (
                        f"Promoted {prior['newStoreCount']} additional stores and "
                        f"{prior['newEventCount']} recurring Commander events from repeated "
                        "Wizards listings in the 15–25 mile discovery ring."
                    )
            save("stores.json", stores)
            save("events.json", events)
            save("sources.json", sources)
            save("changes.json", changes)
            save("research/wizards-reconciliation-2026-07-14.json", report)
            print(f"Applied 25-mile boundary; removed {len(excluded)} organizations and {removed_events} events.")
            return
        if report.get("secondPass"):
            print(
            "Second pass already applied: "
            f"{prior['organizationCount']} organizations, {prior['newStoreCount']} new stores, "
            f"and {prior['newEventCount']} new events."
            )
            return

    stores_by_name = {slug(item["name"]): item for item in stores}
    event_ids = {item["id"] for item in events}
    source_ids = {item["id"] for item in sources}
    promoted_ids = set(report.get("promotedOrganizationIds", []))
    new_store_count = 0
    new_event_count = 0
    promoted_count = 0

    for item in report["organizations"]:
        distance = float(item["distanceMiles"])
        recurring = [event for event in item.get("candidateRecurringEvents", []) if event["count"] >= 2]
        if (
            item.get("decision") != "review-later"
            or not (MIN_DISTANCE < distance <= MAX_DISTANCE)
            or not recurring
        ):
            continue

        org_id = str(item["organizationId"])
        raw = raw_orgs[org_id]
        source_id = f"src-wpn-{org_id}"
        store_key = slug(item["name"])
        store = stores_by_name.get(store_key)

        if store is None:
            store_id = store_key
            total_observations = sum(event["count"] for event in recurring)
            activity = 4 if total_observations >= 8 else 3
            reliability = 4 if max(event["count"] for event in recurring) >= 4 else 3
            website = raw.get("website") or ""
            store = {
                "id": store_id,
                "name": item["name"],
                "city": city_from_address(item["address"]),
                "address": item["address"],
                "phone": "",
                "website": website,
                "eventsUrl": f"https://locator.wizards.com/store/{org_id}",
                "instagram": website if "instagram.com" in website else "",
                "wpnPremium": bool(raw.get("isPremium", False)),
                "distanceMiles": distance,
                "status": "open",
                "lastVerified": REVIEW_DATE,
                "researchStatus": "wizards-discovery",
                "assessment": {
                    "commanderActivity": activity,
                    "meetupAccessibility": 3,
                    "communityContinuity": 3,
                    "newPlayerIntegration": 3,
                    "physicalEnvironment": 3,
                    "scheduleReliability": reliability,
                    "homeGroupPotential": 3,
                },
                "assessmentNotes": (
                    "Added from repeated explicit Wizards Store & Event Locator Commander "
                    "listings in the 15–26 mile discovery ring. Needs follow-up verification "
                    "against store-controlled sources and community reports."
                ),
                "sourceIds": [source_id],
            }
            stores.append(store)
            stores_by_name[store_key] = store
            new_store_count += 1
        else:
            store_id = store["id"]
            if source_id not in store["sourceIds"]:
                store["sourceIds"].append(source_id)
            if store.get("distanceMiles") is None:
                store["distanceMiles"] = distance
            store["lastVerified"] = REVIEW_DATE

        if source_id not in source_ids:
            sources.append(
                {
                    "id": source_id,
                    "label": f"Wizards Store & Event Locator — {item['name']}",
                    "url": f"https://locator.wizards.com/store/{org_id}",
                    "type": "wpn",
                    "lastChecked": REVIEW_DATE,
                }
            )
            source_ids.add(source_id)

        for candidate in recurring:
            event_id = slug(
                f"{store_id}-{candidate['title']}-{candidate['dayOfWeek']}-{candidate['startTime']}"
            )
            if event_id in event_ids:
                continue
            title_lower = candidate["title"].lower()
            event_type = "competitive" if "cedh" in title_lower else "casual"
            if "draft" in title_lower:
                event_type = "limited"
            events.append(
                {
                    "id": event_id,
                    "storeId": store_id,
                    "title": candidate["title"],
                    "format": "Commander",
                    "eventType": event_type,
                    "bracket": "unspecified",
                    "recurrence": {
                        "frequency": "weekly",
                        "dayOfWeek": candidate["dayOfWeek"],
                        "startTime": candidate["startTime"],
                    },
                    "startDate": candidate["firstDate"],
                    "endDate": None,
                    "entryFee": candidate.get("entryFee"),
                    "currency": candidate.get("currency") or "USD",
                    "details": candidate.get("description") or candidate["title"],
                    "sourceId": source_id,
                    "lastVerified": REVIEW_DATE,
                    "confidence": "high" if candidate["count"] >= 4 else "medium",
                    "status": "active",
                }
            )
            event_ids.add(event_id)
            new_event_count += 1

        item["decision"] = "promoted-second-pass"
        item["reason"] = (
            "Repeated explicit Commander/EDH/cEDH Wizards listings in the 15–26 mile "
            "discovery ring; promoted as provisional Wizards-discovery records."
        )
        promoted_ids.add(org_id)
        promoted_count += 1

    report["promotedOrganizationIds"] = sorted(promoted_ids, key=int)
    report["secondPass"] = {
        "rule": "Promote repeated explicit Commander/EDH/cEDH listings from more than 15 through 26 miles; retain one-offs and farther listings for review.",
        "maxDistanceMiles": MAX_DISTANCE,
        "organizationCount": promoted_count,
        "newStoreCount": expansion_base_stores + new_store_count,
        "newEventCount": expansion_base_events + new_event_count,
        "reviewedAt": f"{REVIEW_DATE}T10:30:00-07:00",
    }

    change_id = "wizards-outer-ring-reconciliation-2026-07-14"
    changes = [change for change in changes if change["id"] != change_id]
    changes.append(
        {
            "id": change_id,
            "detectedAt": f"{REVIEW_DATE}T10:30:00-07:00",
            "changeType": "reconciliation",
            "entityType": "dataset",
            "entityId": "wizards-locator-outer-ring",
            "summary": (
                f"Promoted {new_store_count} additional stores and {new_event_count} recurring "
                "Commander events from repeated Wizards listings in the 15–26 mile discovery ring."
            ),
            "reviewStatus": "accepted",
        }
    )

    stores.sort(key=lambda value: (value.get("distanceMiles") is None, value.get("distanceMiles") or 999, value["name"]))
    events.sort(key=lambda value: (value["storeId"], value["recurrence"]["dayOfWeek"], value["recurrence"]["startTime"], value["title"]))
    sources.sort(key=lambda value: value["id"])
    save("stores.json", stores)
    save("events.json", events)
    save("sources.json", sources)
    save("changes.json", changes)
    save("research/wizards-reconciliation-2026-07-14.json", report)
    print(
        f"Promoted {promoted_count} organizations, {new_store_count} new stores, "
        f"and {new_event_count} new events."
    )


if __name__ == "__main__":
    main()
