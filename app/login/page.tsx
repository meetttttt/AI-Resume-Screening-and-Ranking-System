import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error: errorParam, next } = await searchParams
  const error = errorParam ? decodeURIComponent(errorParam) : null
  const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : "/"

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-12">
      <p className="mb-8 text-sm font-medium text-muted-foreground">AI Resume Screening</p>
      <LoginForm error={error} nextPath={nextPath} />
    </div>
  )
}
