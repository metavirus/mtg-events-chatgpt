-- Personal-use authenticated preference persistence.
-- Research tables and research-authored fields are intentionally untouched.

alter table public.personal_notes
  add constraint personal_notes_user_entity_key
  unique (user_id, entity_type, entity_id);

revoke all privileges on table public.entity_preferences from anon;
revoke all privileges on table public.personal_notes from anon;

grant select, insert, update, delete on table public.entity_preferences
  to authenticated;
grant select, insert, update, delete on table public.personal_notes
  to authenticated;
