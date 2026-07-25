import { describe, expect, it, vi } from "vitest"
import {
  AUTH_ERROR_CODE,
  SIGN_UP_RATE_LIMIT_SCOPE,
  SIGN_UP_STATUS,
  type CurrentUser,
  type UserId,
} from "@/lib/auth/contracts"
import { createSignupCommand, type SignupAuthAdapter, type SignupRateLimitAdapter } from "@/lib/auth/signup"

const unusedUnavailableReporter = () => "unused-auth-incident"

describe("signup", () => {
  it("returns the public user when signup creates an immediate session", async () => {
    const user: CurrentUser = {
      id: "user-1" as UserId,
      email: "driver@example.com",
      displayName: "Ada Driver",
    }
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        return { status: SIGN_UP_STATUS.AUTHENTICATED, user }
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed() {
        return { allowed: true }
      },
    }
    const signup = createSignupCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await signup({
      email: "driver@example.com",
      password: "secret-password",
      confirmPassword: "secret-password",
      fullName: "Ada Driver",
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({ status: SIGN_UP_STATUS.AUTHENTICATED, user })
  })

  it("rejects mismatched passwords before crossing server boundaries", async () => {
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        throw new Error("authentication should not run")
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed() {
        throw new Error("rate limiting should not run")
      },
    }
    const signup = createSignupCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await signup({
      email: "driver@example.com",
      password: "secret-password",
      confirmPassword: "different-password",
      fullName: "Ada Driver",
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({
      status: SIGN_UP_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.VALIDATION_FAILED },
    })
  })

  it.each([
    { email: "not-an-email", password: "secret-password", fullName: "Ada Driver" },
    { email: "driver@example.com", password: "short", fullName: "Ada Driver" },
    { email: "driver@example.com", password: "secret-password", fullName: "   " },
  ])("rejects malformed signup fields before crossing server boundaries", async ({ email, password, fullName }) => {
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        throw new Error("authentication should not run")
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed() {
        throw new Error("rate limiting should not run")
      },
    }
    const signup = createSignupCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await signup({
      email,
      password,
      confirmPassword: password,
      fullName,
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({
      status: SIGN_UP_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.VALIDATION_FAILED },
    })
  })

  it("rate limits the canonical email before creating an account", async () => {
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        throw new Error("authentication should not run")
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed({ email }) {
        return email === "driver@example.com"
          ? {
              allowed: false,
              scope: SIGN_UP_RATE_LIMIT_SCOPE.EMAIL,
              remaining: 0,
              limit: 3,
              reset: 4_102_444_800_000,
            }
          : { allowed: true }
      },
    }
    const signup = createSignupCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await signup({
      email: "  Driver@Example.com  ",
      password: "secret-password",
      confirmPassword: "secret-password",
      fullName: "Ada Driver",
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({
      status: SIGN_UP_STATUS.ERROR,
      error: {
        code: AUTH_ERROR_CODE.RATE_LIMITED,
        scope: SIGN_UP_RATE_LIMIT_SCOPE.EMAIL,
        remaining: 0,
        limit: 3,
        reset: 4_102_444_800_000,
      },
    })
  })

  it("reports provider failures as temporarily unavailable with an incident reference", async () => {
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        throw new Error("provider connection failed")
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed() {
        return { allowed: true }
      },
    }
    const reportUnavailable = vi.fn(() => "auth-incident-signup")
    const signup = createSignupCommand({ authAdapter, rateLimitAdapter, reportUnavailable })

    const result = await signup({
      email: "driver@example.com",
      password: "secret-password",
      confirmPassword: "secret-password",
      fullName: "Ada Driver",
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({
      status: SIGN_UP_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE, reference: "auth-incident-signup" },
    })
    expect(reportUnavailable).toHaveBeenCalledExactlyOnceWith("auth_provider")
  })

  it("reports a rejected provider result as the same unavailable outcome", async () => {
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        return { status: SIGN_UP_STATUS.ERROR, error: { code: AUTH_ERROR_CODE.PROVIDER_ERROR } }
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed() {
        return { allowed: true }
      },
    }
    const reportUnavailable = vi.fn(() => "auth-incident-provider-result")
    const signup = createSignupCommand({ authAdapter, rateLimitAdapter, reportUnavailable })

    const result = await signup({
      email: "driver@example.com",
      password: "secret-password",
      confirmPassword: "secret-password",
      fullName: "Ada Driver",
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({
      status: SIGN_UP_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE, reference: "auth-incident-provider-result" },
    })
    expect(reportUnavailable).toHaveBeenCalledExactlyOnceWith("auth_provider")
  })

  it("reports rate-limit dependency failures without attempting signup", async () => {
    const authAdapter: SignupAuthAdapter = {
      async signUp() {
        throw new Error("signup should not run")
      },
    }
    const rateLimitAdapter: SignupRateLimitAdapter = {
      async isAllowed() {
        throw new Error("redis unavailable")
      },
    }
    const reportUnavailable = vi.fn(() => "auth-incident-rate-limit")
    const signup = createSignupCommand({ authAdapter, rateLimitAdapter, reportUnavailable })

    const result = await signup({
      email: "driver@example.com",
      password: "secret-password",
      confirmPassword: "secret-password",
      fullName: "Ada Driver",
      clientIp: "203.0.113.10",
      emailRedirectTo: "https://keepel.example/auth/callback",
    })

    expect(result).toEqual({
      status: SIGN_UP_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE, reference: "auth-incident-rate-limit" },
    })
    expect(reportUnavailable).toHaveBeenCalledExactlyOnceWith("rate_limit")
  })
})
