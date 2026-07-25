import { describe, expect, it, vi } from "vitest"
import {
  createPasswordLoginCommand,
  type PasswordLoginAuthAdapter,
  type PasswordLoginRateLimitAdapter,
} from "@/lib/auth/password-login"
import { AUTH_COMMAND_STATUS, AUTH_ERROR_CODE } from "@/lib/auth/contracts"

const unusedUnavailableReporter = () => "unused-auth-incident"

describe("password login", () => {
  it("returns the stable invalid-credentials code without exposing the provider error", async () => {
    const authAdapter: PasswordLoginAuthAdapter = {
      async signInWithPassword() {
        return { authenticated: false, errorCode: AUTH_ERROR_CODE.INVALID_CREDENTIALS }
      },
    }
    const rateLimitAdapter: PasswordLoginRateLimitAdapter = {
      async isAllowed() {
        return true
      },
    }
    const login = createPasswordLoginCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await login({
      email: "driver@example.com",
      password: "wrong-password",
      clientIp: "203.0.113.10",
      redirectTo: "/vehicles",
    })

    expect(result).toEqual({
      status: AUTH_COMMAND_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.INVALID_CREDENTIALS },
    })
    expect(Object.keys(result.status === AUTH_COMMAND_STATUS.ERROR ? result.error : {})).toEqual(["code"])
  })

  it("rate limits the canonical email and returns a stable code before authentication", async () => {
    const authAdapter: PasswordLoginAuthAdapter = {
      async signInWithPassword() {
        return { authenticated: true }
      },
    }
    const rateLimitAdapter: PasswordLoginRateLimitAdapter = {
      async isAllowed({ email }) {
        return email !== "driver@example.com"
      },
    }
    const login = createPasswordLoginCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await login({
      email: "  Driver@Example.com  ",
      password: "secret-password",
      clientIp: "203.0.113.10",
      redirectTo: "/vehicles",
    })

    expect(result).toEqual({
      status: AUTH_COMMAND_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.RATE_LIMITED },
    })
  })

  it("reports provider failures as temporarily unavailable with an incident reference", async () => {
    const authAdapter: PasswordLoginAuthAdapter = {
      async signInWithPassword() {
        throw new Error("provider connection failed")
      },
    }
    const rateLimitAdapter: PasswordLoginRateLimitAdapter = {
      async isAllowed() {
        return true
      },
    }
    const reportUnavailable = vi.fn(() => "auth-incident-login")
    const login = createPasswordLoginCommand({ authAdapter, rateLimitAdapter, reportUnavailable })

    const result = await login({
      email: "driver@example.com",
      password: "secret-password",
      clientIp: "203.0.113.10",
      redirectTo: "/vehicles",
    })

    expect(result).toEqual({
      status: AUTH_COMMAND_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE, reference: "auth-incident-login" },
    })
    expect(reportUnavailable).toHaveBeenCalledExactlyOnceWith("auth_provider")
  })

  it("reports a rejected provider result as the same unavailable outcome", async () => {
    const authAdapter: PasswordLoginAuthAdapter = {
      async signInWithPassword() {
        return { authenticated: false, errorCode: AUTH_ERROR_CODE.PROVIDER_ERROR }
      },
    }
    const rateLimitAdapter: PasswordLoginRateLimitAdapter = {
      async isAllowed() {
        return true
      },
    }
    const reportUnavailable = vi.fn(() => "auth-incident-provider-result")
    const login = createPasswordLoginCommand({ authAdapter, rateLimitAdapter, reportUnavailable })

    const result = await login({
      email: "driver@example.com",
      password: "secret-password",
      clientIp: "203.0.113.10",
      redirectTo: "/vehicles",
    })

    expect(result).toEqual({
      status: AUTH_COMMAND_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE, reference: "auth-incident-provider-result" },
    })
    expect(reportUnavailable).toHaveBeenCalledExactlyOnceWith("auth_provider")
  })

  it("reports rate-limit dependency failures without attempting authentication", async () => {
    const authAdapter: PasswordLoginAuthAdapter = {
      async signInWithPassword() {
        throw new Error("authentication should not run")
      },
    }
    const rateLimitAdapter: PasswordLoginRateLimitAdapter = {
      async isAllowed() {
        throw new Error("redis unavailable")
      },
    }
    const reportUnavailable = vi.fn(() => "auth-incident-rate-limit")
    const login = createPasswordLoginCommand({ authAdapter, rateLimitAdapter, reportUnavailable })

    const result = await login({
      email: "driver@example.com",
      password: "secret-password",
      clientIp: "203.0.113.10",
      redirectTo: "/vehicles",
    })

    expect(result).toEqual({
      status: AUTH_COMMAND_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE, reference: "auth-incident-rate-limit" },
    })
    expect(reportUnavailable).toHaveBeenCalledExactlyOnceWith("rate_limit")
  })

  it("rejects malformed credentials before crossing server boundaries", async () => {
    const authAdapter: PasswordLoginAuthAdapter = {
      async signInWithPassword() {
        throw new Error("authentication should not run")
      },
    }
    const rateLimitAdapter: PasswordLoginRateLimitAdapter = {
      async isAllowed() {
        throw new Error("rate limiting should not run")
      },
    }
    const login = createPasswordLoginCommand({
      authAdapter,
      rateLimitAdapter,
      reportUnavailable: unusedUnavailableReporter,
    })

    const result = await login({
      email: "not-an-email",
      password: "",
      clientIp: "203.0.113.10",
      redirectTo: "/vehicles",
    })

    expect(result).toEqual({
      status: AUTH_COMMAND_STATUS.ERROR,
      error: { code: AUTH_ERROR_CODE.VALIDATION_FAILED },
    })
  })
})
