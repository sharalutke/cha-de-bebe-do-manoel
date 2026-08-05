alter table public.event_settings
  add column if not exists event_headline text,
  add column if not exists event_description text,
  add column if not exists couple_photo_url text,
  add column if not exists couple_photo_alt text,
  add column if not exists ultrasound_photo_url text,
  add column if not exists ultrasound_photo_alt text;

alter table public.gifts
  add column if not exists product_url text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'event-media',
  'event-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public event media read" on storage.objects;
create policy "Public event media read"
on storage.objects for select
to public
using (bucket_id = 'event-media');

drop policy if exists "Admins upload event media" on storage.objects;
create policy "Admins upload event media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-media' and public.is_admin(auth.uid()));

drop policy if exists "Admins update event media" on storage.objects;
create policy "Admins update event media"
on storage.objects for update
to authenticated
using (bucket_id = 'event-media' and public.is_admin(auth.uid()))
with check (bucket_id = 'event-media' and public.is_admin(auth.uid()));

drop policy if exists "Admins delete event media" on storage.objects;
create policy "Admins delete event media"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-media' and public.is_admin(auth.uid()));
