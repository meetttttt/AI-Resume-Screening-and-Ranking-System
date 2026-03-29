import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

type DashboardHeaderProps = {
  userEmail: string
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center sm:text-left">
        <div className="inline-block p-2 bg-white bg-opacity-80 rounded-xl shadow-sm">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            <h1 className="text-5xl font-bold">AI Resume Screening</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        <span className="max-w-[220px] truncate text-sm text-muted-foreground" title={userEmail}>
          {userEmail}
        </span>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}
