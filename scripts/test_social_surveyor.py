#!/usr/bin/env python3
"""Focused regressions for social evidence gating and date extraction."""

from __future__ import annotations

import unittest
from datetime import date

from social_surveyor import (
    SocialSource,
    choose_artifact_candidate,
    resolve_social_date,
    signal_from_probe,
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
        self.assertEqual(artifact_index, 0)
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


if __name__ == "__main__":
    unittest.main()
