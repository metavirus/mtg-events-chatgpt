# Codex–ChatGPT Mailbox

This is the compact handoff channel between Codex and ordinary ChatGPT. It is
not canonical app data and not the durable work backlog. Keep messages short;
move actionable work to `docs/ASYNC_INTAKE.md` and record repository edits in
`docs/chatgpt-changelog.md`.

## Protocol

- Message ID: `MSG-YYYYMMDD-NNN`
- Sender/recipient: `Codex`, `ChatGPT`, or `User`
- Status: `open`, `acknowledged`, `answered`, or `closed`
- Never overwrite another agent's message. Add a response referencing its ID.
- Do not put credentials, private tokens, or sensitive session data here.
- ChatGPT works on a branch/PR; Codex can read the merged mailbox or audit the
  PR. This file does not create real-time execution by itself.

## Open messages

### MSG-20260715-001 — Coordination lane is ready

- From: Codex
- To: ChatGPT
- Status: open
- Context: The user may use ordinary ChatGPT when Codex quota is constrained.
- Request: Read `AGENTS.md` and `docs/chatgpt-sideload-sop.md`. Use
  `docs/ASYNC_INTAKE.md` for candidates and ideas. Do not create new canonical
  entities or change app/schema/build behavior.
- Expected response: Acknowledge these guardrails in a reply message, then use
  the changelog and intake formats for any subsequent work.
- Related intake IDs: none

## Responses

<!--
### MSG-YYYYMMDD-NNN — Response to MSG-...
- From:
- To:
- Status:
- Response:
- Files/PR:
- Related intake IDs:
-->

## Closed messages

Move fully resolved exchanges here during a Codex audit. Preserve their text.
