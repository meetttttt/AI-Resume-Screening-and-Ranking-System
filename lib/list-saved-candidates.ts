"use server"

import { createClient } from "@/lib/supabase/server"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env"
import type { ResultsUiSnapshot } from "@/lib/match-derived"
import type { Candidate, JobRequirements } from "@/lib/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type SavedCandidateListRow = {
  id: string
  screeningRunId: string
  createdAt: string
  /** Auth user who saved this screening run (same as user_id on insert). */
  screenedByUserId: string | null
  /** Email at save time for display (no join to auth.users). */
  screenedByEmail: string | null
  jobRequirements: JobRequirements
  candidate: Candidate
  uiSnapshot: ResultsUiSnapshot
}

export type ListSavedCandidatesResult =
  | {
      ok: true
      rows: SavedCandidateListRow[]
      total: number
      page: number
      pageSize: number
      /** False when the DB RPC is missing and the REST fallback was used (search still runs server-side when possible). */
      rpcAvailable: boolean
    }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "not_signed_in" }
  | { ok: false; reason: "error"; message: string }

type RpcPayload = { total: number; rows: RpcRow[] }

type RpcRow = {
  id: string
  screening_run_id: string
  created_at: string
  job_title: string
  job_description: string
  required_skills: string[]
  minimum_experience: number
  education_level: string
  candidate: Candidate
  ui_snapshot: ResultsUiSnapshot | Record<string, never>
  screened_by_user_id?: string | null
  screened_by_email?: string | null
}

function mapRow(r: RpcRow): SavedCandidateListRow {
  return {
    id: r.id,
    screeningRunId: r.screening_run_id,
    createdAt: r.created_at,
    screenedByUserId: r.screened_by_user_id ?? null,
    screenedByEmail: r.screened_by_email ?? null,
    jobRequirements: {
      jobTitle: r.job_title,
      jobDescription: r.job_description,
      requiredSkills: r.required_skills ?? [],
      minimumExperience: r.minimum_experience,
      educationLevel: r.education_level,
    },
    candidate: r.candidate,
    uiSnapshot: (r.ui_snapshot && Object.keys(r.ui_snapshot).length > 0
      ? r.ui_snapshot
      : {
          rankInRun: 0,
          isTopMatch: false,
          missingSkills: [],
          experienceMatch: false,
          educationMatch: false,
        }) as ResultsUiSnapshot,
  }
}

function isMissingRpcError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes("list_saved_candidate_results") ||
    m.includes("could not find the function") ||
    m.includes("function public.list_saved_candidate_results") ||
    m.includes("schema cache")
  )
}

async function listViaTableFallback(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string,
): Promise<ListSavedCandidatesResult> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const q = search.trim()
  let query = supabase
    .from("candidate_results")
    .select(
      "id, screening_run_id, created_at, screened_by_user_id, screened_by_email, job_title, job_description, required_skills, minimum_experience, education_level, candidate, ui_snapshot",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (q.length > 0) {
    const safe = q.slice(0, 120).replace(/[%_\\]/g, "")
    if (safe.length > 0) {
      const p = `%${safe}%`
      query = query.or(
        `candidate->>name.ilike.${p},candidate->>email.ilike.${p},candidate->>currentTitle.ilike.${p},job_title.ilike.${p},screened_by_email.ilike.${p}`,
      )
    }
  }

  const { data, error, count } = await query

  if (error) {
    return { ok: false, reason: "error", message: error.message }
  }

  const rows = (data ?? []).map((raw) =>
    mapRow(raw as unknown as RpcRow),
  )

  return {
    ok: true,
    rows,
    total: count ?? rows.length,
    page,
    pageSize,
    rpcAvailable: false,
  }
}

export async function listSavedCandidates(
  page: number = 1,
  pageSize: number = 25,
  search: string = "",
): Promise<ListSavedCandidatesResult> {
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

  const safePage = Math.max(1, Math.floor(page))
  const safeSize = Math.min(50, Math.max(1, Math.floor(pageSize)))
  const offset = (safePage - 1) * safeSize

  const { data, error } = await supabase.rpc("list_saved_candidate_results", {
    p_search: search.trim() || null,
    p_limit: safeSize,
    p_offset: offset,
  })

  if (error) {
    if (isMissingRpcError(error.message)) {
      return listViaTableFallback(supabase, safePage, safeSize, search)
    }
    return { ok: false, reason: "error", message: error.message }
  }

  const payload = data as RpcPayload | null
  if (!payload || typeof payload.total !== "number" || !Array.isArray(payload.rows)) {
    return listViaTableFallback(supabase, safePage, safeSize, search)
  }

  return {
    ok: true,
    rows: payload.rows.map(mapRow),
    total: payload.total,
    page: safePage,
    pageSize: safeSize,
    rpcAvailable: true,
  }
}
