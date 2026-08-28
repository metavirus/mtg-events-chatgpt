"""Regression proof that repeated quiet recurring checks never become terminal."""

from __future__ import annotations

import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_typed_rpc import run_psql  # noqa: E402


def database_url() -> str:
    value = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
    if not value:
        secret_path = ROOT / ".codex-secrets" / "supabase-db-url.txt"
        if secret_path.exists():
            value = secret_path.read_text(encoding="utf-8").strip()
    if not value:
        raise RuntimeError("SUPABASE_DB_URL or the local ignored DB URL file is required")
    return value


SQL = r"""
begin;

do $$
declare
  v_venue_id text;
  v_key_prefix text := 'regression-recurring-monitoring-' || txid_current()::text;
begin
  select id into v_venue_id from public.venues order by id limit 1;
  if v_venue_id is null then
    raise exception 'recurring monitoring regression requires one venue';
  end if;

  perform * from public.record_entity_surface_check(
    v_key_prefix || '-1', 'venue', v_venue_id, 'discord', 'not_material',
    now(), 'Recurring monitoring regression check one.', null, false, 'low',
    null::uuid, 'daily', 'cursor-1', 'fingerprint-1', 0::smallint,
    null, false, false
  );
  perform * from public.record_entity_surface_check(
    v_key_prefix || '-2', 'venue', v_venue_id, 'discord', 'not_material',
    now() + interval '1 second', 'Recurring monitoring regression check two.',
    null, false, 'low', null::uuid, 'daily', 'cursor-2', 'fingerprint-2',
    0::smallint, null, false, false
  );

  if (
    select count(*)
    from public.entity_surface_coverage
    where idempotency_key like v_key_prefix || '-%'
      and monitoring_mode = 'daily'
      and attempt_number = 1
      and terminal_outcome is null
  ) <> 2 then
    raise exception 'quiet daily checks did not remain recurring and nonterminal';
  end if;
end;
$$;

rollback;
"""


def main() -> int:
    result = run_psql(SQL, database_url())
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "unknown database error").strip()
        raise RuntimeError(f"Recurring monitoring regression failed: {detail}")
    print("Recurring surface-monitoring regression passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
