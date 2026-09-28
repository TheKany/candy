begin;
alter table public.member_accounts add column representative_card smallint check (representative_card between 0 and 77);
create or replace function public.set_representative_card(p_card integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_card is not null and p_card not between 0 and 77 then raise exception 'INVALID_CARD' using errcode='22023'; end if;
  update public.member_accounts set representative_card=p_card where user_id=auth.uid();
  if not found then raise exception 'FORBIDDEN' using errcode='42501'; end if;
end; $$;
revoke all on function public.set_representative_card(integer) from public, anon;
grant execute on function public.set_representative_card(integer) to authenticated;

create table public.member_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  paid integer not null default 0 check(paid>=0),
  free integer not null default 0 check(free>=0)
);
create table public.member_reward_days (
  user_id uuid references auth.users(id) on delete cascade,
  day date not null,
  ads integer not null default 0 check(ads between 0 and 3),
  free_used boolean not null default false,
  primary key(user_id,day)
);
-- Only a verified provider callback may create these events; never browser callbacks.
create table public.member_sheet_events (
  event_id text primary key check(length(event_id) between 1 and 200),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check(kind in ('ad','purchase','use_paid','use_free')),
  created_at timestamptz not null default now()
);
create table public.member_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  consultation_id uuid not null,
  ordinal smallint not null check(ordinal between 1 and 78),
  kind text not null check(kind in ('one','three','five','monthly','saved')),
  topic text not null check(topic in ('일·커리어','금전','연애','인간관계','나 자신','월별 흐름','타로 상담')),
  created_at timestamptz not null default now(),
  primary key(user_id,consultation_id,ordinal)
);
create index member_activity_recent on public.member_activity(user_id,created_at desc);
alter table public.member_wallets enable row level security;
alter table public.member_reward_days enable row level security;
alter table public.member_sheet_events enable row level security;
alter table public.member_activity enable row level security;
revoke all on public.member_wallets, public.member_reward_days, public.member_sheet_events, public.member_activity from anon, authenticated;
grant select on public.member_wallets, public.member_reward_days, public.member_activity to authenticated;
create policy own_wallet on public.member_wallets for select to authenticated using(user_id=(select auth.uid()));
create policy own_reward_day on public.member_reward_days for select to authenticated using(user_id=(select auth.uid()));
create policy own_activity on public.member_activity for select to authenticated using(user_id=(select auth.uid()));

create or replace function public.record_member_activity(p_consultation uuid,p_ordinal integer,p_kind text,p_topic text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.member_accounts where user_id=auth.uid()) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  -- Cosmetic history only. These rows never grant balance, rewards, or reading access.
  insert into public.member_activity(user_id,consultation_id,ordinal,kind,topic)
  values(auth.uid(),p_consultation,p_ordinal,p_kind,p_topic) on conflict do nothing;
end; $$;
revoke all on function public.record_member_activity(uuid,integer,text,text) from public, anon;
grant execute on function public.record_member_activity(uuid,integer,text,text) to authenticated;

-- Backfill only already-saved history; no question or interpretation is copied.
insert into public.member_activity(user_id,consultation_id,ordinal,kind,topic,created_at)
select s.user_id,s.consultation_id,step.ordinal,'saved','타로 상담',s.created_at from public.saved_consultations s cross join lateral generate_series(1,s.revision) as step(ordinal) on conflict do nothing;

-- Server-only transactions. Browser roles have neither table writes nor execute.
-- event IDs must be provider-namespaced, verified and stable across retries.
create or replace function public.apply_sheet_event(p_user uuid,p_event text,p_kind text,p_quantity integer default 1)
returns boolean language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; w public.member_wallets%rowtype; d public.member_reward_days%rowtype;
begin
  if p_kind is null or p_kind not in ('ad','purchase','use_paid','use_free') or p_quantity is null or p_quantity<1 or p_quantity>1000 or (p_kind<>'purchase' and p_quantity<>1) then raise exception 'INVALID_EVENT' using errcode='22023'; end if;
  if not exists(select 1 from public.member_accounts where user_id=p_user) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  insert into public.member_wallets(user_id) values(p_user) on conflict do nothing;
  select * into w from public.member_wallets where user_id=p_user for update;
  insert into public.member_sheet_events(event_id,user_id,kind) values(p_event,p_user,p_kind) on conflict do nothing;
  if not found then return false; end if;
  insert into public.member_reward_days(user_id,day) values(p_user,today) on conflict do nothing;
  select * into d from public.member_reward_days where user_id=p_user and day=today for update;
  if p_kind='ad' then
    if d.ads>=3 then raise exception 'DAILY_AD_LIMIT' using errcode='22023'; end if;
    update public.member_reward_days set ads=ads+1 where user_id=p_user and day=today;
    if d.ads=2 then update public.member_wallets set free=free+1 where user_id=p_user; end if;
  elsif p_kind='purchase' then
    update public.member_wallets set paid=paid+p_quantity where user_id=p_user;
  elsif p_kind='use_free' then
    if d.free_used or w.free<1 then raise exception 'FREE_UNAVAILABLE' using errcode='22023'; end if;
    update public.member_wallets set free=free-1 where user_id=p_user;
    update public.member_reward_days set free_used=true where user_id=p_user and day=today;
  else
    if w.paid<1 then raise exception 'PAID_UNAVAILABLE' using errcode='22023'; end if;
    update public.member_wallets set paid=paid-1 where user_id=p_user;
  end if;
  return true;
end; $$;
revoke all on function public.apply_sheet_event(uuid,text,text,integer) from public, anon, authenticated;
grant execute on function public.apply_sheet_event(uuid,text,text,integer) to service_role;
commit;
