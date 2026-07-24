import { describe, expect, it } from "vitest"
import { readClientIp } from "@/lib/security/client-ip"
import { createRateLimitIdentifier } from "@/lib/security/rate-limit-identifier"

const secret = "rate-limit-secret-that-is-at-least-32-characters"

describe("rate-limit identifiers", () => {
  it("creates deterministic domain-separated HMAC values without the raw identifier", () => {
    const first = createRateLimitIdentifier("login-email", "driver@example.com", secret)
    const repeated = createRateLimitIdentifier("login-email", "driver@example.com", secret)
    const otherDomain = createRateLimitIdentifier("signup-email", "driver@example.com", secret)

    expect(first).toBe(repeated)
    expect(first).not.toBe(otherDomain)
    expect(first).not.toContain("driver@example.com")
  })

  it("changes when the secret rotates and rejects missing secrets", () => {
    expect(createRateLimitIdentifier("login-ip", "203.0.113.10", secret)).not.toBe(
      createRateLimitIdentifier("login-ip", "203.0.113.10", `${secret}-rotated`)
    )
    expect(() => createRateLimitIdentifier("login-ip", "203.0.113.10", "short")).toThrow()
  })
})

describe("client IP selection", () => {
  it("prefers a valid Cloudflare address", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.20",
      "x-forwarded-for": "203.0.113.30, 10.0.0.1",
    })

    expect(readClientIp(headers)).toBe("203.0.113.20")
  })

  it("falls back safely when proxy headers are invalid", () => {
    expect(readClientIp(new Headers({ "cf-connecting-ip": "not-an-ip" }))).toBe("127.0.0.1")
  })
})
