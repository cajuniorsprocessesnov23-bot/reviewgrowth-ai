-- Authentication and role isolation foundation.
grant select, insert, update on public.profiles to authenticated;
create or replace function public.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.business_members bm where bm.business_id = target_business_id and bm.user_id = (select auth.uid())); $$;
create or replace function public.has_business_role(target_business_id uuid, allowed_roles public.business_member_role[])
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.business_members bm where bm.business_id = target_business_id and bm.user_id = (select auth.uid()) and bm.role = any(allowed_roles)); $$;
revoke all on function public.is_business_member(uuid) from public, anon;
revoke all on function public.has_business_role(uuid, public.business_member_role[]) from public, anon;
grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.has_business_role(uuid, public.business_member_role[]) to authenticated;
