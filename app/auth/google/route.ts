/* eslint-disable no-console -- OAuth failures need server-side diagnostics until centralized observability is added. */

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { OAUTH_ERROR_CODE } from "@/lib/auth/contracts"
import { createOAuthErrorRedirect, sanitizeInternalRedirect } from "@/lib/auth/redirects"
import { createSupabaseGoogleOAuthAdapter, type GoogleOAuthAdapter } from "@/lib/auth/supabase-google-oauth-adapter"
import { resolveAppOrigin } from "@/lib/http/app-origin"
import { createClient } from "@/lib/supabase/server"

type GoogleOAuthAdapterFactory = () => GoogleOAuthAdapter | Promise<GoogleOAuthAdapter>
type AppOriginResolver = (requestUrl: string) => string

export function createGoogleOAuthHandler(
  createAdapter: GoogleOAuthAdapterFactory,
  getAppOrigin: AppOriginResolver = resolveAppOrigin
) {
  return async function handleGoogleOAuth(request: NextRequest) {
    let appOrigin: string

    try {
      appOrigin = getAppOrigin(request.url)
    } catch (error) {
      console.error("Invalid application origin configuration:", error)
      return new NextResponse(null, { status: 500 })
    }

    try {
      const callbackUrl = new URL("/auth/callback", appOrigin)
      callbackUrl.searchParams.set("next", sanitizeInternalRedirect(request.nextUrl.searchParams.get("redirectTo")))

      const adapter = await createAdapter()
      const oauthStartResult = await adapter.createAuthorizationUrl(callbackUrl.toString())

      return oauthStartResult.started
        ? NextResponse.redirect(oauthStartResult.authorizationUrl)
        : NextResponse.redirect(createOAuthErrorRedirect(appOrigin, oauthStartResult.errorCode))
    } catch (error) {
      console.error("Unexpected Google OAuth initiation failure:", error)
      return NextResponse.redirect(createOAuthErrorRedirect(appOrigin, OAUTH_ERROR_CODE.UNEXPECTED))
    }
  }
}

export const GET = createGoogleOAuthHandler(() =>
  createSupabaseGoogleOAuthAdapter(createClient, process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
)
