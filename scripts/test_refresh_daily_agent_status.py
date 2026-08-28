"""Small regression checks for app-facing automation outcome reporting."""

from refresh_daily_agent_status import discord_status_override_sql


partial_sql = discord_status_override_sql(
    {
        "outcome": "partial_success",
        "selectedCount": 27,
        "surfaceWriteAttempted": 3,
        "surfaceWriteSucceeded": 2,
        "failedWriteCount": 1,
    }
)
assert "partial_success" in partial_sql
assert "Discord checked 27 routes" in partial_sql
assert "2 of 3 entity updates were saved" in partial_sql
assert "1 write needs attention" in partial_sql

success_sql = discord_status_override_sql(
    {
        "outcome": "success",
        "selectedCount": 27,
        "surfaceWriteAttempted": 3,
        "surfaceWriteSucceeded": 3,
        "failedWriteCount": 0,
    }
)
assert "all 3 entity updates were saved" in success_sql

print("Daily-agent status reporting tests passed.")
