-- ============================================================================
-- ConnectDirectory - Complete Supabase PostgreSQL Schema
-- ============================================================================
-- Run this file in: Supabase Dashboard > SQL Editor > New Query
-- Order matters; execute the whole file in one transaction.
-- ============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type relation_type as enum (
    'sibling', 'parent', 'child', 'cousin', 'spouse',
    'business_partner', 'employee', 'manager', 'friend', 'mentor'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type connection_status as enum ('pending', 'accepted', 'declined', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'connection_request', 'connection_accepted', 'new_follower', 'profile_view',
    'new_message', 'mention', 'reply', 'community_invite', 'community_event',
    'community_announcement', 'business_inquiry', 'partnership_request',
    'verification_approved', 'admin_notice', 'security_alert', 'system'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles --------------------------------------------------------------------
-- One row per Supabase auth user. Stores the public profile.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  full_name       text not null,
  email           text not null,
  phone           text,
  avatar_url      text,
  cover_url       text,
  avatar_position_x smallint not null default 50 check (avatar_position_x between 0 and 100),
  avatar_position_y smallint not null default 50 check (avatar_position_y between 0 and 100),
  cover_position_x  smallint not null default 50 check (cover_position_x between 0 and 100),
  cover_position_y  smallint not null default 50 check (cover_position_y between 0 and 100),
  occupation      text,
  company         text,
  bio             text,
  website         text,
  address         text,
  city            text,
  country         text,
  role            user_role not null default 'user',
  status          profile_status not null default 'approved',
  is_verified     boolean not null default false,
  is_online       boolean not null default false,
  last_seen_at    timestamptz default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (lower(username));
create index if not exists profiles_full_name_idx on public.profiles (lower(full_name));
create index if not exists profiles_occupation_idx on public.profiles (lower(occupation));
create index if not exists profiles_city_idx on public.profiles (lower(city));
create index if not exists profiles_country_idx on public.profiles (lower(country));
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- social_links ----------------------------------------------------------------
create table if not exists public.social_links (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  facebook     text,
  instagram    text,
  tiktok       text,
  linkedin     text,
  whatsapp     text,
  twitter      text,
  updated_at   timestamptz not null default now(),
  unique (profile_id)
);

-- businesses ------------------------------------------------------------------
create table if not exists public.businesses (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  industry     text,
  description  text,
  website      text,
  location     text,
  logo_url     text,
  created_at   timestamptz not null default now()
);

create index if not exists businesses_owner_idx on public.businesses (owner_id);
create index if not exists businesses_industry_idx on public.businesses (lower(industry));

-- relations -------------------------------------------------------------------
create table if not exists public.relations (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  related_user_id  uuid not null references public.profiles(id) on delete cascade,
  relation_type    relation_type not null,
  notes            text,
  created_at       timestamptz not null default now(),
  constraint relations_distinct check (user_id <> related_user_id),
  unique (user_id, related_user_id, relation_type)
);

create index if not exists relations_user_idx on public.relations (user_id);
create index if not exists relations_related_idx on public.relations (related_user_id);
create index if not exists relations_type_idx on public.relations (relation_type);

-- connections (follow / connect requests) -------------------------------------
create table if not exists public.connections (
  id              uuid primary key default gen_random_uuid(),
  requester_id    uuid not null references public.profiles(id) on delete cascade,
  addressee_id    uuid not null references public.profiles(id) on delete cascade,
  status          connection_status not null default 'pending',
  created_at      timestamptz not null default now(),
  responded_at    timestamptz,
  constraint connections_distinct check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index if not exists connections_requester_idx on public.connections (requester_id);
create index if not exists connections_addressee_idx on public.connections (addressee_id);
create index if not exists connections_status_idx on public.connections (status);

-- messages --------------------------------------------------------------------
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  receiver_id   uuid not null references public.profiles(id) on delete cascade,
  message       text not null,
  read_status   boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists messages_sender_idx on public.messages (sender_id);
create index if not exists messages_receiver_idx on public.messages (receiver_id);
create index if not exists messages_conversation_idx on public.messages (
  least(sender_id, receiver_id),
  greatest(sender_id, receiver_id),
  created_at desc
);

-- typing_indicators -----------------------------------------------------------
create table if not exists public.typing_indicators (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  receiver_id   uuid not null references public.profiles(id) on delete cascade,
  is_typing     boolean not null default true,
  updated_at    timestamptz not null default now(),
  unique (sender_id, receiver_id)
);

-- notifications ---------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  actor_id    uuid references public.profiles(id) on delete set null,
  type        notification_type not null,
  title       text not null,
  message     text,
  link        text,
  image_url   text,
  is_read     boolean not null default false,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, is_read, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_type_idx on public.notifications (type);

create table if not exists public.notification_preferences (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  type_settings jsonb not null default '{}'::jsonb,
  email_enabled boolean not null default true,
  push_enabled  boolean not null default false,
  sound_enabled boolean not null default true,
  updated_at    timestamptz not null default now()
);

-- activity_logs (admin moderation) -------------------------------------------
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_id   uuid,
  target_type text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);

-- banners (admin uploaded content) -------------------------------------------
create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  image_url   text,
  link        text,
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists social_links_set_updated_at on public.social_links;
create trigger social_links_set_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Ensure uniqueness by appending random suffix on collision
  while exists (select 1 from public.profiles where username = v_username) loop
    v_username := v_username || floor(random() * 1000)::text;
  end loop;

  insert into public.profiles (id, username, full_name, email, avatar_url)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', v_username),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.social_links (profile_id) values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Notification trigger: when a connection request is created
create or replace function public.create_notification(
  p_user_id uuid,
  p_actor_id uuid,
  p_type public.notification_type,
  p_title text,
  p_message text default null,
  p_link text default null,
  p_image_url text default null,
  p_metadata jsonb default '{}'::jsonb
) returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_key text;
  v_existing public.notifications;
  v_actor_count int;
  v_actor_ids jsonb;
  v_record public.notifications;
begin
  v_group_key := coalesce(p_metadata->>'group_key', '');

  if p_type = 'profile_view' and v_group_key <> '' then
    select * into v_existing
    from public.notifications
    where user_id = p_user_id
      and type = p_type
      and is_read = false
      and metadata->>'group_key' = v_group_key
      and created_at > now() - interval '24 hours'
    order by created_at desc
    limit 1;

    if found then
      v_actor_ids := coalesce(v_existing.metadata->'actor_ids', '[]'::jsonb);
      v_actor_count := coalesce((v_existing.metadata->>'actor_count')::int, 1);

      if p_actor_id is not null and not v_actor_ids ? p_actor_id::text then
        v_actor_ids := v_actor_ids || to_jsonb(p_actor_id::text);
        v_actor_count := v_actor_count + 1;
      end if;

      update public.notifications
      set
        title = 'Profile views',
        message = case
          when v_actor_count <= 1 then 'Someone viewed your profile'
          else v_actor_count || ' people viewed your profile'
        end,
        metadata = coalesce(v_existing.metadata, '{}'::jsonb)
          || jsonb_build_object('actor_count', v_actor_count, 'actor_ids', v_actor_ids),
        created_at = now()
      where id = v_existing.id
      returning * into v_record;

      return v_record;
    end if;
  end if;

  insert into public.notifications (
    user_id, actor_id, type, title, message, link, image_url, metadata
  )
  values (
    p_user_id, p_actor_id, p_type, p_title, p_message, p_link, p_image_url,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_record;

  return v_record;
end;
$$;

create or replace function public.notify_connection_request()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_actor_name text;
begin
  if new.status = 'pending' then
    select full_name into v_actor_name from public.profiles where id = new.requester_id;
    perform public.create_notification(
      new.addressee_id,
      new.requester_id,
      'connection_request',
      'New connection request',
      coalesce(v_actor_name, 'Someone') || ' sent you a connection request.',
      '/connections',
      null,
      jsonb_build_object('connection_id', new.id)
    );
  end if;
  return new;
end $$;

drop trigger if exists on_connection_created on public.connections;
create trigger on_connection_created
  after insert on public.connections
  for each row execute function public.notify_connection_request();

create or replace function public.notify_connection_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_actor_name text;
  v_username text;
begin
  if new.status = 'accepted' and old.status = 'pending' then
    select full_name, username into v_actor_name, v_username
    from public.profiles where id = new.addressee_id;

    perform public.create_notification(
      new.requester_id,
      new.addressee_id,
      'connection_accepted',
      'Connection accepted',
      coalesce(v_actor_name, 'Someone') || ' accepted your connection request.',
      '/u/' || coalesce(v_username, ''),
      null,
      jsonb_build_object('connection_id', new.id)
    );
  end if;
  return new;
end $$;

drop trigger if exists on_connection_accepted on public.connections;
create trigger on_connection_accepted
  after update on public.connections
  for each row execute function public.notify_connection_accepted();

-- Notification trigger: when a new message is received
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sender_name text;
begin
  select full_name into v_sender_name from public.profiles where id = new.sender_id;

  perform public.create_notification(
    new.receiver_id,
    new.sender_id,
    'new_message',
    'New message',
    coalesce(v_sender_name, 'Someone') || ': ' || left(new.message, 80),
    '/messages/' || new.sender_id::text,
    null,
    jsonb_build_object('message_id', new.id)
  );
  return new;
end $$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ============================================================================
-- VIEWS
-- ============================================================================
create or replace view public.profile_stats as
select
  p.id,
  (select count(*) from public.connections c
    where (c.requester_id = p.id or c.addressee_id = p.id)
      and c.status = 'accepted') as connections_count,
  (select count(*) from public.relations r
    where r.user_id = p.id) as relations_count,
  (select count(*) from public.messages m
    where m.sender_id = p.id) as messages_sent
from public.profiles p;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles           enable row level security;
alter table public.social_links       enable row level security;
alter table public.businesses         enable row level security;
alter table public.relations          enable row level security;
alter table public.connections        enable row level security;
alter table public.messages           enable row level security;
alter table public.typing_indicators  enable row level security;
alter table public.notifications      enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.activity_logs      enable row level security;
alter table public.banners            enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles policies -----------------------------------------------------------
drop policy if exists "profiles: public read approved" on public.profiles;
create policy "profiles: public read approved"
  on public.profiles for select
  using (status = 'approved' or id = auth.uid() or public.is_admin());

drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

drop policy if exists "profiles: self insert" on public.profiles;
create policy "profiles: self insert"
  on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

-- social_links policies -------------------------------------------------------
drop policy if exists "social_links: public read" on public.social_links;
create policy "social_links: public read"
  on public.social_links for select using (true);

drop policy if exists "social_links: owner write" on public.social_links;
create policy "social_links: owner write"
  on public.social_links for all
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- businesses ------------------------------------------------------------------
drop policy if exists "businesses: public read" on public.businesses;
create policy "businesses: public read"
  on public.businesses for select using (true);

drop policy if exists "businesses: owner write" on public.businesses;
create policy "businesses: owner write"
  on public.businesses for all
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- relations -------------------------------------------------------------------
drop policy if exists "relations: public read" on public.relations;
create policy "relations: public read"
  on public.relations for select using (true);

drop policy if exists "relations: owner write" on public.relations;
create policy "relations: owner write"
  on public.relations for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- connections -----------------------------------------------------------------
drop policy if exists "connections: parties read" on public.connections;
create policy "connections: parties read"
  on public.connections for select
  using (requester_id = auth.uid() or addressee_id = auth.uid() or public.is_admin());

drop policy if exists "connections: requester create" on public.connections;
create policy "connections: requester create"
  on public.connections for insert
  with check (requester_id = auth.uid());

drop policy if exists "connections: parties update" on public.connections;
create policy "connections: parties update"
  on public.connections for update
  using (addressee_id = auth.uid() or requester_id = auth.uid() or public.is_admin())
  with check (addressee_id = auth.uid() or requester_id = auth.uid() or public.is_admin());

drop policy if exists "connections: parties delete" on public.connections;
create policy "connections: parties delete"
  on public.connections for delete
  using (addressee_id = auth.uid() or requester_id = auth.uid() or public.is_admin());

-- messages --------------------------------------------------------------------
drop policy if exists "messages: parties read" on public.messages;
create policy "messages: parties read"
  on public.messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "messages: sender insert" on public.messages;
create policy "messages: sender insert"
  on public.messages for insert
  with check (sender_id = auth.uid());

drop policy if exists "messages: receiver mark read" on public.messages;
create policy "messages: receiver mark read"
  on public.messages for update
  using (receiver_id = auth.uid() or public.is_admin())
  with check (receiver_id = auth.uid() or public.is_admin());

drop policy if exists "messages: admin delete" on public.messages;
create policy "messages: admin delete"
  on public.messages for delete
  using (sender_id = auth.uid() or public.is_admin());

-- typing_indicators -----------------------------------------------------------
drop policy if exists "typing: parties read" on public.typing_indicators;
create policy "typing: parties read"
  on public.typing_indicators for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "typing: sender write" on public.typing_indicators;
create policy "typing: sender write"
  on public.typing_indicators for all
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- notifications ---------------------------------------------------------------
drop policy if exists "notifications: owner read" on public.notifications;
create policy "notifications: owner read"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications: owner update" on public.notifications;
create policy "notifications: owner update"
  on public.notifications for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications: system insert" on public.notifications;
drop policy if exists "notifications: service insert" on public.notifications;
create policy "notifications: service insert"
  on public.notifications for insert
  with check (public.is_admin());

drop policy if exists "notifications: owner delete" on public.notifications;
create policy "notifications: owner delete"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notification_preferences: owner read" on public.notification_preferences;
create policy "notification_preferences: owner read"
  on public.notification_preferences for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notification_preferences: owner write" on public.notification_preferences;
create policy "notification_preferences: owner write"
  on public.notification_preferences for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- activity_logs (admin only read) --------------------------------------------
drop policy if exists "activity_logs: admin read" on public.activity_logs;
create policy "activity_logs: admin read"
  on public.activity_logs for select
  using (public.is_admin());

drop policy if exists "activity_logs: system insert" on public.activity_logs;
create policy "activity_logs: system insert"
  on public.activity_logs for insert with check (true);

-- banners ---------------------------------------------------------------------
drop policy if exists "banners: public read" on public.banners;
create policy "banners: public read"
  on public.banners for select using (is_active = true or public.is_admin());

drop policy if exists "banners: admin write" on public.banners;
create policy "banners: admin write"
  on public.banners for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- REALTIME publication
-- ============================================================================
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.typing_indicators;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notification_preferences;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.connections;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- STORAGE
-- ============================================================================
-- Run this AFTER creating buckets manually OR using the snippet below.
-- Buckets: avatars (public), covers (public), banners (public), uploads (public)
do $$ begin
  insert into storage.buckets (id, name, public) values
    ('avatars', 'avatars', true),
    ('covers',  'covers',  true),
    ('banners', 'banners', true),
    ('uploads', 'uploads', true)
  on conflict (id) do nothing;
end $$;

drop policy if exists "storage: public read" on storage.objects;
create policy "storage: public read"
  on storage.objects for select using (bucket_id in ('avatars','covers','banners','uploads'));

drop policy if exists "storage: authenticated upload" on storage.objects;
create policy "storage: authenticated upload"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated'
    and bucket_id in ('avatars','covers','banners','uploads')
  );

drop policy if exists "storage: owner update" on storage.objects;
create policy "storage: owner update"
  on storage.objects for update
  using (auth.uid() = owner);

drop policy if exists "storage: owner delete" on storage.objects;
create policy "storage: owner delete"
  on storage.objects for delete
  using (auth.uid() = owner);

-- ============================================================================
-- Bootstrap your first admin (replace email)
-- ============================================================================
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- Profile image focal point (0–100%, maps to CSS object-position)
alter table public.profiles add column if not exists avatar_position_x smallint not null default 50 check (avatar_position_x between 0 and 100);
alter table public.profiles add column if not exists avatar_position_y smallint not null default 50 check (avatar_position_y between 0 and 100);
alter table public.profiles add column if not exists cover_position_x smallint not null default 50 check (cover_position_x between 0 and 100);
alter table public.profiles add column if not exists cover_position_y smallint not null default 50 check (cover_position_y between 0 and 100);
