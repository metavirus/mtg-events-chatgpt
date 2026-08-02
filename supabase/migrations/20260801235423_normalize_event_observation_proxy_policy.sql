update public.event_observations
set proxy_policy = 'unspecified'
where proxy_policy is null;

alter table public.event_observations
  alter column proxy_policy set default 'unspecified',
  alter column proxy_policy set not null;

comment on column public.event_observations.proxy_policy is
  'Normalized source claim: allowed, prohibited, or explicitly unspecified; never null.';
