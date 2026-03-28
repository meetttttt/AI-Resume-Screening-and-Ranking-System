"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Search, Award, Sparkles } from "lucide-react"
import type { Candidate, JobRequirements } from "@/lib/types"
import { CandidateDetail } from "@/components/candidate-detail"
import { motion, AnimatePresence } from "framer-motion"

interface CandidateResultsProps {
  candidates: Candidate[]
  jobRequirements: JobRequirements
}

export function CandidateResults({ candidates, jobRequirements }: CandidateResultsProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const sortedCandidates = [...candidates]
    .filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.matchedSkills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="bg-white/90 backdrop-blur-sm border-none shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500"></div>
          <CardHeader>
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                Candidate Rankings
              </CardTitle>
              <CardDescription>
                {sortedCandidates.length} candidates analyzed for {jobRequirements.jobTitle}
              </CardDescription>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                placeholder="Search candidates or skills..."
                className="pl-10 h-12 w-full rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No candidates match your search criteria</div>
              ) : (
                <AnimatePresence>
                  {sortedCandidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedCandidate?.id === candidate.id
                            ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md"
                            : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                        }`}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full p-2 ${
                                candidate.matchScore > 85
                                  ? "bg-gradient-to-br from-pink-100 to-indigo-100"
                                  : "bg-gradient-to-br from-indigo-100 to-purple-100"
                              }`}
                            >
                              <User
                                className={`h-6 w-6 ${candidate.matchScore > 85 ? "text-pink-500" : "text-indigo-500"}`}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {candidate.currentTitle} • {candidate.yearsOfExperience} years •{" "}
                                {candidate.educationLevel}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${
                                candidate.matchScore > 85
                                  ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500"
                                  : candidate.matchScore > 70
                                    ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500"
                                    : "text-gray-700"
                              }`}
                            >
                              {Math.round(candidate.matchScore)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Match Score</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Skills Match</span>
                            <span>
                              {candidate.matchedSkills.length}/{jobRequirements.requiredSkills.length} skills
                            </span>
                          </div>
                          <Progress
                            value={(candidate.matchedSkills.length / jobRequirements.requiredSkills.length) * 100}
                            className="h-2 bg-gray-100"
                            indicatorClassName={`${
                              candidate.matchScore > 85
                                ? "bg-gradient-to-r from-pink-500 to-indigo-500"
                                : "bg-gradient-to-r from-indigo-500 to-purple-500"
                            }`}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {candidate.matchedSkills.map((skill) => (
                            <Badge
                              key={skill}
                              className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 border-none"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.additionalSkills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-purple-600 border-purple-200">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.additionalSkills.length > 3 && (
                            <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                              +{candidate.additionalSkills.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {candidate.matchScore > 85 && (
                          <div className="mt-3 flex items-center gap-1 text-pink-600 text-sm">
                            <Award className="h-4 w-4" />
                            <span>Top Match</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <AnimatePresence mode="wait">
          {selectedCandidate ? (
            <motion.div
              key="candidate-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CandidateDetail candidate={selectedCandidate} jobRequirements={jobRequirements} />
            </motion.div>
          ) : (
            <motion.div key="no-candidate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="h-full flex items-center justify-center p-6 bg-white/90 backdrop-blur-sm border-none shadow-xl">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-indigo-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Candidate Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click on a candidate from the list to view detailed information
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

