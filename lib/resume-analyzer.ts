"use server"

import OpenAI from "openai"
import { z } from "zod"

import { extractResumeText } from "@/lib/extract-resume-text"
import type { Candidate, JobRequirements } from "@/lib/types"

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string(),
})

const aiCandidateSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  currentTitle: z.string(),
  yearsOfExperience: z.number(),
  educationLevel: z.string(),
  matchScore: z.number(),
  matchedSkills: z.array(z.string()),
  additionalSkills: z.array(z.string()),
  experience: z.array(experienceSchema),
  aiAnalysis: z.string(),
})

const MAX_RESUME_CHARS = 48_000

function getClient() {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) {
    throw new Error(
      "Missing OPENAI_API_KEY. Add it to .env.local (from https://platform.openai.com/api-keys ).",
    )
  }
  return new OpenAI({ apiKey: key })
}

function stripJsonFence(text: string): string {
  let s = text.trim()
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  }
  return s.trim()
}

async function analyzeResumeText(
  resumeText: string,
  fileLabel: string,
  jobRequirements: JobRequirements,
): Promise<Candidate> {
  const client = getClient()
  const trimmed =
    resumeText.length > MAX_RESUME_CHARS
      ? `${resumeText.slice(0, MAX_RESUME_CHARS)}\n\n[Truncated for analysis]`
      : resumeText

  const userPrompt = `Job title: ${jobRequirements.jobTitle}
Job description:
${jobRequirements.jobDescription}

Required skills (match against these): ${jobRequirements.requiredSkills.join(", ")}
Minimum years of experience required: ${jobRequirements.minimumExperience}
Education guideline: ${jobRequirements.educationLevel}

Resume plain text (source file: ${fileLabel}):
---
${trimmed}
---

Return one JSON object with exactly these keys:
- name (string; use "Unknown" if not found)
- email (string; "" if none)
- phone (string; "" if none)
- location (string; "" if none)
- currentTitle (string; latest role title or "")
- yearsOfExperience (number; total relevant years, integer)
- educationLevel (string; e.g. Bachelor's, Master's, PhD, Associate's, High School)
- matchScore (integer 0-100 for fit to this job)
- matchedSkills (array of strings from the required list the candidate clearly has)
- additionalSkills (array of other notable professional/technical skills)
- experience (array of up to 5 objects: title, company, period, description)
- aiAnalysis (string; 2-4 sentences on fit, gaps, recommendation)

JSON only, no markdown.`

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical recruiter. Be factual and grounded in the resume text. Output valid JSON only.",
      },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.25,
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) {
    throw new Error("Empty response from the model")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(stripJsonFence(raw))
  } catch {
    throw new Error("Model returned invalid JSON")
  }

  const result = aiCandidateSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error("Model output did not match the expected candidate shape")
  }

  const d = result.data
  return {
    id: crypto.randomUUID(),
    name: d.name?.trim() || "Unknown",
    email: d.email?.trim() ?? "",
    phone: d.phone?.trim() ?? "",
    location: d.location?.trim() ?? "",
    currentTitle: d.currentTitle?.trim() ?? "",
    yearsOfExperience: Math.max(0, Math.round(Number(d.yearsOfExperience) || 0)),
    educationLevel: d.educationLevel?.trim() || "Unknown",
    matchScore: Math.min(100, Math.max(0, Math.round(Number(d.matchScore) || 0))),
    matchedSkills: d.matchedSkills ?? [],
    additionalSkills: d.additionalSkills ?? [],
    experience: d.experience ?? [],
    aiAnalysis: d.aiAnalysis?.trim() ?? "",
  }
}

export type AnalyzeResumesResult = {
  candidates: Candidate[]
  /** Per-file issues when some resumes could not be analyzed */
  fileErrors: string[]
}

export async function analyzeResumes(
  files: File[],
  jobRequirements: JobRequirements,
): Promise<AnalyzeResumesResult> {
  if (files.length === 0) {
    return { candidates: [], fileErrors: [] }
  }

  getClient()

  const candidates: Candidate[] = []
  const fileErrors: string[] = []

  for (const file of files) {
    try {
      const text = await extractResumeText(file)
      if (!text) {
        fileErrors.push(`${file.name}: no extractable text`)
        continue
      }
      const candidate = await analyzeResumeText(text, file.name, jobRequirements)
      candidates.push(candidate)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      fileErrors.push(`${file.name}: ${msg}`)
    }
  }

  if (candidates.length === 0 && fileErrors.length > 0) {
    throw new Error(fileErrors.join("\n"))
  }

  candidates.sort((a, b) => b.matchScore - a.matchScore)
  return { candidates, fileErrors }
}
