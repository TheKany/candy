-- Run in the SQL editor after the migration; all fixtures are rolled back.
begin;
do $$
declare u uuid:=gen_random_uuid(); other_user uuid:=gen_random_uuid(); request uuid:=gen_random_uuid(); result jsonb;
begin
  insert into auth.users(id) values(u),(other_user);
  insert into public.member_wallets(user_id,premium,basic) values(u,1,3),(other_user,5,7);
  perform set_config('request.jwt.claim.sub',u::text,true);
  result:=public.exchange_member_sheet(request);
  if result->>'premium'<>'0' or result->>'basic'<>'5' then raise exception 'EXCHANGE_MISMATCH'; end if;
  result:=public.exchange_member_sheet(request);
  if result->>'basic'<>'5' or result->>'replayed'<>'true' then raise exception 'DUPLICATE_EXCHANGE'; end if;
  begin
    perform public.exchange_member_sheet(gen_random_uuid());
    raise exception 'MISSING_BALANCE_CHECK';
  exception when invalid_parameter_value then null; end;
  if exists(select 1 from public.member_wallets where user_id=other_user and (premium<>5 or basic<>7)) then raise exception 'OTHER_ACCOUNT_CHANGED'; end if;
  perform public.apply_sheet_event(u,u||':use1','use_basic');
  perform public.apply_sheet_event(u,u||':use2','use_free');
  if (select basic from public.member_wallets where user_id=u)<>3 then raise exception 'DAILY_USE_LIMIT_REMAINS'; end if;
  perform public.apply_sheet_event(u,u||':ad1','ad');
  perform public.apply_sheet_event(u,u||':ad2','ad');
  perform public.apply_sheet_event(u,u||':ad3','ad');
  if (select basic from public.member_wallets where user_id=u)<>4 then raise exception 'AD_REWARD_MISMATCH'; end if;
  if public.apply_sheet_event(u,u||':ad3','ad') then raise exception 'DUPLICATE_REWARD'; end if;
  begin
    perform public.apply_sheet_event(u,u||':ad4','ad');
    raise exception 'MISSING_AD_LIMIT';
  exception when invalid_parameter_value then null; end;
  perform set_config('request.jwt.claim.sub','',true);
  begin
    perform public.exchange_member_sheet(gen_random_uuid());
    raise exception 'MISSING_AUTH';
  exception when insufficient_privilege then null; end;
  if has_table_privilege('authenticated','public.member_wallets','UPDATE')
    or has_function_privilege('anon','public.exchange_member_sheet(uuid)','EXECUTE')
    or has_function_privilege('authenticated','public.apply_sheet_event(uuid,text,text,integer)','EXECUTE')
    or not has_function_privilege('authenticated','public.exchange_member_sheet(uuid)','EXECUTE') then raise exception 'UNSAFE_PERMISSIONS'; end if;
end $$;
rollback;
select 'PASS: exchange, retry, insufficient balance, account isolation, rewards, permissions; fixtures rolled back' as verification;
