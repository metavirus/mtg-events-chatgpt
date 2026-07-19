create table public.venue_hours (
  venue_id text primary key references public.venues(id) on delete cascade,
  status text not null default 'unknown'
    check (status in ('verified', 'variable', 'stale', 'unknown')),
  weekly_hours jsonb not null default '{}'::jsonb
    check (jsonb_typeof(weekly_hours) = 'object'),
  temporary_updates jsonb not null default '[]'::jsonb
    check (jsonb_typeof(temporary_updates) = 'array'),
  source_id text references public.sources(id) on delete restrict,
  last_verified date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index venue_hours_source_idx on public.venue_hours(source_id)
  where source_id is not null;

create trigger venue_hours_set_updated_at before update on public.venue_hours
for each row execute function public.set_updated_at();

alter table public.venue_hours enable row level security;

create policy "Public venue hours are readable"
on public.venue_hours for select to anon, authenticated using (true);

revoke all on public.venue_hours from anon, authenticated;
grant select on public.venue_hours to anon, authenticated;
