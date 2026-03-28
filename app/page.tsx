import { ResumeScreeningDashboard } from "@/components/resume-screening-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 rounded-bl-[100px] opacity-50 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 rounded-tr-[100px] opacity-50 blur-3xl -z-10"></div>

      <main className="container mx-auto py-8 px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block p-2 bg-white bg-opacity-80 rounded-xl shadow-sm mb-4">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              <h1 className="text-5xl font-bold">AI Resume Screening</h1>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Find your perfect candidates with our AI-powered resume screening and ranking system
          </p>
        </div>

        <ResumeScreeningDashboard />
      </main>
    </div>
  )
}

