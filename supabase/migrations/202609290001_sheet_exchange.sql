begin;
-- Guard the one-time balance transfer; legacy columns remain for old deployments.
do $$ begin
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='member_wallets' and column_name='basic') then
    alter table public.member_wallets add column basic integer not null default 0 check(basic>=0);
    alter table public.member_wallets add column premium integer not null default 0 check(premium>=0);
    update public.member_wallets set basic=paid+free,paid=0,free=0;
  end if;
end $$;

create table if not exists public.member_sheet_exchanges (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
alter table public.member_sheet_exchanges enable row level security;
revoke all on public.member_sheet_exchanges from public,anon,authenticated;

create or replace function public.exchange_member_sheet(p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); w public.member_wallets%rowtype;
begin
  if u is null or not exists(select 1 from public.member_accounts where user_id=u) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_request is null then raise exception 'INVALID_REQUEST' using errcode='22023'; end if;
  insert into public.member_wallets(user_id) values(u) on conflict do nothing;
  select * into w from public.member_wallets where user_id=u for update;
  if exists(select 1 from public.member_sheet_exchanges where user_id=u and request_id=p_request) then
    return jsonb_build_object('premium',w.premium,'basic',w.basic,'replayed',true);
  end if;
  if w.premium<1 then raise exception 'PREMIUM_UNAVAILABLE' using errcode='22023'; end if;
  update public.member_wallets set premium=premium-1,basic=basic+2 where user_id=u returning * into w;
  insert into public.member_sheet_exchanges(user_id,request_id) values(u,p_request);
  return jsonb_build_object('premium',w.premium,'basic',w.basic,'replayed',false);
end $$;
revoke all on function public.exchange_member_sheet(uuid) from public,anon;
grant execute on function public.exchange_member_sheet(uuid) to authenticated;

alter table public.member_sheet_events drop constraint if exists member_sheet_events_kind_check;
alter table public.member_sheet_events add constraint member_sheet_events_kind_check
  check(kind in ('ad','purchase','use_paid','use_free','purchase_basic','purchase_premium','use_basic','use_premium'));

create or replace function public.apply_sheet_event(p_user uuid,p_event text,p_kind text,p_quantity integer default 1)
returns boolean language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; w public.member_wallets%rowtype; d public.member_reward_days%rowtype;
begin
  if p_kind is null or p_kind not in ('ad','purchase','use_paid','use_free','purchase_basic','purchase_premium','use_basic','use_premium') or p_quantity is null or p_quantity<1 or p_quantity>1000 or (p_kind not in ('purchase','purchase_basic','purchase_premium') and p_quantity<>1) then raise exception 'INVALID_EVENT' using errcode='22023'; end if;
  if not exists(select 1 from public.member_accounts where user_id=p_user) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  insert into public.member_wallets(user_id) values(p_user) on conflict do nothing;
  select * into w from public.member_wallets where user_id=p_user for update;
  insert into public.member_sheet_events(event_id,user_id,kind) values(p_event,p_user,p_kind) on conflict do nothing;
  if not found then return false; end if;
  if p_kind='ad' then
    insert into public.member_reward_days(user_id,day) values(p_user,today) on conflict do nothing;
    select * into d from public.member_reward_days where user_id=p_user and day=today for update;
    if d.ads>=3 then raise exception 'DAILY_AD_LIMIT' using errcode='22023'; end if;
    update public.member_reward_days set ads=ads+1 where user_id=p_user and day=today;
    if d.ads=2 then update public.member_wallets set basic=basic+1 where user_id=p_user; end if;
  elsif p_kind='purchase_premium' then
    update public.member_wallets set premium=premium+p_quantity where user_id=p_user;
  elsif p_kind in ('purchase','purchase_basic') then
    update public.member_wallets set basic=basic+p_quantity where user_id=p_user;
  elsif p_kind='use_premium' then
    if w.premium<1 then raise exception 'PREMIUM_UNAVAILABLE' using errcode='22023'; end if;
    update public.member_wallets set premium=premium-1 where user_id=p_user;
  else
    -- Legacy paid/free consumption also uses the unified balance, without a daily cap.
    if w.basic<1 then raise exception 'BASIC_UNAVAILABLE' using errcode='22023'; end if;
    update public.member_wallets set basic=basic-1 where user_id=p_user;
  end if;
  return true;
end $$;
revoke all on function public.apply_sheet_event(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.apply_sheet_event(uuid,text,text,integer) to service_role;
commit;
