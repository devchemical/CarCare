import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const projectRoot = fileURLToPath(new URL("../../..", import.meta.url))
const expectedError = "KEEPEL_CONSENT_SIGNING_SECRET must be defined and contain at least 32 characters."
const validServerEnvironment = {
  KEEPEL_CONSENT_SIGNING_SECRET: "consent-secret-that-is-long-enough",
  KEEPEL_RATE_LIMIT_HMAC_SECRET: "rate-limit-secret-that-is-at-least-32-characters",
  UPSTASH_REDIS_REST_TOKEN: "redis-token",
  UPSTASH_REDIS_REST_URL: "https://redis.example.com",
}

function importNextConfig(secret?: string) {
  const environment: NodeJS.ProcessEnv = { ...process.env, ...validServerEnvironment }

  if (secret === undefined) {
    delete environment.KEEPEL_CONSENT_SIGNING_SECRET
  } else {
    environment.KEEPEL_CONSENT_SIGNING_SECRET = secret
  }

  return spawnSync("node", ["--input-type=module", "--eval", 'await import("./next.config.mjs")'], {
    cwd: projectRoot,
    encoding: "utf8",
    env: environment,
  })
}

describe("Next privacy configuration", () => {
  it.each([undefined, "too-short"])("fails while loading when the consent secret is invalid", (secret) => {
    const result = importNextConfig(secret)
    const output = `${result.stdout}${result.stderr}`

    expect(result.status).not.toBe(0)
    expect(output).toContain(expectedError)

    if (secret) {
      expect(output).not.toContain(secret)
    }
  })

  it("loads with a valid consent secret", () => {
    const result = importNextConfig(validServerEnvironment.KEEPEL_CONSENT_SIGNING_SECRET)

    expect(result.status).toBe(0)
    expect(result.stderr).toBe("")
  })
})
