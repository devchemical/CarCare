import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to auth routes and public paths
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  const isPublicRoute = request.nextUrl.pathname === "/"
  const isNextRoute = request.nextUrl.pathname.startsWith("/_next")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")

  // Check if this is a logout redirect (has logout query param)
  const isLogoutRedirect = request.nextUrl.searchParams.has("logout")

  // If user is logged in and trying to access auth routes, redirect to dashboard
  // EXCEPT if it's a logout redirect or callback
  if (user && isAuthRoute && !isLogoutRedirect && request.nextUrl.pathname !== "/auth/callback") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // If no user and trying to access protected routes, redirect to login
  if (!user && !isAuthRoute && !isPublicRoute && !isNextRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
