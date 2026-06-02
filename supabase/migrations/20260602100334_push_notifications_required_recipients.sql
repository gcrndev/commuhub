create schema if not exists private;

create or replace function private.create_document_notification()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.notifications (user_id, title, body, data)
  select
    u.id,
    'Upload novo',
    NEW.title,
    jsonb_build_object('screen', 'Docs')
  from public.users u;

  return NEW;
end;
$$;

revoke all on function private.create_document_notification() from public;

drop trigger if exists documentos_notify_after_update on public.documentos;
drop trigger if exists documentos_notify_after_insert on public.documentos;
create trigger documentos_notify_after_insert
  after insert on public.documentos
  for each row
  execute function private.create_document_notification();

create or replace function private.create_votacao_notification()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.notifications (user_id, title, body, data)
  select
    u.id,
    'Votação nova',
    NEW.title,
    jsonb_build_object('screen', 'Votacoes')
  from public.users u;

  return NEW;
end;
$$;

revoke all on function private.create_votacao_notification() from public;

drop trigger if exists votacoes_notify_after_update on public.votacoes;
drop trigger if exists votacoes_notify_after_insert on public.votacoes;
create trigger votacoes_notify_after_insert
  after insert on public.votacoes
  for each row
  execute function private.create_votacao_notification();

create or replace function private.create_evento_notification()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.notifications (user_id, title, body, data)
  select
    u.id,
    'Evento novo',
    NEW.title,
    jsonb_build_object('screen', 'Agenda')
  from public.users u;

  return NEW;
end;
$$;

revoke all on function private.create_evento_notification() from public;

drop trigger if exists eventos_notify_after_insert on public.eventos;
create trigger eventos_notify_after_insert
  after insert on public.eventos
  for each row
  execute function private.create_evento_notification();
