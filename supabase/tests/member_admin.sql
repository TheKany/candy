-- Run after migrations in an isolated database; everything is rolled back.
begin;
insert into auth.users(id) values ('00000000-0000-4000-8000-00000000a101'),('00000000-0000-4000-8000-00000000a102');
insert into public.member_admins(user_id) values ('00000000-0000-4000-8000-00000000a101');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000a102',true);
set local role authenticated;
do $$ begin
  if public.is_member_admin() then raise exception 'NON_ADMIN_ALLOWED'; end if;
  begin perform public.admin_list_members('',0); raise exception 'LIST_ALLOWED'; exception when insufficient_privilege then null; end;
  begin insert into public.member_admins(user_id) values(auth.uid()); raise exception 'SELF_ADMIN_ALLOWED'; exception when insufficient_privilege then null; end;
end; $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000a101',true);
do $$ declare n text; v integer; begin
  select member_number into n from public.member_accounts where user_id='00000000-0000-4000-8000-00000000a102';
  if n !~ '^TR-[A-F0-9]{32}$' then raise exception 'INVALID_NUMBER'; end if;
  perform public.admin_set_member_role(n,'super');
  select role_version into v from public.member_accounts where member_number=n;
  perform public.admin_set_member_role(n,'super');
  if (select role_version from public.member_accounts where member_number=n)<>v then raise exception 'NOOP_CHANGED_VERSION'; end if;
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000a102',true);
  perform public.acknowledge_super_notice(v);
  if (select super_notice_ack_at from public.member_accounts where member_number=n) is null then raise exception 'ACK_MISSING'; end if;
  begin perform public.admin_list_members('',0); raise exception 'SUPER_IS_ADMIN'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000a101',true);
  perform public.admin_set_member_role(n,'member');
  perform public.admin_set_member_role(n,'super');
  if (select super_notice_ack_at from public.member_accounts where member_number=n) is not null then raise exception 'ACK_NOT_RESET'; end if;
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000a102',true);
  begin perform public.acknowledge_super_notice(v); raise exception 'OLD_ACK_ALLOWED'; exception when serialization_failure then null; end;
  if public.member_usage_status(null)<>'unused' or public.member_usage_status(now()-interval '90 days')<>'dormant' or public.member_usage_status(now()-interval '89 days')<>'active' then raise exception 'STATUS_BOUNDARY'; end if;
  begin update public.member_accounts set member_number=n where user_id='00000000-0000-4000-8000-00000000a101'; raise exception 'DUPLICATE_ALLOWED'; exception when unique_violation then null; end;
end; $$;
select 'checks_passed' as result;
rollback;
