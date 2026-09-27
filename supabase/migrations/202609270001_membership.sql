begin;
create table if not exists public.member_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','super')),
  super_notice_ack_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.member_accounts enable row level security;
revoke all on public.member_accounts from anon, authenticated;
grant select on public.member_accounts to authenticated;
create policy member_self_read on public.member_accounts for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.initialize_member() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.member_accounts(user_id) values (new.id) on conflict do nothing;
  return new;
end; $$;
revoke all on function public.initialize_member() from public, anon, authenticated;
create trigger initialize_tarot_member after insert on auth.users for each row execute function public.initialize_member();
insert into public.member_accounts(user_id) select id from auth.users on conflict do nothing;

create table if not exists public.saved_consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  consultation_id uuid not null,
  revision integer not null check (revision between 1 and 78),
  readings jsonb not null check (jsonb_typeof(readings) = 'array' and jsonb_array_length(readings) = revision and octet_length(readings::text) <= 1048576),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, consultation_id)
);
create index if not exists saved_consultations_owner_date on public.saved_consultations(user_id, updated_at desc);
alter table public.saved_consultations enable row level security;
revoke all on public.saved_consultations from anon, authenticated;
grant select, delete on public.saved_consultations to authenticated;
create policy own_member_consultations on public.saved_consultations for all to authenticated
using (user_id = (select auth.uid()) and exists (select 1 from public.member_accounts where user_id = (select auth.uid()) and role = 'member'))
with check (user_id = (select auth.uid()) and exists (select 1 from public.member_accounts where user_id = (select auth.uid()) and role = 'member'));

-- Writes use a narrow RPC: callers cannot set the owner, role, or overwrite a newer revision.
create or replace function public.save_consultation(p_consultation_id uuid, p_revision integer, p_readings jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := auth.uid(); saved_id uuid; owner_role text; reading jsonb; section jsonb; word jsonb;
begin
  -- Serialize saves with role changes: promotion must not race a pending save.
  select role into owner_role from public.member_accounts where user_id = owner_id for update;
  if owner_id is null or owner_role is distinct from 'member' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  -- The public RPC must validate too; browser callers can bypass the Next API.
  if p_consultation_id is null or p_revision is null or p_revision not between 1 and 78
    or p_readings is null or jsonb_typeof(p_readings) <> 'array' or octet_length(p_readings::text) > 1048576 then
    raise exception 'INVALID_PAYLOAD' using errcode = '22023';
  end if;
  if jsonb_array_length(p_readings) <> p_revision then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
  for reading in select value from jsonb_array_elements(p_readings) loop
    if jsonb_typeof(reading) <> 'object' then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
    if reading - array['title','question','keywords','sections'] <> '{}'::jsonb
      or jsonb_typeof(reading->'title') is distinct from 'string' or length(reading->>'title') > 150
      or (reading ? 'question' and (jsonb_typeof(reading->'question') <> 'string' or length(reading->>'question') > 1000))
      or jsonb_typeof(reading->'sections') is distinct from 'array' then
      raise exception 'INVALID_PAYLOAD' using errcode = '22023';
    end if;
    if reading ? 'keywords' then
      if jsonb_typeof(reading->'keywords') <> 'array' then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
      if jsonb_array_length(reading->'keywords') > 3 then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
      for word in select value from jsonb_array_elements(reading->'keywords') loop
        if jsonb_typeof(word) <> 'string' or length(word #>> '{}') > 30 then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
      end loop;
    end if;
    if jsonb_array_length(reading->'sections') not between 1 and 96 then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
    for section in select value from jsonb_array_elements(reading->'sections') loop
      if jsonb_typeof(section) <> 'object' then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
      if section - array['title','text','cardId'] <> '{}'::jsonb
        or jsonb_typeof(section->'title') is distinct from 'string' or length(section->>'title') > 200
        or jsonb_typeof(section->'text') is distinct from 'string' or length(section->>'text') > 20000 then
        raise exception 'INVALID_PAYLOAD' using errcode = '22023';
      end if;
      if section ? 'cardId' then
        if jsonb_typeof(section->'cardId') <> 'number' then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
        if (section->>'cardId')::numeric not between 0 and 77 or trunc((section->>'cardId')::numeric) <> (section->>'cardId')::numeric then raise exception 'INVALID_PAYLOAD' using errcode = '22023'; end if;
      end if;
    end loop;
  end loop;
  insert into public.saved_consultations(user_id, consultation_id, revision, readings)
    values(owner_id, p_consultation_id, p_revision, p_readings)
  on conflict(user_id, consultation_id) do update set readings = excluded.readings, revision = excluded.revision, updated_at = now()
    where public.saved_consultations.revision <= excluded.revision
  returning id into saved_id;
  if saved_id is null then raise exception 'STALE_REVISION' using errcode = '40001'; end if;
  return saved_id;
end; $$;
revoke all on function public.save_consultation(uuid,integer,jsonb) from public, anon;
grant execute on function public.save_consultation(uuid,integer,jsonb) to authenticated;

create or replace function public.acknowledge_super_notice() returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.member_accounts set super_notice_ack_at = coalesce(super_notice_ack_at, now()) where user_id = auth.uid() and role = 'super';
  if not found then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
end; $$;
revoke all on function public.acknowledge_super_notice() from public, anon;
grant execute on function public.acknowledge_super_notice() to authenticated;

create or replace function public.guard_super_history() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role = 'super' and exists(select 1 from public.saved_consultations where user_id = new.user_id) then
    raise exception 'Remove saved history with consent before granting super access';
  end if;
  return new;
end; $$;
create trigger guard_tarot_super_history before update of role on public.member_accounts for each row execute function public.guard_super_history();
commit;
