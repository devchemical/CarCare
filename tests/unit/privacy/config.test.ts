import { describe, expect, it } from "vitest"
import { getRequiredConsentSigningSecret } from "@/lib/privacy/config.mjs"

const expectedError = "KEEPEL_CONSENT_SIGNING_SECRET must be defined and contain at least 32 characters."

describe("privacy consent configuration", () => {
  it.each([undefined, "short-secret-that-is-not-enough"])("rejects a missing or short signing secret", (secret) => {
    expect(() => getRequiredConsentSigningSecret({ KEEPEL_CONSENT_SIGNING_SECRET: secret })).toThrow(expectedError)
  })

  it("accepts exactly 32 characters and returns the original value", () => {
    const secret = "x".repeat(32)

    expect(getRequiredConsentSigningSecret({ KEEPEL_CONSENT_SIGNING_SECRET: secret })).toBe(secret)
  })

  it("validates only the consent signing secret", () => {
    const secret = "consent-secret-that-is-long-enough"

    expect(getRequiredConsentSigningSecret({ KEEPEL_CONSENT_SIGNING_SECRET: secret, OTHER_SECRET: undefined })).toBe(
      secret
    )
  })

  it("never includes an invalid secret in the configuration error", () => {
    const secret = "sensitive-short-secret"

    expect(() => getRequiredConsentSigningSecret({ KEEPEL_CONSENT_SIGNING_SECRET: secret })).toThrow(expectedError)

    try {
      getRequiredConsentSigningSecret({ KEEPEL_CONSENT_SIGNING_SECRET: secret })
    } catch (error) {
      expect(String(error)).not.toContain(secret)
    }
  })
})
