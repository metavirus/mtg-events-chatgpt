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
