export interface JobRequirements {
  jobTitle: string
  jobDescription: string
  requiredSkills: string[]
  minimumExperience: number
  educationLevel: string
}

export interface Experience {
  title: string
  company: string
  period: string
  description: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  currentTitle: string
  yearsOfExperience: number
  educationLevel: string
  matchScore: number
  matchedSkills: string[]
  additionalSkills: string[]
  experience: Experience[]
  aiAnalysis: string
}

