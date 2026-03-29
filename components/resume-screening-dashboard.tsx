"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobRequirementsForm } from "@/components/job-requirements-form"
import { ResumeUploader } from "@/components/resume-uploader"
import { CandidateResults } from "@/components/candidate-results"
import { ScreenedCandidatesTab } from "@/components/screened-candidates-tab"
import { analyzeResumes } from "@/lib/resume-analyzer"
import { saveCandidatesToSupabase } from "@/lib/save-candidates"
import type { JobRequirements, Candidate } from "@/lib/types"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function ResumeScreeningDashboard() {
  const [jobRequirements, setJobRequirements] = useState<JobRequirements | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("requirements")

  const handleJobRequirementsSubmit = (requirements: JobRequirements) => {
    setJobRequirements(requirements)
    setActiveTab("upload")
  }

  const handleResumesUpload = async (files: File[]) => {
    if (!jobRequirements) return

    setIsAnalyzing(true)

    try {
      const { candidates: results, fileErrors } = await analyzeResumes(files, jobRequirements)
      setCandidates(results)
      if (results.length > 0) {
        try {
          const saved = await saveCandidatesToSupabase(jobRequirements, results)
          if (saved.ok) {
            toast.success("Saved to database", {
              description: `${results.length} candidate row${results.length === 1 ? "" : "s"} in candidate_results.`,
            })
          } else {
            toast.message("Not saved to database", {
              description:
                "Add SUPABASE_SECRET_KEY (Secret API key, sb_secret_…) or legacy SUPABASE_SERVICE_ROLE_KEY (JWT) in .env.local — not the publishable key.",
            })
          }
        } catch (persistErr) {
          const persistMessage = persistErr instanceof Error ? persistErr.message : String(persistErr)
          console.error("Failed to save candidates to Supabase:", persistErr)
          toast.warning("Could not save results to the database", { description: persistMessage })
        }
      }
      if (results.length === 0) {
        toast.message("No candidates returned", {
          description: "Upload produced no scored profiles. Check files and try again.",
        })
        setActiveTab("upload")
        return
      }
      setActiveTab("results")
      toast.success(`Analyzed ${results.length} resume${results.length === 1 ? "" : "s"}`)
      if (fileErrors.length > 0) {
        toast.warning("Some files were skipped", {
          description: fileErrors.slice(0, 3).join(" · ") + (fileErrors.length > 3 ? " …" : ""),
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed"
      console.error("Error analyzing resumes:", error)
      toast.error("Resume analysis failed", { description: message })
      setActiveTab("upload")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 mb-8 p-1 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-md">
          <TabsTrigger
            value="requirements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            Job Requirements
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            disabled={!jobRequirements}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            Resume Upload
          </TabsTrigger>
          <TabsTrigger
            value="results"
            disabled={candidates.length === 0}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            value="screened"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            Screened
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requirements">
          <JobRequirementsForm onSubmit={handleJobRequirementsSubmit} />
        </TabsContent>

        <TabsContent value="upload">
          <ResumeUploader onUpload={handleResumesUpload} isLoading={isAnalyzing} />
        </TabsContent>

        <TabsContent value="results">
          <CandidateResults candidates={candidates} jobRequirements={jobRequirements!} />
        </TabsContent>

        <TabsContent value="screened">
          <ScreenedCandidatesTab isActive={activeTab === "screened"} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

