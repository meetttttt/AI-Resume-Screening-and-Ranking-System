"use server"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { ResultsUiSnapshot } from "@/lib/match-derived"
import type { Candidate, JobRequirements } from "@/lib/types"

export type SavedCandidateListRow = {
  id: string
  screeningRunId: string
  createdAt: string
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
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function mapRow(r: RpcRow): SavedCandidateListRow {
  return {
    id: r.id,
    screeningRunId: r.screening_run_id,
    createdAt: r.created_at,
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
      "id, screening_run_id, created_at, job_title, job_description, required_skills, minimum_experience, education_level, candidate, ui_snapshot",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (q.length > 0) {
    const safe = q.slice(0, 120).replace(/[%_\\]/g, "")
    if (safe.length > 0) {
      const p = `%${safe}%`
      query = query.or(
        `candidate->>name.ilike.${p},candidate->>email.ilike.${p},candidate->>currentTitle.ilike.${p},job_title.ilike.${p}`,
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
  const supabase = getServiceSupabase()
  if (!supabase) {
    return { ok: false, reason: "not_configured" }
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
