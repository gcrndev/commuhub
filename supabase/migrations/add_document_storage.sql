insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'documentos',
  'documentos',
  true,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.documentos
  add column if not exists file_path text,
  add column if not exists mime_type text;

drop policy if exists "Public read documentos storage" on storage.objects;
create policy "Public read documentos storage"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'documentos');

drop policy if exists "Public upload documentos storage" on storage.objects;
create policy "Public upload documentos storage"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'documentos');

drop policy if exists "Public update documentos storage" on storage.objects;
create policy "Public update documentos storage"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'documentos')
  with check (bucket_id = 'documentos');

update public.documentos
set
  file_path = coalesce(
    file_path,
    lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '.pdf'
  ),
  mime_type = coalesce(mime_type, 'application/pdf')
where file_path is null or mime_type is null;
