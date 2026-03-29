-- Tie rows to Supabase Auth; RLS restricts access to the owning user.
-- After applying: inserts must include user_id = auth.uid() (set by the app).

alter table public.candidate_results
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

drop policy if exists "candidate_results_select_own" on public.candidate_results;
drop policy if exists "candidate_results_insert_own" on public.candidate_results;

create policy "candidate_results_select_own"
  on public.candidate_results
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "candidate_results_insert_own"
  on public.candidate_results
  for insert
  to authenticated
  with check (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert on public.candidate_results to authenticated;

grant execute on function public.list_saved_candidate_results(text, int, int) to authenticated;
