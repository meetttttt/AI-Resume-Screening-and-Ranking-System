"use server"

import { buildResultsUiSnapshot } from "@/lib/match-derived"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env"
import type { Candidate, JobRequirements } from "@/lib/types"

export type SaveCandidatesResult =
  | { ok: true; screeningRunId: string }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "not_signed_in" }

export async function saveCandidatesToSupabase(
  jobRequirements: JobRequirements,
  candidates: Candidate[],
): Promise<SaveCandidatesResult> {
  if (candidates.length === 0) {
    return { ok: true, screeningRunId: crypto.randomUUID() }
  }

  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    return { ok: false, reason: "not_configured" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, reason: "not_signed_in" }
  }

  const screeningRunId = crypto.randomUUID()
  const screenedByEmail = user.email?.trim() || null
  const rows = candidates.map((c, index) => ({
    user_id: user.id,
    screened_by_user_id: user.id,
    screened_by_email: screenedByEmail,
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
