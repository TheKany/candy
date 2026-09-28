begin;
-- Manual saving is available to both account roles; ownership remains mandatory.
drop policy own_member_consultations on public.saved_consultations;
create policy own_member_consultations on public.saved_consultations for all to authenticated
using (user_id = (select auth.uid()) and exists (select 1 from public.member_accounts where user_id = (select auth.uid()) and role in ('member', 'super')))
with check (user_id = (select auth.uid()) and exists (select 1 from public.member_accounts where user_id = (select auth.uid()) and role in ('member', 'super')));

create or replace function public.save_consultation(p_consultation_id uuid, p_revision integer, p_readings jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := auth.uid(); saved_id uuid; owner_role text; reading jsonb; section jsonb; word jsonb;
begin
  -- Serialize writes for the authenticated account.
  select role into owner_role from public.member_accounts where user_id = owner_id for update;
  if owner_id is null or (owner_role is null or owner_role not in ('member', 'super')) then
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


-- Promotion no longer requires erasing the owner's explicitly saved records.
drop trigger if exists guard_tarot_super_history on public.member_accounts;
drop function if exists public.guard_super_history();
commit;
