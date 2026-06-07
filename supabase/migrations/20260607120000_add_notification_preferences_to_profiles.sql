alter table public.profiles
  add column if not exists push_enabled boolean default true,
  add column if not exists notify_votacoes boolean default true,
  add column if not exists notify_eventos boolean default true,
  add column if not exists notify_documentos boolean default true;

update public.profiles
set
  push_enabled = coalesce(push_enabled, true),
  notify_votacoes = coalesce(notify_votacoes, true),
  notify_eventos = coalesce(notify_eventos, true),
  notify_documentos = coalesce(notify_documentos, true);
