-- Derived fields that appear on the results / candidate detail UI (skills gaps, requirement checks, rank).

alter table public.candidate_results
  add column if not exists ui_snapshot jsonb not null default '{}';
