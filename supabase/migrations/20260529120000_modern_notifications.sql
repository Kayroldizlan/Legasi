-- Modern notification system migration for Legasi Connect Directory
-- Run in Supabase SQL Editor if not using automated migrations.

-- ---------------------------------------------------------------------------
-- Extend notification types
-- ---------------------------------------------------------------------------
do $$ begin
  alter type public.notification_type add value if not exists 'new_follower';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'reply';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'community_invite';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'community_event';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'community_announcement';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'business_inquiry';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'partnership_request';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'verification_approved';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'admin_notice';
exception when duplicate_object then null; end $$;
do $$ begin
  alter type public.notification_type add value if not exists 'security_alert';
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- notifications table enhancements
-- ---------------------------------------------------------------------------
alter table public.notifications
  rename column body to message;

alter table public.notifications
  add column if not exists image_url text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

create index if not exists notifications_type_idx
  on public.notifications (type);

create index if not exists notifications_metadata_group_idx
  on public.notifications ((metadata->>'group_key'));

-- ---------------------------------------------------------------------------
-- notification preferences
-- ---------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  type_settings jsonb not null default '{}'::jsonb,
  email_enabled boolean not null default true,
  push_enabled  boolean not null default false,
  sound_enabled boolean not null default true,
  updated_at    timestamptz not null default now()
);

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences: owner read" on public.notification_preferences;
create policy "notification_preferences: owner read"
  on public.notification_preferences for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notification_preferences: owner write" on public.notification_preferences;
create policy "notification_preferences: owner write"
  on public.notification_preferences for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Secure notification creation (server / triggers only)
-- ---------------------------------------------------------------------------
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
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

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

      if p_actor_id is not null
        and not v_actor_ids ? p_actor_id::text then
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
    p_user_id,
    p_actor_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_image_url,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_record;

  return v_record;
end;
$$;

revoke all on function public.create_notification(uuid, uuid, public.notification_type, text, text, text, text, jsonb) from public;
grant execute on function public.create_notification(uuid, uuid, public.notification_type, text, text, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger updates
-- ---------------------------------------------------------------------------
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
end;
$$;

create or replace function public.notify_connection_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_actor_name text;
  v_username text;
begin
  if new.status = 'accepted' and old.status = 'pending' then
    select full_name, username
    into v_actor_name, v_username
    from public.profiles
    where id = new.addressee_id;

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
end;
$$;

drop trigger if exists on_connection_accepted on public.connections;
create trigger on_connection_accepted
  after update on public.connections
  for each row execute function public.notify_connection_accepted();

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
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS hardening
-- ---------------------------------------------------------------------------
drop policy if exists "notifications: system insert" on public.notifications;
create policy "notifications: service insert"
  on public.notifications for insert
  with check (public.is_admin());

drop policy if exists "notifications: owner delete" on public.notifications;
create policy "notifications: owner delete"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin());

-- Realtime (idempotent)
do $$ begin
  alter publication supabase_realtime add table public.notification_preferences;
exception when duplicate_object then null; end $$;
