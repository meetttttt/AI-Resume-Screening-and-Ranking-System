import type { Candidate, JobRequirements } from "@/lib/types"

const EDUCATION_RANK: Record<string, number> = {
  "High School": 1,
  "Associate's": 2,
  "Bachelor's": 3,
  "Master's": 4,
  PhD: 5,
}

export function getMissingSkills(candidate: Candidate, job: JobRequirements): string[] {
  return job.requiredSkills.filter((skill) => !candidate.matchedSkills.includes(skill))
}

export function getExperienceMatch(candidate: Candidate, job: JobRequirements): boolean {
  return candidate.yearsOfExperience >= job.minimumExperience
}

export function getEducationMatch(candidate: Candidate, job: JobRequirements): boolean {
  const requiredRank = EDUCATION_RANK[job.educationLevel] ?? 0
  const candidateRank = EDUCATION_RANK[candidate.educationLevel] ?? 0
  return candidateRank >= requiredRank
}

/** Serializable fields shown on the results / detail UI (no resume file or raw resume text). */
export type ResultsUiSnapshot = {
  rankInRun: number
  isTopMatch: boolean
  missingSkills: string[]
  experienceMatch: boolean
  educationMatch: boolean
}

export function buildResultsUiSnapshot(
  candidate: Candidate,
  job: JobRequirements,
  rankInRun: number,
): ResultsUiSnapshot {
  return {
    rankInRun,
    isTopMatch: candidate.matchScore > 85,
    missingSkills: getMissingSkills(candidate, job),
    experienceMatch: getExperienceMatch(candidate, job),
    educationMatch: getEducationMatch(candidate, job),
  }
}
