import type { CookieOptions } from "@supabase/ssr"

export const SUPABASE_SESSION_MAX_AGE_SECONDS = 400 * 24 * 60 * 60
export const SUPABASE_PKCE_MAX_AGE_SECONDS = 10 * 60

export function getSupabaseClientCookieOptions(): CookieOptions {
  return {
    httpOnly: false,
    maxAge: SUPABASE_SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }
}

export function normalizeSupabaseCookieOptions(name: string, options: CookieOptions = {}): CookieOptions {
  const normalized: CookieOptions = {
    ...getSupabaseClientCookieOptions(),
    ...options,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }

  if (name.endsWith("-auth-token-code-verifier")) {
    normalized.httpOnly = true

    if (options.maxAge !== 0) {
      normalized.maxAge = SUPABASE_PKCE_MAX_AGE_SECONDS
    }
  }

  return normalized
}
