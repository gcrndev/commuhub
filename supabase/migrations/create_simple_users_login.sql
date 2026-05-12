create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_type') then
    create type public.user_type as enum ('admin', 'condomino');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  type public.user_type not null default 'condomino',
  date_added timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;

drop policy if exists "Users are private" on public.users;
create policy "Users are private"
  on public.users
  for all
  using (false)
  with check (false);

create or replace function public.login_user(
  input_username text,
  input_password text
)
returns table (
  id uuid,
  username text,
  type public.user_type,
  date_added timestamptz
)
language sql
security definer
set search_path = public
as $$
  select u.id, u.username, u.type, u.date_added
  from public.users u
  where u.username = input_username
    and u.password = input_password
  limit 1;
$$;

revoke all on function public.login_user(text, text) from public;
grant execute on function public.login_user(text, text) to anon, authenticated;

insert into public.users (username, password, type)
values
  ('admin', 'admin123', 'admin'),
  ('condomino', 'condomino123', 'condomino')
on conflict (username) do nothing;
