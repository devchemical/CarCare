import { describe, expect, it } from "vitest"
import { validateRateLimitEnvironment } from "@/lib/config/rate-limit-environment.mjs"

const validEnvironment = {
  UPSTASH_REDIS_REST_URL: "https://redis.example.com",
  UPSTASH_REDIS_REST_TOKEN: "redis-token",
  KEEPEL_RATE_LIMIT_HMAC_SECRET: "rate-limit-secret-that-is-at-least-32-characters",
}

describe("rate-limit server environment", () => {
  it.each([
    ["UPSTASH_REDIS_REST_URL", undefined],
    ["UPSTASH_REDIS_REST_TOKEN", ""],
    ["KEEPEL_RATE_LIMIT_HMAC_SECRET", "too-short"],
  ] as const)("rejects an invalid %s before the application starts", (name, value) => {
    expect(() => validateRateLimitEnvironment({ ...validEnvironment, [name]: value })).toThrow(
      "Rate-limit server environment is not configured."
    )
  })

  it("accepts complete rate-limit server configuration", () => {
    expect(validateRateLimitEnvironment(validEnvironment)).toBeUndefined()
  })
})
