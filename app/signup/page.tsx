import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-12">
      <p className="mb-8 text-sm font-medium text-muted-foreground">AI Resume Screening</p>
      <Card className="w-full max-w-md border-indigo-100/80 bg-white/90 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">No self‑service signup</CardTitle>
          <CardDescription>
            An administrator creates accounts in Supabase. If you need access, ask your admin to add your
            email and set a temporary password (or send you a password reset link from the dashboard).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
