"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Briefcase, GraduationCap, ListChecks } from "lucide-react"
import type { JobRequirements } from "@/lib/types"
import { motion } from "framer-motion"

interface JobRequirementsFormProps {
  onSubmit: (requirements: JobRequirements) => void
}

export function JobRequirementsForm({ onSubmit }: JobRequirementsFormProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [experienceYears, setExperienceYears] = useState(3)
  const [skillInput, setSkillInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [educationLevel, setEducationLevel] = useState("Bachelor's")

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobTitle || !jobDescription || skills.length === 0) {
      return
    }

    const requirements: JobRequirements = {
      jobTitle,
      jobDescription,
      requiredSkills: skills,
      minimumExperience: experienceYears,
      educationLevel,
    }

    onSubmit(requirements)
  }

  return (
    <Card className="w-full overflow-hidden bg-white/90 backdrop-blur-sm border-none shadow-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Job Requirements</CardTitle>
          <CardDescription>Define the requirements for the position you're hiring for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <Label htmlFor="jobTitle" className="text-base">
                Job Title
              </Label>
            </div>
            <Input
              id="jobTitle"
              placeholder="e.g. Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="border-indigo-100 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Enter the full job description..."
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              className="border-indigo-100 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-purple-500" />
              <Label className="text-base">Required Skills</Label>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. React, Python, Project Management)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                className="border-purple-100 focus-visible:ring-purple-500"
              />
              <Button
                type="button"
                onClick={addSkill}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 px-3 py-1"
                  >
                    {skill}
                    <X className="h-3 w-3 cursor-pointer text-indigo-700" onClick={() => removeSkill(skill)} />
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-pink-500" />
                <Label htmlFor="experience" className="text-base">
                  Minimum Years of Experience: {experienceYears}
                </Label>
              </div>
            </div>
            <Slider
              id="experience"
              min={0}
              max={15}
              step={1}
              value={[experienceYears]}
              onValueChange={(value) => setExperienceYears(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Entry Level</span>
              <span>Mid Level</span>
              <span>Senior Level</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <Label htmlFor="education" className="text-base">
                Minimum Education Level
              </Label>
            </div>
            <select
              id="education"
              className="w-full p-2 border rounded-md border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="High School">High School</option>
              <option value="Associate's">Associate's Degree</option>
              <option value="Bachelor's">Bachelor's Degree</option>
              <option value="Master's">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md"
          >
            Continue to Resume Upload
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

