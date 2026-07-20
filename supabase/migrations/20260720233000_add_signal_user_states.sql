-- Personal-use signal read state.
-- Signals remain public research/product observations; this table only stores
-- whether the signed-in user has hidden a signal from their own landing page.

create table public.signal_user_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_id text not null references public.signals(id) on delete cascade,
  read_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, signal_id)
);

create index signal_user_states_user_updated_idx
  on public.signal_user_states(user_id, updated_at desc);

create trigger signal_user_states_set_updated_at before update on public.signal_user_states
for each row execute function public.set_updated_at();

alter table public.signal_user_states enable row level security;

create policy "Users manage their signal read states"
on public.signal_user_states for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all privileges on table public.signal_user_states from anon;
grant select, insert, update, delete on table public.signal_user_states to authenticated;
