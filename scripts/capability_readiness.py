#!/usr/bin/env python3
"""Mechanical guardrail for task-specific capability recovery.

This does not pretend to test capabilities that only Codex tools can exercise.
It records their observable smoke evidence and rejects unbounded retries,
unsupported conclusions, and readiness claims after a process/config repair
without restart evidence.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import re
import sys


TERMINAL = {"READY", "REPAIRED_AND_READY", "EXTERNAL_BLOCKER"}


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"No readiness run exists at {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def require_text(value: str | None, label: str) -> str:
    value = (value or "").strip()
    if not value:
        raise SystemExit(f"{label} must contain observable evidence")
    return value


def event(state: dict, kind: str, **fields: object) -> None:
    state["events"].append({"at": now(), "kind": kind, **fields})


def cmd_start(args: argparse.Namespace) -> None:
    path = Path(args.state)
    if path.exists() and not args.replace:
        prior = load(path)
        if prior.get("terminal") not in TERMINAL:
            raise SystemExit("An unfinished readiness run already exists; finish it or use --replace")
    state = {
        "version": 1,
        "task": require_text(args.task, "task"),
        "capability": require_text(args.capability, "capability"),
        "operation": require_text(args.operation, "operation"),
        "startedAt": now(),
        "attempts": 0,
        "repairUsed": False,
        "restartRequired": False,
        "restartObserved": False,
        "terminal": None,
        "events": [],
    }
    event(state, "started")
    save(path, state)
    print(f"READINESS STARTED: {state['capability']} -> {state['operation']}")


def cmd_smoke(args: argparse.Namespace) -> None:
    path = Path(args.state)
    state = load(path)
    if state["terminal"]:
        raise SystemExit(f"Run already ended as {state['terminal']}")
    expected = 1 if not state["repairUsed"] else 2
    if state["attempts"] >= expected:
        if not state["repairUsed"]:
            raise SystemExit("Initial smoke already recorded; record one repair before retesting")
        raise SystemExit("Exact retest already recorded; no third attempt is permitted")
    state["attempts"] += 1
    evidence = require_text(args.evidence, "evidence")
    event(state, "smoke", attempt=state["attempts"], passed=args.passed, evidence=evidence)
    save(path, state)
    print(f"SMOKE {'PASSED' if args.passed else 'FAILED'} ({state['attempts']}/2): {evidence}")


def cmd_repair(args: argparse.Namespace) -> None:
    path = Path(args.state)
    state = load(path)
    if state["terminal"]:
        raise SystemExit(f"Run already ended as {state['terminal']}")
    if state["attempts"] != 1 or not state["events"][-1].get("passed") is False:
        raise SystemExit("Repair is allowed only after one recorded failed smoke")
    if state["repairUsed"]:
        raise SystemExit("The single repair allowance has already been used")
    action = require_text(args.action, "action")
    prediction = require_text(args.prediction, "prediction")
    state["repairUsed"] = True
    state["restartRequired"] = bool(args.requires_restart)
    event(state, "repair", action=action, prediction=prediction, requiresRestart=bool(args.requires_restart))
    save(path, state)
    print(f"REPAIR RECORDED: {action}")


def cmd_restart(args: argparse.Namespace) -> None:
    path = Path(args.state)
    state = load(path)
    if not state["repairUsed"]:
        raise SystemExit("No repair exists that could require a restart")
    evidence = require_text(args.evidence, "evidence")
    state["restartObserved"] = True
    event(state, "restart", evidence=evidence)
    save(path, state)
    print(f"RESTART OBSERVED: {evidence}")


def last_smoke(state: dict) -> dict | None:
    return next((item for item in reversed(state["events"]) if item["kind"] == "smoke"), None)


def cmd_finish(args: argparse.Namespace) -> None:
    path = Path(args.state)
    state = load(path)
    if args.outcome not in TERMINAL:
        raise SystemExit(f"Outcome must be one of: {', '.join(sorted(TERMINAL))}")
    if state["terminal"]:
        raise SystemExit(f"Run already ended as {state['terminal']}")
    smoke = last_smoke(state)
    if args.outcome in {"READY", "REPAIRED_AND_READY"}:
        if not smoke or not smoke["passed"]:
            raise SystemExit("Ready requires a passing smoke of the exact operation")
        if args.outcome == "READY" and state["repairUsed"]:
            raise SystemExit("Use REPAIRED_AND_READY after a repair")
        if args.outcome == "REPAIRED_AND_READY" and not state["repairUsed"]:
            raise SystemExit("REPAIRED_AND_READY requires a recorded repair")
        if state["repairUsed"] and state["attempts"] != 2:
            raise SystemExit("A repair must be followed by exactly one retest")
        if state["restartRequired"] and not state["restartObserved"]:
            raise SystemExit("This repair changed process/config state; restart evidence is required")
    else:
        blocker = require_text(args.blocker, "blocker")
        if not state["repairUsed"] or state["attempts"] != 2 or (smoke and smoke["passed"]):
            raise SystemExit("EXTERNAL_BLOCKER requires one failed smoke, one repair, and one failed retest")
        if re.search(r"maybe|likely|probably|unknown", blocker, re.I):
            raise SystemExit("External blocker must name an exact dependency, not a speculative one")
    state["terminal"] = args.outcome
    state["finishedAt"] = now()
    event(state, "finished", outcome=args.outcome, blocker=(args.blocker or "").strip() or None)
    save(path, state)
    print(args.outcome)


def cmd_status(args: argparse.Namespace) -> None:
    state = load(Path(args.state))
    print(json.dumps(state, indent=2))


def cmd_assert(args: argparse.Namespace) -> None:
    state = load(Path(args.state))
    if state.get("terminal") not in {"READY", "REPAIRED_AND_READY"}:
        raise SystemExit(f"CAPABILITY NOT READY: {state.get('terminal') or 'unfinished'}")
    print(state["terminal"])


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--state", default="work/readiness/current.json")
    sub = result.add_subparsers(dest="command", required=True)

    start = sub.add_parser("start")
    start.add_argument("--task", required=True)
    start.add_argument("--capability", required=True)
    start.add_argument("--operation", required=True)
    start.add_argument("--replace", action="store_true")
    start.set_defaults(func=cmd_start)

    smoke = sub.add_parser("smoke")
    smoke.add_argument("--passed", action="store_true")
    smoke.add_argument("--evidence", required=True)
    smoke.set_defaults(func=cmd_smoke)

    repair = sub.add_parser("repair")
    repair.add_argument("--action", required=True)
    repair.add_argument("--prediction", required=True)
    repair.add_argument("--requires-restart", action="store_true")
    repair.set_defaults(func=cmd_repair)

    restart = sub.add_parser("restart")
    restart.add_argument("--evidence", required=True)
    restart.set_defaults(func=cmd_restart)

    finish = sub.add_parser("finish")
    finish.add_argument("--outcome", required=True)
    finish.add_argument("--blocker")
    finish.set_defaults(func=cmd_finish)

    status = sub.add_parser("status")
    status.set_defaults(func=cmd_status)
    ready = sub.add_parser("assert-ready")
    ready.set_defaults(func=cmd_assert)
    return result


def main() -> None:
    args = parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
