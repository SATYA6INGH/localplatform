-- LocalPlatform baseline RLS. Run this in the Supabase SQL editor after reviewing
-- the existing schema. The browser only receives the publishable key; these rules
-- are the actual protection against cross-account reads and writes.

alter table if exists public.businesses enable row level security;
alter table if exists public.home_ads enable row level security;
alter table if exists public.listing_payments enable row level security;
alter table if exists public.admin_users enable row level security;

drop policy if exists "public can view active businesses" on public.businesses;
create policy "public can view active businesses"
  on public.businesses for select
  using (listing_status = 'active');

drop policy if exists "owners manage their businesses" on public.businesses;
create policy "owners manage their businesses"
  on public.businesses for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "owners create ad requests" on public.home_ads;
create policy "owners create ad requests"
  on public.home_ads for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "owners view their ad requests" on public.home_ads;
create policy "owners view their ad requests"
  on public.home_ads for select
  to authenticated
  using (owner_id = auth.uid() or (status = 'approved' and starts_at <= now() and expires_at > now()));

drop policy if exists "owners create payment submissions" on public.listing_payments;
create policy "owners create payment submissions"
  on public.listing_payments for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "owners view their payments" on public.listing_payments;
create policy "owners view their payments"
  on public.listing_payments for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users view their admin record" on public.admin_users;
create policy "users view their admin record"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());
