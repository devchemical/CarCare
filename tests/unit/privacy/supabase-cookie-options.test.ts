import { describe, expect, it } from "vitest"
import {
  SUPABASE_PKCE_MAX_AGE_SECONDS,
  SUPABASE_SESSION_MAX_AGE_SECONDS,
  getSupabaseClientCookieOptions,
  normalizeSupabaseCookieOptions,
} from "@/lib/supabase/cookie-options"

describe("Supabase cookie options", () => {
  it("keeps session cookies client-readable for browser RLS access", () => {
    const options = getSupabaseClientCookieOptions()

    expect(options).toMatchObject({
      httpOnly: false,
      maxAge: SUPABASE_SESSION_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
    })
  })

  it("makes the OAuth PKCE verifier HttpOnly and short-lived", () => {
    const options = normalizeSupabaseCookieOptions("sb-project-auth-token-code-verifier", {})

    expect(options.httpOnly).toBe(true)
    expect(options.maxAge).toBe(SUPABASE_PKCE_MAX_AGE_SECONDS)
  })

  it("preserves immediate deletion of the PKCE verifier", () => {
    const options = normalizeSupabaseCookieOptions("sb-project-auth-token-code-verifier", { maxAge: 0 })

    expect(options.maxAge).toBe(0)
  })
})
