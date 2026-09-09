-- LocalPlatform realtime migration. Run once in Supabase SQL Editor.
-- It is idempotent and never uses a service-role key in client code.

create extension if not exists pgcrypto;

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, customer_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid null references public.businesses(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  media_url text null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  check (media_url is null or media_url ~* '^https?://')
);

create table if not exists public.status_reactions (
  status_id uuid not null references public.statuses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like')),
  created_at timestamptz not null default now(),
  primary key (status_id, user_id)
);

create table if not exists public.status_replies (
  id uuid primary key default gen_random_uuid(),
  status_id uuid not null references public.statuses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists chat_conversations_customer_idx on public.chat_conversations(customer_id, updated_at desc);
create index if not exists chat_conversations_business_idx on public.chat_conversations(business_id, updated_at desc);
create index if not exists chat_messages_conversation_idx on public.chat_messages(conversation_id, created_at);
create index if not exists statuses_active_idx on public.statuses(expires_at desc, created_at desc);
create index if not exists statuses_business_idx on public.statuses(business_id, created_at desc);
create index if not exists status_replies_status_idx on public.status_replies(status_id, created_at);

create or replace function public.localplatform_touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversations set updated_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists chat_message_updates_conversation on public.chat_messages;
create trigger chat_message_updates_conversation
  after insert on public.chat_messages
  for each row execute function public.localplatform_touch_conversation();

create or replace function public.localplatform_lock_message_fields()
returns trigger
language plpgsql
as $$
begin
  if new.conversation_id <> old.conversation_id or new.sender_id <> old.sender_id or new.body <> old.body or new.created_at <> old.created_at then
    raise exception 'message fields are immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists chat_message_fields_immutable on public.chat_messages;
create trigger chat_message_fields_immutable
  before update on public.chat_messages
  for each row execute function public.localplatform_lock_message_fields();

create or replace function public.localplatform_lock_conversation_fields()
returns trigger
language plpgsql
as $$
begin
  if new.business_id <> old.business_id or new.customer_id <> old.customer_id or new.created_at <> old.created_at then
    raise exception 'conversation participants are immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists chat_conversation_fields_immutable on public.chat_conversations;
create trigger chat_conversation_fields_immutable
  before update on public.chat_conversations
  for each row execute function public.localplatform_lock_conversation_fields();

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.statuses enable row level security;
alter table public.status_reactions enable row level security;
alter table public.status_replies enable row level security;

drop policy if exists "chat participants can view conversations" on public.chat_conversations;
create policy "chat participants can view conversations" on public.chat_conversations
  for select to authenticated
  using (customer_id = auth.uid() or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "users can start business conversations" on public.chat_conversations;
create policy "users can start business conversations" on public.chat_conversations
  for insert to authenticated
  with check (customer_id = auth.uid() and exists (select 1 from public.businesses b where b.id = business_id and b.listing_status = 'active'));

drop policy if exists "chat participants can update conversation" on public.chat_conversations;
create policy "chat participants can update conversation" on public.chat_conversations
  for update to authenticated
  using (customer_id = auth.uid() or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (customer_id = auth.uid() or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "chat participants can view messages" on public.chat_messages;
create policy "chat participants can view messages" on public.chat_messages
  for select to authenticated
  using (exists (select 1 from public.chat_conversations c left join public.businesses b on b.id = c.business_id where c.id = conversation_id and (c.customer_id = auth.uid() or b.owner_id = auth.uid())));

drop policy if exists "participants can send messages" on public.chat_messages;
create policy "participants can send messages" on public.chat_messages
  for insert to authenticated
  with check (sender_id = auth.uid() and exists (select 1 from public.chat_conversations c left join public.businesses b on b.id = c.business_id where c.id = conversation_id and (c.customer_id = auth.uid() or b.owner_id = auth.uid())));

drop policy if exists "participants can mark messages read" on public.chat_messages;
create policy "participants can mark messages read" on public.chat_messages
  for update to authenticated
  using (exists (select 1 from public.chat_conversations c left join public.businesses b on b.id = c.business_id where c.id = conversation_id and (c.customer_id = auth.uid() or b.owner_id = auth.uid())))
  with check (exists (select 1 from public.chat_conversations c left join public.businesses b on b.id = c.business_id where c.id = conversation_id and (c.customer_id = auth.uid() or b.owner_id = auth.uid())));

drop policy if exists "public can view live statuses" on public.statuses;
create policy "public can view live statuses" on public.statuses
  for select using (expires_at > now());

drop policy if exists "members can create statuses" on public.statuses;
create policy "members can create statuses" on public.statuses
  for insert to authenticated
  with check (author_id = auth.uid() and (business_id is null or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())) and expires_at > now() and expires_at <= now() + interval '24 hours' + interval '5 minutes');

drop policy if exists "authors can delete statuses" on public.statuses;
create policy "authors can delete statuses" on public.statuses
  for delete to authenticated using (author_id = auth.uid());

drop policy if exists "public can view live reactions" on public.status_reactions;
create policy "public can view live reactions" on public.status_reactions
  for select using (exists (select 1 from public.statuses s where s.id = status_id and s.expires_at > now()));

drop policy if exists "members can react to live statuses" on public.status_reactions;
create policy "members can react to live statuses" on public.status_reactions
  for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.statuses s where s.id = status_id and s.expires_at > now()));

drop policy if exists "members can remove their reaction" on public.status_reactions;
create policy "members can remove their reaction" on public.status_reactions
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "public can view replies on live statuses" on public.status_replies;
create policy "public can view replies on live statuses" on public.status_replies
  for select using (exists (select 1 from public.statuses s where s.id = status_id and s.expires_at > now()));

drop policy if exists "members can reply to live statuses" on public.status_replies;
create policy "members can reply to live statuses" on public.status_replies
  for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.statuses s where s.id = status_id and s.expires_at > now()));

drop policy if exists "members can delete their replies" on public.status_replies;
create policy "members can delete their replies" on public.status_replies
  for delete to authenticated using (user_id = auth.uid());

do $$
declare table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['chat_conversations','chat_messages','statuses','status_reactions','status_replies'] loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end $$;
