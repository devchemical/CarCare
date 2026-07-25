import { describe, expect, it } from "vitest"
import {
  PRIVACY_CONSENT_MAX_AGE_SECONDS,
  UNKNOWN_PRIVACY_CONSENT,
  allowsAnonymousAnalytics,
  createPrivacyConsentCookieValue,
  parsePrivacyConsentCookieValue,
} from "@/lib/privacy/consent"

const secret = "consent-secret-that-is-at-least-32-characters-long"
const now = new Date("2026-07-22T12:00:00.000Z")

describe("privacy consent cookie", () => {
  it("round-trips an accepted choice", () => {
    const value = createPrivacyConsentCookieValue("accepted", secret, now)
    const parsed = parsePrivacyConsentCookieValue(value ?? undefined, secret, now)

    expect(parsed).toEqual({
      preference: "accepted",
      decidedAt: now.toISOString(),
      policyVersion: "1.0",
    })
    expect(allowsAnonymousAnalytics(parsed)).toBe(true)
  })

  it("round-trips a rejected choice without allowing analytics", () => {
    const value = createPrivacyConsentCookieValue("rejected", secret, now)
    const parsed = parsePrivacyConsentCookieValue(value ?? undefined, secret, now)

    expect(parsed.preference).toBe("rejected")
    expect(allowsAnonymousAnalytics(parsed)).toBe(false)
  })

  it("fails closed for missing, tampered, or wrongly signed values", () => {
    const value = createPrivacyConsentCookieValue("accepted", secret, now) ?? ""

    expect(parsePrivacyConsentCookieValue(undefined, secret, now)).toEqual(UNKNOWN_PRIVACY_CONSENT)
    expect(parsePrivacyConsentCookieValue(`${value}tampered`, secret, now)).toEqual(UNKNOWN_PRIVACY_CONSENT)
    expect(parsePrivacyConsentCookieValue(value, `${secret}-different`, now)).toEqual(UNKNOWN_PRIVACY_CONSENT)
  })

  it("fails closed when the preference has expired", () => {
    const value = createPrivacyConsentCookieValue("accepted", secret, now)
    const afterExpiry = new Date(now.getTime() + PRIVACY_CONSENT_MAX_AGE_SECONDS * 1000 + 1)

    expect(parsePrivacyConsentCookieValue(value ?? undefined, secret, afterExpiry)).toEqual(UNKNOWN_PRIVACY_CONSENT)
  })

  it.each(["accepted", "rejected"] as const)("fails closed after rotating a %s preference", (choice) => {
    const value = createPrivacyConsentCookieValue(choice, secret, now)
    const rotatedSecret = "rotated-consent-secret-that-is-at-least-32-characters"
    const parsed = parsePrivacyConsentCookieValue(value ?? undefined, rotatedSecret, now)

    expect(parsed).toEqual(UNKNOWN_PRIVACY_CONSENT)
    expect(allowsAnonymousAnalytics(parsed)).toBe(false)
  })

  it("refuses short signing secrets", () => {
    expect(createPrivacyConsentCookieValue("accepted", "too-short", now)).toBeNull()
    expect(parsePrivacyConsentCookieValue("value.signature", "too-short", now)).toEqual(UNKNOWN_PRIVACY_CONSENT)
  })
})
