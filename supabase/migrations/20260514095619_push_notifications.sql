create table if not exists public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  fcm_token text,
  fcm_token_updated_at timestamp with time zone
);

alter table public.profiles
  add column if not exists fcm_token text,
  add column if not exists fcm_token_updated_at timestamp with time zone;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  sent_at timestamp with time zone,
  send_error text
);

alter table public.notifications
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists title text,
  add column if not exists body text,
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists sent_at timestamp with time zone,
  add column if not exists send_error text;

alter table public.profiles enable row level security;
alter table public.notifications enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;

drop policy if exists "Profiles are private" on public.profiles;
create policy "Profiles are private"
  on public.profiles
  for all
  using (false)
  with check (false);

drop policy if exists "Notifications are private" on public.notifications;
create policy "Notifications are private"
  on public.notifications
  for all
  using (false)
  with check (false);

create index if not exists profiles_fcm_token_idx
  on public.profiles (fcm_token)
  where fcm_token is not null;

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
