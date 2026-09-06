#!/usr/bin/env python3
"""Focused regressions for social evidence gating and date extraction."""

from __future__ import annotations

import unittest
from datetime import date

from social_surveyor import (
    SocialSource,
    choose_artifact_candidate,
    parse_artifact_id,
    resolve_social_date,
    signal_from_probe,
    structured_hours_change,
    structured_social_event,
)


SOURCE = SocialSource(
    venue_id="example-store",
    venue_name="Example Store",
    source_id="src-example-instagram",
    url="https://www.instagram.com/example/",
)


def probe(*, body: str = "", media: list[dict] | None = None) -> dict:
    return {
        "surfaceStatus": "candidate_media_visible",
        "classification": {
            "matchedMtgTerms": ["magic"] if "magic" in body.lower() else [],
            "matchedOperationalTerms": ["hours"] if "hours" in body.lower() else [],
        },
        "visibleSlice": {
            "bodyTextSample": body,
            "candidateLinks": [],
            "mediaCandidates": media or [],
        },
    }


class SocialSurveyorTests(unittest.TestCase):
    def test_profile_shell_never_becomes_signal_or_event(self) -> None:
        page_shell = probe(
            body=(
                "Log In Forgot Account? 112 followers Posts About Photos. "
                "Magic Events Coming Up. Store hours and privacy terms."
            )
        )
        artifact_index, _ = choose_artifact_candidate(page_shell)
        self.assertIsNone(artifact_index)
        self.assertIsNone(
            signal_from_probe(
                SOURCE,
                platform="facebook",
                probe=page_shell,
                artifact_index=artifact_index,
                fingerprint="shell",
                materiality="low",
            )
        )
        self.assertIsNone(
            structured_social_event(
                SOURCE,
                platform="facebook",
                probe=page_shell,
                artifact_index=artifact_index,
            )
        )

    def test_specific_closure_image_becomes_operational_signal(self) -> None:
        closure = probe(
            body="Generic profile shell with store hours.",
            media=[{
                "alt": "Tomorrow's hours: store closed Monday. No events will be held.",
                "nearbyText": "",
                "link": "https://www.instagram.com/p/closure/",
            }],
        )
        artifact_index, _ = choose_artifact_candidate(closure)
        self.assertEqual(artifact_index, 0)
        signal = signal_from_probe(
            SOURCE,
            platform="instagram",
            probe=closure,
            artifact_index=artifact_index,
            fingerprint="closure",
            materiality="medium",
        )
        self.assertIsNotNone(signal)
        self.assertEqual(signal["category"], "operational")
        self.assertEqual(signal["evidence_url"], "https://www.instagram.com/p/closure/")

    def test_clear_permanent_weekend_hours_are_auto_promotable(self) -> None:
        proposal = structured_hours_change(
            "NEW WEEKEND HOURS 12 PM-10 PM EFFECTIVE 8/29 PERMANENT CHANGE",
            today=date(2026, 9, 6),
        )
        self.assertIsNotNone(proposal)
        self.assertTrue(proposal["auto_promote"])
        self.assertEqual(proposal["effective_date"], "2026-08-29")
        self.assertEqual(
            proposal["weekly_hours"],
            {
                "6": [{"open": "12:00", "close": "22:00"}],
                "0": [{"open": "12:00", "close": "22:00"}],
            },
        )

    def test_garbled_hours_ocr_becomes_structured_review(self) -> None:
        proposal = structured_hours_change(
            "NEW WEEKEND HOURS 12PM- 12PM-10PM 10PM EFFECTIVE 8/29 PERMANENT CHANGE",
            today=date(2026, 9, 6),
        )
        self.assertIsNotNone(proposal)
        self.assertFalse(proposal["auto_promote"])
        self.assertEqual(proposal["extraction"], "review")
        self.assertEqual(proposal["display"], "Saturday & Sunday · 12:00–22:00")

    def test_hours_signal_carries_explicit_review_payload(self) -> None:
        hours = probe(
            media=[{
                "alt": "NEW WEEKEND HOURS 12PM- 12PM-10PM 10PM EFFECTIVE 8/29 PERMANENT CHANGE",
                "nearbyText": "",
                "link": "https://www.instagram.com/p/hours/",
            }]
        )
        artifact_index, _ = choose_artifact_candidate(hours)
        signal = signal_from_probe(
            SOURCE,
            platform="instagram",
            probe=hours,
            artifact_index=artifact_index,
            fingerprint="hours",
            materiality="medium",
        )
        self.assertIsNotNone(signal)
        self.assertEqual(signal["promotion_target"], "venue_hours")
        self.assertEqual(signal["status"], "needs_followup")
        self.assertEqual(signal["proposed_change"]["type"], "venue_hours")

    def test_shared_branch_account_never_auto_promotes_hours(self) -> None:
        shared_source = SocialSource(
            venue_id="example-store",
            venue_name="Example Store",
            source_id="src-shared-instagram",
            url="https://www.instagram.com/example/",
            venue_count=2,
        )
        hours = probe(media=[{
            "alt": "NEW WEEKEND HOURS 12 PM-10 PM EFFECTIVE 9/6 PERMANENT CHANGE",
            "nearbyText": "",
            "link": "https://www.instagram.com/p/shared-hours/",
        }])
        artifact_index, _ = choose_artifact_candidate(hours)
        signal = signal_from_probe(
            shared_source,
            platform="instagram",
            probe=hours,
            artifact_index=artifact_index,
            fingerprint="shared-hours",
            materiality="high",
        )
        self.assertIsNotNone(signal)
        self.assertFalse(signal["auto_promote"])
        self.assertEqual(signal["status"], "needs_followup")

    def test_specific_prerelease_post_becomes_event(self) -> None:
        prerelease = probe(
            body="Generic Instagram profile chrome.",
            media=[{
                "alt": "Magic: The Gathering prerelease this Friday at 7 PM",
                "nearbyText": "Entry $35. Players receive a prerelease kit.",
                "link": "https://www.instagram.com/p/prerelease/",
            }],
        )
        artifact_index, _ = choose_artifact_candidate(prerelease)
        self.assertEqual(artifact_index, 0)
        event = structured_social_event(
            SOURCE,
            platform="instagram",
            probe=prerelease,
            artifact_index=artifact_index,
        )
        self.assertIsNotNone(event)
        self.assertEqual(event["title"], "Prerelease")
        self.assertEqual(event["start_time"], "19:00:00")
        self.assertEqual(event["source_url"], "https://www.instagram.com/p/prerelease/")

    def test_weekday_resolves_to_next_matching_day(self) -> None:
        self.assertEqual(
            resolve_social_date("Prerelease Friday at 7 PM", today=date(2026, 8, 11)),
            "2026-08-14",
        )

    def test_vague_magic_event_copy_stays_quiet(self) -> None:
        vague = probe(
            media=[{
                "alt": "Three Magic events coming up!",
                "nearbyText": "Follow us for details.",
                "link": "https://www.facebook.com/example/posts/vague",
            }]
        )
        artifact_index, _ = choose_artifact_candidate(vague)
        self.assertIsNone(artifact_index)
        self.assertIsNone(
            structured_social_event(
                SOURCE,
                platform="facebook",
                probe=vague,
                artifact_index=artifact_index,
            )
        )
        self.assertIsNone(
            signal_from_probe(
                SOURCE,
                platform="facebook",
                probe=vague,
                artifact_index=artifact_index,
                fingerprint="vague",
                materiality="low",
            )
        )

    def test_dated_commander_promo_becomes_watchlist_signal(self) -> None:
        promo = probe(
            media=[{
                "alt": "Free raffle tomorrow during Commander night",
                "nearbyText": "Magic players welcome.",
                "link": "https://www.instagram.com/p/promo/",
            }]
        )
        artifact_index, _ = choose_artifact_candidate(promo)
        self.assertEqual(artifact_index, 0)
        signal = signal_from_probe(
            SOURCE,
            platform="instagram",
            probe=promo,
            artifact_index=artifact_index,
            fingerprint="promo",
            materiality="medium",
        )
        self.assertIsNotNone(signal)
        self.assertEqual(signal["category"], "event_opportunity")
        self.assertEqual(signal["priority"], "normal")
        self.assertEqual(signal["evidence_url"], "https://www.instagram.com/p/promo/")

    def test_artifact_id_parser_reads_live_helper_output(self) -> None:
        self.assertEqual(
            parse_artifact_id(
                "source_id: src-example\nartifact_id: 12345678-1234-1234-1234-123456789abc\n"
            ),
            "12345678-1234-1234-1234-123456789abc",
        )


if __name__ == "__main__":
    unittest.main()
