import { redirect } from "next/navigation"

import { ResumeScreeningDashboard } from "@/components/resume-screening-dashboard"
import { DashboardHeader } from "@/components/dashboard-header"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env"

export default async function Home() {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <p className="text-center text-muted-foreground">
          Set <code className="text-sm">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (or publishable key) in{" "}
          <code className="text-sm">.env.local</code>.
        </p>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const userEmail = user.email ?? user.id

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 rounded-bl-[100px] opacity-50 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 rounded-tr-[100px] opacity-50 blur-3xl -z-10"></div>

      <main className="container mx-auto py-8 px-4 relative z-10">
        <DashboardHeader userEmail={userEmail} />

        <ResumeScreeningDashboard />
      </main>
    </div>
  )
}
