# Environment Readiness Gate

This gate is mandatory before research, data writes, crawler work, or app work.
Run it from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check_environment_readiness.ps1
```

The gate now gives the Supabase CLI a workspace-local home at
`.codex-supabase-home/`, which is ignored by Git. This avoids the recurring
Codex sandbox failure where the CLI tried to write telemetry or profile state
under `C:\Users\kavig\.supabase`.

The preferred permanent live-write lane is a direct Postgres URL because it
does not depend on Supabase Management API login, project linking, or the user's
profile directory. Configure it once through `SUPABASE_DB_URL` or through the
ignored local setup file:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup_supabase_cli_workspace.ps1
```

Use the Supabase **Session pooler** URI for this value, not Transaction pooler.
Supabase documents Session pooler as the IPv4-friendly alternative for
persistent clients and Postgres tools, while Transaction pooler is meant for
brief serverless-style interactions and does not support every client behavior.
For this repo's tiny typed-write workload, the Session pooler is the least
surprising permanent choice: copy the URI that uses pooler port `5432`, not the
Transaction pooler URI on port `6543`.

That script first looks for `SUPABASE_DB_URL` in the current process, User
scope, or Machine scope. If present, it saves it to
`.codex-secrets/supabase-db-url.txt` and the gate uses `supabase db query
--db-url ...` thereafter. If no DB URL is available, the script falls back to
`SUPABASE_ACCESS_TOKEN` and `supabase link`.

If an environment variable was just added through Windows settings, restart
Codex or run the setup from a fresh terminal so the new environment block is
visible.

## Permanent baseline

### Supabase direct execution

- CLI: installed `supabase` CLI.
- Preferred authentication: `SUPABASE_DB_URL` visible to the setup script, then
  saved to ignored `.codex-secrets/supabase-db-url.txt`.
- Fallback authentication: `SUPABASE_ACCESS_TOKEN` visible to the setup script,
  then local CLI state seeded under ignored `.codex-supabase-home/`.
- Link: repository linked to project `pyvftzsodzwfqncjbmbc` only for the fallback
  linked-CLI path.
- Direct path:

  ```powershell
  supabase db query --db-url "$env:SUPABASE_DB_URL" "<typed RPC or SQL>"
  ```

- Smoke test: the readiness script runs a harmless linked `select`.
- Authentication setup is a one-time user action in a real terminal:

  ```powershell
  [Environment]::SetEnvironmentVariable('SUPABASE_DB_URL', '<session-pooler-postgres-url>', 'User')
  powershell -ExecutionPolicy Bypass -File scripts/setup_supabase_cli_workspace.ps1
  ```

  Run the setup from the repo directory:

  ```powershell
  cd C:\Users\kavig\Documents\Codex\mtg-events-chatgpt
  ```

  If `psql`, Python, or another platform tool is installed on the host but the
  gate cannot see it, treat that as a Codex/PATH visibility issue and fix the
  environment path directly. Do not build research-workflow fallbacks around a
  missing platform tool.

  Never commit the URL or token. `.codex-secrets/` and the workspace-local CLI
  home are ignored and should remain local machine state only.

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

### Browser/UI verification lane

The baseline readiness gate now includes an app-owned Playwright smoke test:

```powershell
node scripts/verify_app_ui.mjs --scenario browser-smoke
```

The gate runs this through the bundled Codex Node runtime when available and
passes the bundled `node_modules` path explicitly. This is the stable readiness
proof for UI verification. The Codex in-app browser bridge is useful when it is
healthy, but it is not the only acceptable browser lane and it must not become a
token sink. If the Codex browser bridge returns no observable output, switch
immediately to this verifier rather than retrying the bridge repeatedly.

For live public-app checks, use a targeted scenario instead of broad clicking:

```powershell
node scripts/verify_app_ui.mjs --scenario public-signals-smoke
node scripts/verify_app_ui.mjs --scenario lags-signal-event-link
```

Any task that depends on browser/UI observation is not ready until either the
Codex browser bridge or this Playwright verifier can launch a browser, inspect
visible DOM state, and report an observable result.

### WPN snapshot

- Canonical routine crawler handoff: `work/wpn-cache/latest/` (git ignored).
- Canonical operational rich cache: `public.wpn_snapshot_cache` in Supabase.
- Local handoff metadata source, when present:
  `work/wpn-cache/latest/metadata.json` → `retrievedAt`.
- Reuse: use the existing snapshot when it is under 24 hours old and its radius
  covers the stores in scope.
- Automatic refresh: the readiness gate runs `scripts/refresh_wpn_cache.py`
  whenever the routine handoff is missing or stale. The command fetches into
  ignored `work/`, atomically upserts the Supabase cache, verifies
  counts/fingerprint, and stops. It never flushes and rebuilds canonical event
  tables, and it should not dirty tracked JSON. A failure fails the readiness
  gate rather than silently using stale data.
- Enriched cache: migration `20260801170000_enrich_wpn_ingest_cache.sql` is
  deployed. The refresh writes fingerprints, observation state, field
  inventory, delta summaries, and exceptional findings through the same
  bounded upsert. `--dry-run` remains available for no-write inspection.
- Routine radius: 25 miles.
- Recovery/debug snapshot: tracked `output/wizards/` is historical fallback
  material only; refresh it only with an explicit recovery/debug task.
- Wider-radius fallback: create a clearly named separate ignored work directory
  such as `work/wpn-cache/radius30-YYYY-MM-DD/`; do not replace the routine
  25-mile handoff or treat any local snapshot as canonical app data.

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

For a task-specific capability that the baseline script cannot exercise itself
(for example, Codex browser control), use the executable recovery ledger rather
than relying on conversational memory:

```powershell
.venv\Scripts\python.exe scripts\capability_readiness.py start --task "live UI verification" --capability browser --operation "read the target page DOM"
.venv\Scripts\python.exe scripts\capability_readiness.py smoke --passed --evidence "returned title, URL, and target heading"
.venv\Scripts\python.exe scripts\capability_readiness.py finish --outcome READY
```

## Git checkpoint lane

The readiness gate intentionally proves runtime, browser/UI, WPN, and Supabase
capabilities. It does not make sandboxed Git metadata writes authoritative.

In Codex `workspace-write` mode, project files are writable but `.git` is
read-only in the normal sandbox. Sandboxed checkpoint operations therefore
predictably fail on `.git/index.lock`, `FETCH_HEAD`, or Windows credential
access even when the repository is healthy. When the user has authorized a
checkpoint, commit, or publication, run the necessary Git operation through the
approved outside-sandbox Git path from `docs/CHANGE_CONTROL.md` on the first
attempt. A sandboxed Git metadata failure is a known execution boundary, not
`ENVIRONMENT NOT READY`, and attempting that doomed lane first is a readiness
process failure.

On failure, the only allowed sequence is `smoke` (failed), `repair`, the exact
`smoke` retest, then `finish`. The program rejects a third attempt. Repairs that
change configuration or process state use `repair --requires-restart` and
cannot finish ready until `restart --evidence "..."` records a new process or
host lifecycle. Terminal outcomes are only `READY`, `REPAIRED_AND_READY`, and
`EXTERNAL_BLOCKER`; the last requires an exact, non-speculative dependency.
