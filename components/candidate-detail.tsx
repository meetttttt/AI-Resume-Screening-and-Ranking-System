"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Mail, Phone, MapPin, Briefcase, GraduationCap, CheckCircle, XCircle, Star } from "lucide-react"
import type { Candidate, JobRequirements } from "@/lib/types"

interface CandidateDetailProps {
  candidate: Candidate
  jobRequirements: JobRequirements
}

export function CandidateDetail({ candidate, jobRequirements }: CandidateDetailProps) {
  const missingSkills = jobRequirements.requiredSkills.filter((skill) => !candidate.matchedSkills.includes(skill))

  const experienceMatch = candidate.yearsOfExperience >= jobRequirements.minimumExperience

  const educationRank = {
    "High School": 1,
    "Associate's": 2,
    "Bachelor's": 3,
    "Master's": 4,
    PhD: 5,
  }

  const requiredEducationRank = educationRank[jobRequirements.educationLevel as keyof typeof educationRank] || 0
  const candidateEducationRank = educationRank[candidate.educationLevel as keyof typeof educationRank] || 0
  const educationMatch = candidateEducationRank >= requiredEducationRank

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-none shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{candidate.name}</CardTitle>
          <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Resume
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{candidate.currentTitle}</div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1 text-indigo-600">
            <Mail className="h-4 w-4" />
            <span>{candidate.email}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-600">
            <Phone className="h-4 w-4" />
            <span>{candidate.phone}</span>
          </div>
          <div className="flex items-center gap-1 text-pink-600">
            <MapPin className="h-4 w-4" />
            <span>{candidate.location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="match">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="match"
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all duration-200"
            >
              Match Analysis
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md transition-all duration-200"
            >
              Experience
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="data-[state=active]:bg-white data-[state=active]:text-pink-700 rounded-md transition-all duration-200"
            >
              Skills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="match" className="pt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Overall Match
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      candidate.matchScore > 85
                        ? "bg-gradient-to-r from-pink-500 to-indigo-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                    style={{ width: `${Math.round(candidate.matchScore)}%` }}
                  ></div>
                </div>
                <span className={`font-bold ${candidate.matchScore > 85 ? "text-pink-600" : "text-indigo-600"}`}>
                  {Math.round(candidate.matchScore)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Requirements Match</h3>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-md border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  <span>Experience ({jobRequirements.minimumExperience}+ years)</span>
                </div>
                <div className="flex items-center gap-1">
                  {experienceMatch ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">{candidate.yearsOfExperience} years</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{candidate.yearsOfExperience} years</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-md border border-purple-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <span>Education ({jobRequirements.educationLevel})</span>
                </div>
                <div className="flex items-center gap-1">
                  {educationMatch ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">{candidate.educationLevel}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{candidate.educationLevel}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-pink-50 rounded-md border border-pink-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-pink-500" />
                  <span>Skills ({jobRequirements.requiredSkills.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`font-medium ${
                      candidate.matchedSkills.length === jobRequirements.requiredSkills.length
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {candidate.matchedSkills.length}/{jobRequirements.requiredSkills.length} matched
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4 text-indigo-500" />
                AI Analysis
              </h3>
              <p className="text-sm">{candidate.aiAnalysis}</p>
            </div>
          </TabsContent>

          <TabsContent value="experience" className="pt-4 space-y-4">
            {candidate.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-purple-300 pl-4 pb-4 relative">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"></div>
                <div className="font-medium text-indigo-700">{exp.title}</div>
                <div className="text-sm text-purple-600 font-medium">{exp.company}</div>
                <div className="text-xs text-gray-500">{exp.period}</div>
                <p className="text-sm mt-2">{exp.description}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="skills" className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border-none"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {candidate.matchedSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No matched skills found</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-red-500 border-red-200">
                      {skill}
                    </Badge>
                  ))}
                  {missingSkills.length === 0 && <p className="text-sm text-green-600">No missing skills</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Star className="h-4 w-4 text-indigo-500" />
                  Additional Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.additionalSkills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 border-none"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

