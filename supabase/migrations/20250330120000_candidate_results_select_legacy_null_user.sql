-- Rows created before user_id / RLS often have user_id IS NULL and were invisible to every user.
-- Allow reading those legacy rows alongside rows you own. New inserts still set user_id = auth.uid().
--
-- For strict multi-tenant isolation later, backfill then tighten the policy, e.g.:
--   update public.candidate_results set user_id = '<auth.users.id>' where user_id is null;
--   then replace "using" with only (user_id = auth.uid()).

drop policy if exists "candidate_results_select_own" on public.candidate_results;

create policy "candidate_results_select_own"
  on public.candidate_results
  for select
  to authenticated
  using (user_id = auth.uid() or user_id is null);
