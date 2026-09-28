begin;
alter table public.member_accounts add column member_number text unique;
alter table public.member_accounts add column role_version integer not null default 0 check(role_version>=0);
do $$ declare r record; begin
  for r in select user_id from public.member_accounts where member_number is null loop
    loop
      begin
        update public.member_accounts set member_number='TR-'||upper(replace(gen_random_uuid()::text,'-','')) where user_id=r.user_id;
        exit;
      exception when unique_violation then null;
      end;
    end loop;
  end loop;
end; $$;
alter table public.member_accounts alter column member_number set not null;
alter table public.member_accounts add constraint member_number_format check(member_number ~ '^TR-[A-F0-9]{32}$');
create or replace function public.initialize_member() returns trigger language plpgsql security definer set search_path='' as $$
begin
  loop
    begin
      insert into public.member_accounts(user_id,member_number) values(new.id,'TR-'||upper(replace(gen_random_uuid()::text,'-',''))) on conflict(user_id) do nothing;
      return new;
    exception when unique_violation then null;
    end;
  end loop;
end; $$;

create table public.member_admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table public.member_role_changes(
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  member_number text not null,
  old_role text not null, new_role text not null,
  created_at timestamptz not null default now()
);
alter table public.member_admins enable row level security;
alter table public.member_role_changes enable row level security;
revoke all on public.member_admins,public.member_role_changes from public,anon,authenticated;
create or replace function public.is_member_admin() returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.member_admins where user_id=auth.uid());
$$;
revoke all on function public.is_member_admin() from public,anon;
grant execute on function public.is_member_admin() to authenticated;

create function public.track_member_role() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.role is distinct from old.role then
    new.role_version=old.role_version+1;
    new.super_notice_ack_at=null;
    insert into public.member_role_changes(actor_id,member_number,old_role,new_role) values(auth.uid(),old.member_number,old.role,new.role);
  end if;
  return new;
end; $$;
revoke all on function public.track_member_role() from public,anon,authenticated;
create trigger track_member_role before update of role on public.member_accounts for each row execute function public.track_member_role();

create function public.member_usage_status(p_last timestamptz) returns text language sql stable set search_path='' as $$
  select case when p_last is null then 'unused' when p_last<=now()-interval '90 days' then 'dormant' else 'active' end;
$$;
revoke all on function public.member_usage_status(timestamptz) from public,anon,authenticated;

create function public.admin_list_members(p_search text default '',p_offset integer default 0) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not public.is_member_admin() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_search is null or length(p_search)>35 or p_search !~ '^[A-Z0-9-]*$' or p_offset is null or p_offset<0 or p_offset>1000000 then raise exception 'INVALID_INPUT' using errcode='22023'; end if;
  with page as (
    select m.member_number,m.created_at,m.role,
      public.member_usage_status((select max(a.created_at) from public.member_activity a where a.user_id=m.user_id)) as status
    from public.member_accounts m where m.member_number like p_search||'%'
    order by m.created_at desc,m.member_number limit 21 offset p_offset
  ), numbered as (select *,row_number() over(order by created_at desc,member_number) as rn from page)
  select jsonb_build_object('items',coalesce(jsonb_agg(jsonb_build_object('memberNumber',member_number,'createdAt',created_at,'role',role,'status',status) order by rn) filter(where rn<=20),'[]'::jsonb),'hasMore',count(*)>20) into result from numbered;
  return result;
end; $$;
create function public.admin_set_member_role(p_member_number text,p_role text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not public.is_member_admin() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_role is null or p_role not in ('member','super') then raise exception 'INVALID_ROLE' using errcode='22023'; end if;
  perform 1 from public.member_accounts where member_number=p_member_number for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  update public.member_accounts set role=p_role where member_number=p_member_number and role<>p_role;
end; $$;
create function public.admin_member_detail(p_member_number text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
  if not public.is_member_admin() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if not exists(select 1 from public.member_accounts where member_number=p_member_number) then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  -- Payment integration is not implemented. Do not fabricate payments from sheet events.
  return jsonb_build_object('memberNumber',p_member_number,'payments','[]'::jsonb,'paymentsConnected',false);
end; $$;
revoke all on function public.admin_list_members(text,integer),public.admin_set_member_role(text,text),public.admin_member_detail(text) from public,anon;
grant execute on function public.admin_list_members(text,integer),public.admin_set_member_role(text,text),public.admin_member_detail(text) to authenticated;

drop function public.acknowledge_super_notice();
create function public.acknowledge_super_notice(p_role_version integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  update public.member_accounts set super_notice_ack_at=coalesce(super_notice_ack_at,now())
  where user_id=auth.uid() and role='super' and role_version=p_role_version;
  if not found then raise exception 'STALE_ROLE' using errcode='40001'; end if;
end; $$;
revoke all on function public.acknowledge_super_notice(integer) from public,anon;
grant execute on function public.acknowledge_super_notice(integer) to authenticated;
commit;
