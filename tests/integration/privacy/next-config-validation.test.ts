import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const projectRoot = fileURLToPath(new URL("../../..", import.meta.url))
const expectedConsentError = "KEEPEL_CONSENT_SIGNING_SECRET must be defined and contain at least 32 characters."
const expectedRateLimitError = "Rate-limit server environment is not configured."
const validServerEnvironment = {
  KEEPEL_CONSENT_SIGNING_SECRET: "consent-secret-that-is-long-enough",
  KEEPEL_RATE_LIMIT_HMAC_SECRET: "rate-limit-secret-that-is-at-least-32-characters",
  UPSTASH_REDIS_REST_TOKEN: "redis-token",
  UPSTASH_REDIS_REST_URL: "https://redis.example.com",
}

type ServerEnvironmentOverrides = Partial<Record<keyof typeof validServerEnvironment, string | undefined>>

function importNextConfig(overrides: ServerEnvironmentOverrides = {}) {
  const environment: NodeJS.ProcessEnv = { ...process.env, ...validServerEnvironment }

  for (const [name, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete environment[name]
    } else {
      environment[name] = value
    }
  }

  return spawnSync("node", ["--input-type=module", "--eval", 'await import("./next.config.mjs")'], {
    cwd: projectRoot,
    encoding: "utf8",
    env: environment,
  })
}

describe("Next privacy configuration", () => {
  it.each([undefined, "too-short"])("fails while loading when the consent secret is invalid", (secret) => {
    const result = importNextConfig({ KEEPEL_CONSENT_SIGNING_SECRET: secret })
    const output = `${result.stdout}${result.stderr}`

    expect(result.status).not.toBe(0)
    expect(output).toContain(expectedConsentError)

    if (secret) {
      expect(output).not.toContain(secret)
    }
  })

  it("loads with a complete valid server environment", () => {
    const result = importNextConfig()

    expect(result.status).toBe(0)
    expect(result.stderr).toBe("")
  })
})

describe("Next rate-limit configuration", () => {
  it.each([
    ["UPSTASH_REDIS_REST_URL", undefined],
    ["UPSTASH_REDIS_REST_TOKEN", undefined],
    ["KEEPEL_RATE_LIMIT_HMAC_SECRET", undefined],
    ["KEEPEL_RATE_LIMIT_HMAC_SECRET", "too-short"],
  ] as const)("fails while loading when %s is invalid", (name, value) => {
    const result = importNextConfig({ [name]: value })
    const output = `${result.stdout}${result.stderr}`

    expect(result.status).not.toBe(0)
    expect(output).toContain(expectedRateLimitError)

    if (value) {
      expect(output).not.toContain(value)
    }
  })
})
