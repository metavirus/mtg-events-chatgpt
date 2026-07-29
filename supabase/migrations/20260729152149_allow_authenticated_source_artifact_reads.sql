grant select on table public.source_artifacts to authenticated;
grant select on table public.source_artifact_links to authenticated;

drop policy if exists "Authenticated users can read analyzed source artifacts"
  on public.source_artifacts;
create policy "Authenticated users can read analyzed source artifacts"
on public.source_artifacts
for select
to authenticated
using (analysis_status = 'analyzed');

drop policy if exists "Authenticated users can read analyzed artifact links"
  on public.source_artifact_links;
create policy "Authenticated users can read analyzed artifact links"
on public.source_artifact_links
for select
to authenticated
using (
  exists (
    select 1
    from public.source_artifacts artifact
    where artifact.id = source_artifact_links.artifact_id
      and artifact.analysis_status = 'analyzed'
  )
);

drop policy if exists "Authenticated users can download source artifacts"
  on storage.objects;
create policy "Authenticated users can download source artifacts"
on storage.objects
for select
to authenticated
using (bucket_id = 'source-artifacts');
