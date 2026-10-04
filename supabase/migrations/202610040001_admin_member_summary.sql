begin;

-- Add summary fields without changing the existing administrator-only access.
create or replace function public.admin_list_members(p_search text default '', p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not public.is_member_admin() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_search is null or length(p_search)>35 or p_search !~ '^[A-Z0-9-]*$'
    or p_offset is null or p_offset<0 or p_offset>1000000 then
    raise exception 'INVALID_INPUT' using errcode='22023';
  end if;

  with page as (
    select m.user_id, m.member_number, m.created_at, m.role
    from public.member_accounts m
    where m.member_number like p_search||'%'
    order by m.created_at desc, m.member_number limit 21 offset p_offset
  ), summaries as (
    select p.*,
      -- Only an email supplied by the Kakao identity; never invent one from an ID.
      (select nullif(btrim(i.identity_data->>'email'), '')
       from auth.identities i where i.user_id=p.user_id and i.provider='kakao'
       order by i.created_at desc, i.id limit 1) as kakao_email,
      a.usage_count, public.member_usage_status(a.last_used) as status,
      e.basic_purchases, e.premium_purchases
    from page p
    cross join lateral (
      select count(*) as usage_count, max(created_at) as last_used
      from public.member_activity where user_id=p.user_id
    ) a
    cross join lateral (
      -- Verified purchase events count once, regardless of purchased quantity.
      -- Legacy purchase maps to basic, as in apply_sheet_event. Rewards,
      -- balance consumption and premium-to-basic exchanges are not purchases.
      select count(*) filter(where kind in ('purchase','purchase_basic')) as basic_purchases,
        count(*) filter(where kind='purchase_premium') as premium_purchases
      from public.member_sheet_events where user_id=p.user_id
    ) e
  ), numbered as (
    select *, row_number() over(order by created_at desc, member_number) as rn from summaries
  )
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'memberNumber', member_number, 'createdAt', created_at, 'role', role, 'status', status,
      'kakaoEmail', kakao_email, 'usageCount', usage_count,
      'basicPurchaseCount', basic_purchases, 'premiumPurchaseCount', premium_purchases
    ) order by rn) filter(where rn<=20), '[]'::jsonb),
    'hasMore', count(*)>20
  ) into result from numbered;
  return result;
end;
$$;

revoke all on function public.admin_list_members(text,integer) from public,anon;
grant execute on function public.admin_list_members(text,integer) to authenticated;
commit;
