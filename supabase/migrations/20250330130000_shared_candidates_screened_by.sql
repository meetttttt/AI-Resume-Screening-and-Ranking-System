-- All authenticated users can read every row; inserts must attribute the run to the signed-in user.

alter table public.candidate_results
  add column if not exists screened_by_user_id uuid references auth.users (id) on delete set null;

alter table public.candidate_results
  add column if not exists screened_by_email text;

update public.candidate_results
set screened_by_user_id = coalesce(screened_by_user_id, user_id)
where screened_by_user_id is null and user_id is not null;

drop policy if exists "candidate_results_select_own" on public.candidate_results;

create policy "candidate_results_select_own"
  on public.candidate_results
  for select
  to authenticated
  using (true);

drop policy if exists "candidate_results_insert_own" on public.candidate_results;

create policy "candidate_results_insert_own"
  on public.candidate_results
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and screened_by_user_id = auth.uid()
  );

create or replace function public.list_saved_candidate_results(
  p_search text default null,
  p_limit int default 25,
  p_offset int default 0
)
returns json
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_total bigint;
  v_rows json;
  v_pat text;
  v_lim int;
  v_off int;
  v_search text;
begin
  v_lim := greatest(1, least(coalesce(p_limit, 25), 50));
  v_off := greatest(0, coalesce(p_offset, 0));
  v_search := nullif(trim(coalesce(p_search, '')), '');

  if v_search is not null and length(v_search) > 120 then
    v_search := left(v_search, 120);
  end if;

  if v_search is null then
    v_pat := null;
  else
    v_pat := '%' || replace(replace(replace(v_search, E'\\', ''), '%', ''), '_', '') || '%';
  end if;

  if v_pat is null then
    select count(*)::bigint into v_total from public.candidate_results;

    select coalesce(
      json_agg(
        json_build_object(
          'id', cr.id,
          'screening_run_id', cr.screening_run_id,
          'created_at', cr.created_at,
          'job_title', cr.job_title,
          'job_description', cr.job_description,
          'required_skills', cr.required_skills,
          'minimum_experience', cr.minimum_experience,
          'education_level', cr.education_level,
          'candidate', cr.candidate,
          'ui_snapshot', coalesce(cr.ui_snapshot, '{}'::jsonb),
          'screened_by_user_id', cr.screened_by_user_id,
          'screened_by_email', cr.screened_by_email
        )
        order by cr.created_at desc
      ),
      '[]'::json
    ) into v_rows
    from (
      select *
      from public.candidate_results cr
      order by cr.created_at desc
      limit v_lim offset v_off
    ) cr;
  else
    select count(*)::bigint into v_total
    from public.candidate_results cr
    where (cr.candidate->>'name') ilike v_pat
       or (cr.candidate->>'email') ilike v_pat
       or (cr.candidate->>'currentTitle') ilike v_pat
       or cr.job_title ilike v_pat
       or coalesce(cr.screened_by_email, '') ilike v_pat;

    select coalesce(
      json_agg(
        json_build_object(
          'id', cr.id,
          'screening_run_id', cr.screening_run_id,
          'created_at', cr.created_at,
          'job_title', cr.job_title,
          'job_description', cr.job_description,
          'required_skills', cr.required_skills,
          'minimum_experience', cr.minimum_experience,
          'education_level', cr.education_level,
          'candidate', cr.candidate,
          'ui_snapshot', coalesce(cr.ui_snapshot, '{}'::jsonb),
          'screened_by_user_id', cr.screened_by_user_id,
          'screened_by_email', cr.screened_by_email
        )
        order by cr.created_at desc
      ),
      '[]'::json
    ) into v_rows
    from (
      select *
      from public.candidate_results cr
      where (cr.candidate->>'name') ilike v_pat
         or (cr.candidate->>'email') ilike v_pat
         or (cr.candidate->>'currentTitle') ilike v_pat
         or cr.job_title ilike v_pat
         or coalesce(cr.screened_by_email, '') ilike v_pat
      order by cr.created_at desc
      limit v_lim offset v_off
    ) cr;
  end if;

  return json_build_object('total', v_total, 'rows', coalesce(v_rows, '[]'::json));
end;
$$;

grant execute on function public.list_saved_candidate_results(text, int, int) to service_role;
grant execute on function public.list_saved_candidate_results(text, int, int) to authenticated;
