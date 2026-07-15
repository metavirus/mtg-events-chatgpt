from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parent.parent

TEXT_SUFFIXES = {".md", ".json", ".js", ".css", ".html", ".py"}
JSON_FILES = [
    ROOT / "stores.json",
    ROOT / "events.json",
    ROOT / "sources.json",
    ROOT / "changes.json",
]

SUSPICIOUS_FRAGMENTS = (
    "â€œ",
    "â€\x9d",
    "â€™",
    "â€“",
    "â€”",
    "Ã",
    "Â",
    "\ufffd",
)

SKIP_DIRS = {".git", ".codex", "output", "node_modules"}


def should_scan(path: Path) -> bool:
    if any(part in SKIP_DIRS for part in path.parts):
        return False
    if path.name in {"validate_text_integrity.py", "validate_text_integrity.ps1"}:
        return False
    return path.suffix.lower() in TEXT_SUFFIXES


def iter_text_files() -> list[Path]:
    return sorted(path for path in ROOT.rglob("*") if path.is_file() and should_scan(path))


def iter_git_paths(*git_args: str) -> list[Path]:
    try:
        result = subprocess.run(
            ["git", *git_args],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
    except Exception:  # noqa: BLE001
        return []

    changed: list[Path] = []
    for relative in result.stdout.splitlines():
        if not relative:
            continue
        path = (ROOT / relative).resolve()
        if path.is_file() and should_scan(path):
            changed.append(path)
    return sorted(set(changed))


def validate_utf8(path: Path, errors: list[str]) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: not valid UTF-8 ({exc})")
        return None


def validate_line_endings(path: Path, text: str, errors: list[str]) -> None:
    if "\r\n" in text:
        errors.append(f"{path.relative_to(ROOT)}: contains CRLF line endings")


def validate_mojibake(path: Path, text: str, errors: list[str]) -> None:
    for fragment in SUSPICIOUS_FRAGMENTS:
        if fragment in text:
            errors.append(
                f"{path.relative_to(ROOT)}: contains suspicious mojibake fragment {fragment!r}"
            )


def validate_json(errors: list[str]) -> None:
    for path in JSON_FILES:
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON ({exc})")


def main() -> int:
    full_repo = "--full-repo" in sys.argv[1:]
    errors: list[str] = []
    text_files: list[Path]
    scope_label: str
    if full_repo:
        text_files = iter_text_files()
        scope_label = "full repo"
    else:
        text_files = iter_git_paths("diff", "--cached", "--name-only", "--diff-filter=ACMR")
        scope_label = "staged files"
        if not text_files:
            text_files = iter_git_paths("ls-files", "--others", "--exclude-standard")
            scope_label = "untracked files"
        if not text_files:
            text_files = iter_text_files()
            scope_label = "full repo"

    for path in text_files:
        text = validate_utf8(path, errors)
        if text is None:
            continue
        validate_line_endings(path, text, errors)
        validate_mojibake(path, text, errors)

    validate_json(errors)

    if errors:
        print(f"Text integrity check failed ({scope_label}):")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Text integrity check passed ({scope_label}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
