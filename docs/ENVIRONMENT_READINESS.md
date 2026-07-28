# Environment Readiness Gate

This gate is mandatory before research, data writes, crawler work, or app work.
Run it from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check_environment_readiness.ps1
```

Run this gate with the approved user-profile permission from the outset. If a
sandboxed invocation prints `ENVIRONMENT NOT READY`, that result is diagnostic
only: immediately rerun once through the documented permission path. Repair
agent-fixable platform problems and retest the exact failed capability in the
same task. Stop before useful project work only when the properly privileged
gate still proves a genuine external prerequisite is unavailable.

In a managed Codex workspace, run the gate with the approved
readiness-script permission. The Supabase CLI reads its existing login and
local telemetry/configuration state under the user profile, which the ordinary
workspace sandbox cannot access. Any Supabase authentication or linked-query
failure from a sandboxed gate is non-authoritative, even when the CLI does not
surface an explicit `EPERM`. Rerun the same gate with that permission before
diagnosing login, transport, token, or project-link failure.

## Permanent baseline

### Supabase direct execution

- CLI: installed `supabase` CLI.
- Authentication: CLI access token stored by `supabase login`.
- Link: repository linked to project `pyvftzsodzwfqncjbmbc`.
- Direct path:

  ```powershell
  supabase db query --linked "<typed RPC or SQL>"
  ```

- Smoke test: the readiness script runs a harmless linked `select`.
- Authentication setup is an external one-time user action in a real terminal:

  ```powershell
  supabase login --name mtg-events-chatgpt
  supabase link --project-ref pyvftzsodzwfqncjbmbc
  ```

  In a non-interactive environment, set `SUPABASE_ACCESS_TOKEN` from a personal
  access token and then run the link command. Never commit the token.

  If login succeeds but CLI calls report a transport error for
  `https://api.supabase.com`, the environment remains blocked. The external
  prerequisite is working outbound HTTPS from the `supabase` CLI process to
  `api.supabase.com:443`; browser access or a separate connector does not satisfy
  the required linked-CLI gate.

### Blessed Python runtime

The only project-script interpreter is:

```text
.venv\Scripts\python.exe
```

Create or repair it with:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

`requirements.txt` includes crawler dependencies and Windows timezone data.
Do not run project scripts through an arbitrary global `python`, `python3`, or
`py` interpreter.

### WPN snapshot

- Canonical routine location: `output/wizards/`
- Metadata/freshness source: `output/wizards/metadata.json` → `retrievedAt`
- Reuse: use the existing snapshot when it is under 24 hours old and its radius
  covers the stores in scope.
- Refresh: only when stale, outside-radius, same-day freshness matters, or
  another material source contradicts it.
- Routine radius: 25 miles.
- Wider-radius fallback: create a clearly named separate directory such as
  `output/wizards-radius30-YYYY-MM-DD/`; do not replace the routine 25-mile
  snapshot or treat either snapshot as canonical app data.

### Authoritative schema inspection

Do not rely on remembered table columns or function arguments. Use:

```powershell
supabase db query --linked --file scripts/inspect_supabase_schema.sql
```

For a narrower question, query `information_schema.columns`, `pg_proc`, and
`pg_get_function_identity_arguments(...)` through the same linked CLI path.
The connected Supabase table/schema tools are also authoritative when present,
but the checked-in SQL command is the reproducible baseline.

## Stop rule

Every substantive run begins with the readiness script using the documented
permission path. A missing CLI login, wrong/missing project link, failed linked
query, missing blessed runtime, missing timezone/crawler dependency, or missing
WPN metadata after the bounded repair/retest cycle means:

```text
ENVIRONMENT NOT READY
```

Do not proceed into research, source inspection, proposals, or data changes
while working around a genuine unresolved failure. Do fix agent-remediable
platform faults before returning to the requested work.

## Platform failure rule

When a platform or environment failure is identified during any tranche, it
becomes the active hard gate immediately. Repair it in place rather than merely
recording or routing around it. The tranche switches to capability repair only
until the environment is either:

- `READY`, with the exact failed capability retested successfully; or
- blocked on one exact external dependency, with evidence naming the machine,
  network, security, account, or service component that must change.

Do not let platform failures spill into repeated research retries, proposal
or process expansion, schema or workflow redesign, or workaround-heavy ordinary
operation. Recovery work may diagnose and fix the platform layer, but useful
project work resumes only after the gate is green or the external blocker is
crisply named.
