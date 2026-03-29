import { signIn } from "@/app/auth/actions"
import { SubmitButton } from "@/components/auth/submit-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = {
  error: string | null
  nextPath: string
}

export function LoginForm({ error, nextPath }: LoginFormProps) {
  return (
    <Card className="w-full max-w-md border-indigo-100/80 bg-white/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Your administrator creates accounts. Sign in with the email and password they gave you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signIn} className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </div>
          <SubmitButton label="Sign in" pendingLabel="Signing in…" />
        </form>
      </CardContent>
    </Card>
  )
}
