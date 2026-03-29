-- Server-side search + paginated list for the "Screened candidates" UI.

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
          'ui_snapshot', coalesce(cr.ui_snapshot, '{}'::jsonb)
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
       or cr.job_title ilike v_pat;

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
          'ui_snapshot', coalesce(cr.ui_snapshot, '{}'::jsonb)
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
      order by cr.created_at desc
      limit v_lim offset v_off
    ) cr;
  end if;

  return json_build_object('total', v_total, 'rows', coalesce(v_rows, '[]'::json));
end;
$$;

grant execute on function public.list_saved_candidate_results(text, int, int) to service_role;
