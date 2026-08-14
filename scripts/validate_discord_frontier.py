from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTIER = ROOT / "research" / "DISCORD_SURFACE_FRONTIER.md"
START = "<!-- discord-frontier-audit:start -->"
END = "<!-- discord-frontier-audit:end -->"

REQUIRED_COLUMNS = [
    "server",
    "channel",
    "disposition",
    "scheduled_events",
    "recent_messages",
    "pins_media",
    "metavirus_mentions",
    "owner_location_rule",
]

BAD_VALUES = {"", "tbd", "unknown", "unchecked", "not checked", "todo", "n/a?"}
AUDITED_DISPOSITIONS = {"hot_signal_source", "watch", "sample"}


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def parse_table(block: str) -> list[dict[str, str]]:
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    table_lines = [line for line in lines if line.startswith("|") and line.endswith("|")]
    if len(table_lines) < 3:
        fail("Discord frontier audit table is missing or too short.")

    headers = [cell.strip().lower() for cell in table_lines[0].strip("|").split("|")]
    missing = [column for column in REQUIRED_COLUMNS if column not in headers]
    if missing:
        fail(f"Discord frontier audit table missing columns: {', '.join(missing)}")

    rows: list[dict[str, str]] = []
    for raw in table_lines[2:]:
        cells = [cell.strip() for cell in raw.strip("|").split("|")]
        if len(cells) != len(headers):
            fail(f"Malformed audit row: {raw}")
        rows.append(dict(zip(headers, cells)))
    return rows


def main() -> None:
    text = FRONTIER.read_text(encoding="utf-8")
    match = re.search(
        re.escape(START) + r"(.*?)" + re.escape(END),
        text,
        flags=re.DOTALL,
    )
    if not match:
        fail("Discord frontier audit marker block is missing.")

    rows = parse_table(match.group(1))
    audited = [row for row in rows if row["disposition"] in AUDITED_DISPOSITIONS]
    if not audited:
        fail("Discord frontier audit contains no hot/watch/sample rows.")

    for row in audited:
        label = f"{row['server']} {row['channel']}"
        for column in REQUIRED_COLUMNS:
            value = row[column].strip().lower()
            if value in BAD_VALUES:
                fail(f"{label} has incomplete {column}.")

    lags_meetup = [
        row
        for row in rows
        if row["server"].lower() == "lagaymingsociety"
        and row["channel"].lower() == "#meet-up"
    ]
    if not lags_meetup:
        fail("LAGaymingSociety #meet-up audit row is missing.")
    meetup = lags_meetup[0]
    if "1537178990249513072" not in meetup["scheduled_events"]:
        fail("LAGaymingSociety #meet-up row is missing the Discord Event id.")
    owner_rule = meetup["owner_location_rule"].lower()
    if not all(term in owner_rule for term in ("lags", "precinct", "location")):
        fail("LAGaymingSociety #meet-up owner/location rule is incomplete.")

    print(
        "PASS Discord frontier audit: "
        f"{len(rows)} rows, {len(audited)} audited hot/watch/sample rows."
    )


if __name__ == "__main__":
    main()
