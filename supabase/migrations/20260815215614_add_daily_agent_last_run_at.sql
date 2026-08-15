alter table public.daily_agent_status
  add column if not exists last_run_at timestamptz;

comment on column public.daily_agent_status.last_run_at is
  'When the owning cloud workflow last completed enough to refresh this aggregate row. Kept separate from last_checked_at, which is the latest actual source/surface check represented by the row.';
