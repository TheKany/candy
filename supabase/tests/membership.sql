-- Run after membership and super_manual_save migrations. Synthetic identities; all changes roll back.
begin;
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000a01'),
 ('00000000-0000-4000-8000-000000000b01'),
 ('00000000-0000-4000-8000-000000000c01');
update public.member_accounts set role = 'super' where user_id = '00000000-0000-4000-8000-000000000c01';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000a01',true);
select public.save_consultation('00000000-0000-4000-8000-000000000d01',1,'[{"title":"Synthetic","sections":[{"title":"Card","text":"Test only","cardId":0}]}]');
select public.save_consultation('00000000-0000-4000-8000-000000000d01',1,'[{"title":"Synthetic","sections":[{"title":"Card","text":"Test only","cardId":0}]}]');
do $$ begin
  if (select count(*) from public.saved_consultations) <> 1 then raise exception 'Duplicate save'; end if;
  begin
    update public.member_accounts set role = 'super' where user_id = auth.uid();
    raise exception 'Role escalation permitted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_consultation('00000000-0000-4000-8000-000000000d02',1,'[{}]');
    raise exception 'Invalid payload permitted';
  exception when invalid_parameter_value then null; end;
end $$;
select public.save_consultation('00000000-0000-4000-8000-000000000d01',2,'[{"title":"Synthetic","sections":[{"title":"Card","text":"Test only"}]},{"title":"Followup","sections":[{"title":"Card","text":"Test only"}]}]');
do $$ begin
  begin
    perform public.save_consultation('00000000-0000-4000-8000-000000000d01',1,'[{"title":"Old","sections":[{"title":"Card","text":"Old"}]}]');
    raise exception 'Stale overwrite permitted';
  exception when serialization_failure then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000b01',true);
do $$ declare removed integer; begin
  if exists(select 1 from public.saved_consultations) then raise exception 'Other member can read'; end if;
  delete from public.saved_consultations where consultation_id = '00000000-0000-4000-8000-000000000d01';
  get diagnostics removed = row_count;
  if removed <> 0 then raise exception 'Other member can delete'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000c01',true);
do $$ declare removed integer; begin
  if exists(select 1 from public.saved_consultations) then raise exception 'Super can read other accounts'; end if;
  perform public.save_consultation('00000000-0000-4000-8000-000000000d03',1,'[{"title":"Super","keywords":["Career"],"sections":[{"title":"Card","text":"Test only"}]}]');
  if (select count(*) from public.saved_consultations) <> 1 then raise exception 'Super cannot read own save'; end if;
  if exists(select 1 from public.saved_consultations where readings->0 ? 'question') then raise exception 'Unexpected question stored'; end if;
  delete from public.saved_consultations where consultation_id = '00000000-0000-4000-8000-000000000d01';
  get diagnostics removed = row_count;
  if removed <> 0 then raise exception 'Super can delete other accounts'; end if;
  delete from public.saved_consultations where consultation_id = '00000000-0000-4000-8000-000000000d03';
  get diagnostics removed = row_count;
  if removed <> 1 then raise exception 'Super cannot delete own save'; end if;
end $$;
select public.acknowledge_super_notice();
do $$ declare first_ack timestamptz; begin
  select super_notice_ack_at into first_ack from public.member_accounts where user_id = auth.uid();
  perform public.acknowledge_super_notice();
  if first_ack is null or first_ack is distinct from (select super_notice_ack_at from public.member_accounts where user_id = auth.uid()) then raise exception 'Ack not persistent'; end if;
end $$;
set local role anon;
do $$ begin
  begin
    perform public.save_consultation('00000000-0000-4000-8000-000000000d04',1,'[]');
    raise exception 'Anonymous save permitted';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
