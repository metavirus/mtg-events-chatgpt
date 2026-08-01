#!/usr/bin/env python3
"""Focused regression tests for WPN enrichment and quiet finding rules."""

from __future__ import annotations

import unittest

from refresh_wpn_cache import build_legacy_sql, enrich_snapshot


class WpnIngestAgentTests(unittest.TestCase):
    def test_predeployment_fallback_is_upsert_not_flush(self) -> None:
        metadata = {
            "retrievedAt": "2026-08-01T16:00:00+00:00",
            "publicOrigin": {"label": "Los Alamitos, CA", "latitude": 1, "longitude": 2},
        }
        sql = build_legacy_sql(metadata, [], [], [], "a" * 64).lower()
        self.assertIn("on conflict (id) do update", sql)
        self.assertNotIn("delete from", sql)
        self.assertNotIn("truncate", sql)

    def test_exact_store_match_and_new_unmatched_store_finding(self) -> None:
        previous = {
            "events_all": [],
            "organizations": [{"id": "old"}],
            "cache_row": {},
        }
        organizations = [
            {"id": "123", "name": "Known Store", "postalAddress": "1 Main St"},
            {"id": "456", "name": "New Store", "postalAddress": "2 Main St"},
        ]
        result = enrich_snapshot(
            [], organizations, previous,
            {"123": [{"venue_id": "known-store", "venue_name": "Known Store"}]},
            "2026-08-01T16:00:00+00:00",
        )
        enriched_organizations, findings, delta = result[1], result[4], result[5]
        known = next(org for org in enriched_organizations if org["sourceOrganizationId"] == "123")
        self.assertEqual(known["canonicalVenueId"], "known-store")
        self.assertEqual(known["venueMatchConfidence"], "exact")
        self.assertIn("wpn:new-organization:456", {item["deduplicationKey"] for item in findings})
        self.assertEqual(delta["matchedOrganizationCount"], 1)

    def test_future_event_requires_two_consecutive_misses(self) -> None:
        prior_event = {
            "id": "future-1",
            "title": "Future Event",
            "scheduledStartTime": "2099-01-01T20:00:00Z",
            "organization": {"id": "123"},
        }
        previous = {
            "events_all": [],
            "organizations": [{"id": "123"}],
            "retrieved_at": "2026-07-31T16:00:00+00:00",
            "cache_row": {
                "event_observation_state": {
                    "future-1": {
                        "firstSeenAt": "2026-07-30T16:00:00+00:00",
                        "lastSeenAt": "2026-07-31T16:00:00+00:00",
                        "seenCount": 2,
                        "consecutiveMissing": 1,
                        "scheduledStartTime": "2099-01-01T20:00:00Z",
                        "lastContentFingerprint": "prior-fingerprint",
                        "organizationId": "123",
                        "lastEventSummary": prior_event,
                    }
                }
            },
        }
        result = enrich_snapshot(
            [], [{"id": "123", "name": "Known Store"}], previous, {},
            "2026-08-01T16:00:00+00:00",
        )
        findings, delta = result[4], result[5]
        self.assertEqual(delta["confirmedMissingEventIds"], ["future-1"])
        self.assertIn("wpn:future-event-missing:future-1", {item["deduplicationKey"] for item in findings})


if __name__ == "__main__":
    unittest.main()
