-- Read-only checks against existing members; no fixtures or account changes.
begin;
do $$
declare admin_id uuid; item jsonb; member_id uuid;
begin
  perform set_config('request.jwt.claim.sub', '', true);
  begin
    perform public.admin_list_members('', 0);
    raise exception 'NON_ADMIN_LIST_ALLOWED';
  exception when insufficient_privilege then null;
  end;
  select user_id into admin_id from public.member_admins limit 1;
  if admin_id is null then raise exception 'ADMIN_REQUIRED_FOR_CHECK'; end if;
  perform set_config('request.jwt.claim.sub', admin_id::text, true);
  for item in select jsonb_array_elements(public.admin_list_members('', 0)->'items') loop
    select user_id into strict member_id from public.member_accounts
      where member_number=item->>'memberNumber';
    if (item->>'usageCount')::bigint is distinct from
      (select count(*) from public.member_activity where user_id=member_id)
      or (item->>'basicPurchaseCount')::bigint is distinct from
      (select count(*) from public.member_sheet_events where user_id=member_id and kind in ('purchase','purchase_basic'))
      or (item->>'premiumPurchaseCount')::bigint is distinct from
      (select count(*) from public.member_sheet_events where user_id=member_id and kind='purchase_premium')
      then raise exception 'COUNT_MISMATCH'; end if;
    if (item->>'kakaoEmail') is distinct from
      (select nullif(btrim(identity_data->>'email'), '') from auth.identities
       where user_id=member_id and provider='kakao' order by created_at desc, id limit 1)
      then raise exception 'KAKAO_EMAIL_MISMATCH'; end if;
  end loop;
  if has_function_privilege('anon','public.admin_list_members(text,integer)','EXECUTE')
    then raise exception 'ANON_EXECUTE_ALLOWED'; end if;
end;
$$;
rollback;
select 'PASS: member counts, Kakao email, administrator access' as verification;
