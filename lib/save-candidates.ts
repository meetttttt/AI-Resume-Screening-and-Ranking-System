"use server"

import { createClient } from "@supabase/supabase-js"

import { buildResultsUiSnapshot } from "@/lib/match-derived"
import type { Candidate, JobRequirements } from "@/lib/types"

export type SaveCandidatesResult =
  | { ok: true; screeningRunId: string }
  | { ok: false; reason: "not_configured" }

export async function saveCandidatesToSupabase(
  jobRequirements: JobRequirements,
  candidates: Candidate[],
): Promise<SaveCandidatesResult> {
  if (candidates.length === 0) {
    return { ok: true, screeningRunId: crypto.randomUUID() }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  // Prefer new platform secret key (sb_secret_...); legacy JWT service_role still works.
  // See https://supabase.com/docs/guides/api/api-keys
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !serviceKey) {
    return { ok: false, reason: "not_configured" }
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const screeningRunId = crypto.randomUUID()
  // Full job + scored candidate + derived UI fields only — never resume files or raw resume text.
  const rows = candidates.map((c, index) => ({
    screening_run_id: screeningRunId,
    job_title: jobRequirements.jobTitle,
    job_description: jobRequirements.jobDescription,
    required_skills: jobRequirements.requiredSkills,
    minimum_experience: jobRequirements.minimumExperience,
    education_level: jobRequirements.educationLevel,
    candidate_id: c.id,
    candidate: c as unknown as Record<string, unknown>,
    ui_snapshot: buildResultsUiSnapshot(c, jobRequirements, index + 1),
  }))

  const { error } = await supabase.from("candidate_results").insert(rows)

  if (error) {
    throw new Error(error.message)
  }

  return { ok: true, screeningRunId }
}
