-- One-shot setup: paste this entire file into Supabase → SQL Editor → Run.
-- Safe to run more than once (uses IF NOT EXISTS).

create table if not exists public.candidate_results (
  id uuid primary key default gen_random_uuid(),
  screening_run_id uuid not null,
  job_title text not null,
  job_description text not null,
  required_skills text[] not null default '{}',
  minimum_experience integer not null,
  education_level text not null,
  candidate_id text not null,
  candidate jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists candidate_results_screening_run_id_idx
  on public.candidate_results (screening_run_id);

create index if not exists candidate_results_created_at_idx
  on public.candidate_results (created_at desc);

alter table public.candidate_results enable row level security;

alter table public.candidate_results
  add column if not exists ui_snapshot jsonb not null default '{}';

alter table public.candidate_results
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.candidate_results
  add column if not exists screened_by_user_id uuid references auth.users (id) on delete set null;

alter table public.candidate_results
  add column if not exists screened_by_email text;

-- For RLS, shared access, list RPC, and policies, run SQL migrations in
-- supabase/migrations/ in chronological order (or use Supabase CLI db push).
