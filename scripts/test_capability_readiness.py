#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("capability_readiness.py")


class CapabilityReadinessTests(unittest.TestCase):
    def run_gate(self, state: Path, *args: str, ok: bool = True) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--state", str(state), *args],
            text=True,
            capture_output=True,
            check=False,
        )
        if ok and result.returncode:
            self.fail(result.stdout + result.stderr)
        if not ok and not result.returncode:
            self.fail("command unexpectedly succeeded")
        return result

    def start(self, state: Path) -> None:
        self.run_gate(state, "start", "--task", "UI check", "--capability", "browser", "--operation", "read DOM")

    def test_clean_smoke_can_finish_ready(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            state = Path(temp) / "state.json"
            self.start(state)
            self.run_gate(state, "smoke", "--passed", "--evidence", "DOM title and heading returned")
            self.run_gate(state, "finish", "--outcome", "READY")
            self.assertEqual(json.loads(state.read_text())["terminal"], "READY")

    def test_third_attempt_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            state = Path(temp) / "state.json"
            self.start(state)
            self.run_gate(state, "smoke", "--evidence", "bridge returned silence")
            self.run_gate(state, "repair", "--action", "reset bridge", "--prediction", "DOM read returns data")
            self.run_gate(state, "smoke", "--evidence", "bridge still returned silence")
            result = self.run_gate(state, "smoke", "--evidence", "try again", ok=False)
            self.assertIn("no third attempt", result.stdout + result.stderr)

    def test_restart_is_required_after_process_repair(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            state = Path(temp) / "state.json"
            self.start(state)
            self.run_gate(state, "smoke", "--evidence", "no browser readback")
            self.run_gate(
                state,
                "repair",
                "--action", "change bridge config",
                "--prediction", "new process reads DOM",
                "--requires-restart",
            )
            self.run_gate(state, "smoke", "--passed", "--evidence", "DOM returned")
            result = self.run_gate(state, "finish", "--outcome", "REPAIRED_AND_READY", ok=False)
            self.assertIn("restart evidence", result.stdout + result.stderr)
            self.run_gate(state, "restart", "--evidence", "new bridge PID 123")
            self.run_gate(state, "finish", "--outcome", "REPAIRED_AND_READY")

    def test_speculative_external_blocker_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            state = Path(temp) / "state.json"
            self.start(state)
            self.run_gate(state, "smoke", "--evidence", "TLS failure")
            self.run_gate(state, "repair", "--action", "refresh trust store", "--prediction", "TLS succeeds")
            self.run_gate(state, "smoke", "--evidence", "same certificate error")
            result = self.run_gate(
                state, "finish", "--outcome", "EXTERNAL_BLOCKER", "--blocker", "Probably Norton", ok=False
            )
            self.assertIn("exact dependency", result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
