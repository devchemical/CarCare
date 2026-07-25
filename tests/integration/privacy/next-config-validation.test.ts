import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const projectRoot = fileURLToPath(new URL("../../..", import.meta.url))
const expectedError = "KEEPEL_CONSENT_SIGNING_SECRET must be defined and contain at least 32 characters."

function importNextConfig(secret?: string) {
  const environment = { ...process.env }

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

    expect(result.status).not.toBe(0)
    expect(`${result.stdout}${result.stderr}`).toContain(expectedError)
  })

  it("loads with a valid consent secret", () => {
    const result = importNextConfig("consent-secret-that-is-long-enough")

    expect(result.status).toBe(0)
    expect(result.stderr).toBe("")
  })
})
