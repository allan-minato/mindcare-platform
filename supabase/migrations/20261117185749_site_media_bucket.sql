-- Bucket público de mídia dos sites e fotos de profissionais.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública: URL do objeto funciona fora do painel.
create policy site_media_select_public
on storage.objects
for select
to public
using (bucket_id = 'site-media');

create policy site_media_insert_staff
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and (select private.has_role('editor'))
);

create policy site_media_update_staff
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and (select private.has_role('editor'))
)
with check (
  bucket_id = 'site-media'
  and (select private.has_role('editor'))
);

create policy site_media_delete_staff
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and (select private.has_role('editor'))
);
