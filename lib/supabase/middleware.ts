import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env"

const AUTH_PATHS = ["/login", "/signup", "/auth/callback"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!user && !isAuthPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    redirectUrl.searchParams.delete("next")
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
