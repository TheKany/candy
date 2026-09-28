-- Synthetic data only; run after 202609270003_mypage.sql. Always roll back.
begin;
insert into auth.users(id) values('00000000-0000-4000-8000-000000000e01'),('00000000-0000-4000-8000-000000000e02');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000e01',true);
select public.set_representative_card(17);
select public.record_member_activity('00000000-0000-4000-8000-000000000f01',1,'one','타로 상담');
select public.record_member_activity('00000000-0000-4000-8000-000000000f01',1,'one','타로 상담');
do $$ begin
 if (select count(*) from public.member_activity)<>1 then raise exception 'Duplicate history'; end if;
 if (select representative_card from public.member_accounts where user_id=auth.uid())<>17 then raise exception 'Card not saved'; end if;
 begin perform public.set_representative_card(78); raise exception 'Invalid card accepted'; exception when invalid_parameter_value then null; end;
 begin perform public.apply_sheet_event(auth.uid(),'mypage-test-hack','purchase',100); raise exception 'Browser can grant sheets'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-1','ad');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-1','ad');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-2','ad');
do $$ begin
 if (select free from public.member_wallets where user_id='00000000-0000-4000-8000-000000000e01')<>0 then raise exception 'Reward too early'; end if;
end $$;
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-3','ad');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-buy','purchase',3);
do $$ begin
 if (select free from public.member_wallets where user_id='00000000-0000-4000-8000-000000000e01')<>1 then raise exception 'Reward incorrect'; end if;
 begin perform public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-4','ad'); raise exception 'Fourth ad allowed'; exception when invalid_parameter_value then null; end;
end $$;
-- Accumulate another day's reward before spending: free balance must become 2.
update public.member_reward_days set day=day-1 where user_id='00000000-0000-4000-8000-000000000e01';
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-next1','ad');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-next2','ad');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-next3','ad');
do $$ begin
 if (select free from public.member_wallets where user_id='00000000-0000-4000-8000-000000000e01')<>2 then raise exception 'Free balance not accumulated'; end if;
end $$;
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-free','use_free');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-paid1','use_paid');
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-paid2','use_paid');
do $$ begin
 begin perform public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-free2','use_free'); raise exception 'Second free use allowed'; exception when invalid_parameter_value then null; end;
 if (select paid from public.member_wallets where user_id='00000000-0000-4000-8000-000000000e01')<>1 then raise exception 'Paid uses incorrectly limited'; end if;
end $$;
-- Existing free balance is usable again on the next day.
update public.member_reward_days set day=day-10 where user_id='00000000-0000-4000-8000-000000000e01';
select public.apply_sheet_event('00000000-0000-4000-8000-000000000e01','mypage-test-next-use','use_free');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000e02',true);
do $$ begin
 if exists(select 1 from public.member_wallets) or exists(select 1 from public.member_activity) or exists(select 1 from public.member_reward_days) then raise exception 'Other account can read'; end if;
end $$;
rollback;
