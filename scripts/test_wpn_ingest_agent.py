#!/usr/bin/env python3
"""Focused regression tests for WPN enrichment and quiet finding rules."""

from __future__ import annotations

import unittest

from refresh_wpn_cache import (
    ADAPTER_CONTRACT_VERSION,
    build_legacy_sql,
    enrich_snapshot,
    normalized_title_key,
)


class WpnIngestAgentTests(unittest.TestCase):
    def test_title_normalization_is_conservative_and_stable(self) -> None:
        self.assertEqual(ADAPTER_CONTRACT_VERSION, 3)
        self.assertEqual(normalized_title_key("FNM: Commander & Draft"), "fnm commander and draft")
        self.assertNotEqual(normalized_title_key("Commander Party"), normalized_title_key("Commander"))

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

    def test_series_hints_group_dates_but_keep_different_titles_separate(self) -> None:
        base = {
            "organization": {"id": "123"},
            "status": "SCHEDULED",
            "timeZone": "America/Los_Angeles",
            "eventFormat": {"id": "commander", "name": "Commander"},
        }
        events = [
            {**base, "id": "a", "title": "Weekly Commander", "scheduledStartTime": "2026-08-08T01:00:00Z"},
            {**base, "id": "b", "title": "Weekly Commander", "scheduledStartTime": "2026-08-15T01:00:00Z"},
            {**base, "id": "c", "title": "Commander Party", "scheduledStartTime": "2026-08-15T01:00:00Z"},
        ]
        result = enrich_snapshot(
            events, [{"id": "123", "name": "Known Store"}],
            {"events_all": [], "organizations": [], "cache_row": {}},
            {"123": [{"venue_id": "known-store", "venue_name": "Known Store"}]},
            "2026-08-01T16:00:00+00:00",
        )
        enriched, delta = result[0], result[5]
        self.assertEqual(delta["eligibleObservationCount"], 3)
        self.assertEqual(delta["seriesHintClusterCount"], 2)
        self.assertEqual(delta["repeatedSeriesHintClusterCount"], 1)
        self.assertEqual(enriched[0]["sourceSeriesHintKey"], enriched[1]["sourceSeriesHintKey"])
        self.assertNotEqual(enriched[1]["sourceSeriesHintKey"], enriched[2]["sourceSeriesHintKey"])

    def test_eligibility_and_material_rule_flags_are_explicit(self) -> None:
        events = [{
            "id": "ended", "title": "No proxies Commander", "description": "Official cards only.",
            "organization": {"id": "123"}, "status": "ENDED",
            "scheduledStartTime": "2026-08-01T18:00:00Z", "timeZone": "America/Los_Angeles",
        }]
        result = enrich_snapshot(
            events, [{"id": "123", "name": "Known Store"}],
            {"events_all": [], "organizations": [], "cache_row": {}},
            {"123": [{"venue_id": "known-store", "venue_name": "Known Store"}]},
            "2026-08-01T16:00:00+00:00",
        )
        item = result[0][0]
        self.assertFalse(item["promotionEligible"])
        self.assertEqual(item["promotionEligibility"], "upstream_status_ended")
        self.assertTrue(item["rulesFlags"]["explicitNoProxy"])
        self.assertEqual(result[5]["eligibleObservationCount"], 0)

    def test_template_hint_groups_finite_sessions_without_overriding_strict_keys(self) -> None:
        base = {
            "organization": {"id": "123"}, "status": "SCHEDULED",
            "timeZone": "America/Los_Angeles", "eventTemplateId": "hobbit-template",
        }
        events = [
            {**base, "id": "a", "title": "Friday Hobbit Prerelease", "scheduledStartTime": "2026-08-08T01:00:00Z"},
            {**base, "id": "b", "title": "Saturday Hobbit Prerelease", "scheduledStartTime": "2026-08-08T19:00:00Z"},
        ]
        result = enrich_snapshot(
            events, [{"id": "123", "name": "Known Store"}],
            {"events_all": [], "organizations": [], "cache_row": {}},
            {"123": [{"venue_id": "known-store", "venue_name": "Known Store"}]},
            "2026-08-01T16:00:00+00:00",
        )
        enriched, delta = result[0], result[5]
        self.assertNotEqual(enriched[0]["sourceSeriesHintKey"], enriched[1]["sourceSeriesHintKey"])
        self.assertEqual(enriched[0]["sourceTemplateHintKey"], enriched[1]["sourceTemplateHintKey"])
        self.assertEqual(delta["templateHintClusterCount"], 1)
        self.assertEqual(delta["multiSessionTemplateHintClusterCount"], 1)

    def test_material_variants_do_not_share_a_strict_series_hint(self) -> None:
        base = {
            "organization": {"id": "123"}, "status": "SCHEDULED",
            "timeZone": "America/Los_Angeles", "title": "Weekly Commander",
            "scheduledStartTime": "2026-08-08T01:00:00Z",
            "eventFormat": {"id": "commander", "name": "Commander"},
            "requiredTeamSize": 1,
        }
        events = [
            {**base, "id": "normal", "description": "Casual Commander"},
            {**base, "id": "no-proxy", "description": "No proxies allowed"},
        ]
        result = enrich_snapshot(
            events, [{"id": "123", "name": "Known Store"}],
            {"events_all": [], "organizations": [], "cache_row": {}},
            {"123": [{"venue_id": "known-store", "venue_name": "Known Store"}]},
            "2026-08-01T16:00:00+00:00",
        )
        self.assertNotEqual(result[0][0]["sourceSeriesHintKey"], result[0][1]["sourceSeriesHintKey"])
        self.assertEqual(result[5]["seriesHintClusterCount"], 2)


if __name__ == "__main__":
    unittest.main()
