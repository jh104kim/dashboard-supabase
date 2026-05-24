-- Phase 4 review snapshot policy patch.
-- Run this in Supabase SQL Editor if Review Snapshot save returns:
-- new row violates row-level security policy for table "reviews"

grant usage on schema public to anon, authenticated;
grant select, insert, update on reviews to anon, authenticated;

alter table reviews enable row level security;

drop policy if exists "mvp_reviews_select" on reviews;
create policy "mvp_reviews_select"
  on reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_reviews_insert" on reviews;
create policy "mvp_reviews_insert"
  on reviews for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_reviews_update" on reviews;
create policy "mvp_reviews_update"
  on reviews for update
  to anon, authenticated
  using (true)
  with check (true);
