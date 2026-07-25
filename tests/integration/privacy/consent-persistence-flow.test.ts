import { describe, expect, it } from "vitest"
import {
  PRIVACY_CONSENT_COOKIE_NAME,
  PRIVACY_CONSENT_MAX_AGE_SECONDS,
  UNKNOWN_PRIVACY_CONSENT,
  allowsAnonymousAnalytics,
} from "@/lib/privacy/consent"
import { createPrivacyConsentPersistence } from "@/lib/privacy/server"

const signingSecret = "consent-secret-that-is-at-least-32-characters-long"
const now = new Date("2026-07-25T12:00:00.000Z")

interface RecordedCookie {
  value: string
  options: {
    httpOnly: boolean
    maxAge: number
    path: string
    sameSite: "lax"
    secure: boolean
  }
}

function createCookieStore(cookies = new Map<string, RecordedCookie>()) {
  return {
    cookies,
    store: {
      get(name: string) {
        const cookie = cookies.get(name)
        return cookie ? { value: cookie.value } : undefined
      },
      set(name: string, value: string, options: RecordedCookie["options"]) {
        cookies.set(name, { value, options })
      },
    },
  }
}

describe("privacy consent persistence", () => {
  it.each([
    { choice: "accepted" as const, allowsAnalytics: true },
    { choice: "rejected" as const, allowsAnalytics: false },
  ])("persists $choice consent across requests", async ({ choice, allowsAnalytics }) => {
    const { cookies, store } = createCookieStore()
    const persistence = createPrivacyConsentPersistence({
      getCookieStore: async () => store,
      getSigningSecret: () => signingSecret,
      now: () => now,
      nodeEnvironment: "production",
    })

    expect(await persistence.read()).toEqual(UNKNOWN_PRIVACY_CONSENT)

    const saved = await persistence.persist(choice)
    const cookie = cookies.get(PRIVACY_CONSENT_COOKIE_NAME)

    expect(saved).toEqual({
      preference: choice,
      decidedAt: now.toISOString(),
      policyVersion: "1.0",
    })
    expect(cookie?.options).toEqual({
      httpOnly: true,
      maxAge: PRIVACY_CONSENT_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: true,
    })

    const nextRequest = createPrivacyConsentPersistence({
      getCookieStore: async () => store,
      getSigningSecret: () => signingSecret,
      now: () => now,
      nodeEnvironment: "production",
    })
    const restored = await nextRequest.read()

    expect(restored).toEqual(saved)
    expect(allowsAnonymousAnalytics(restored)).toBe(allowsAnalytics)
  })

  it("fails closed after rotating the signing secret", async () => {
    const { store } = createCookieStore()
    const oldPersistence = createPrivacyConsentPersistence({
      getCookieStore: async () => store,
      getSigningSecret: () => signingSecret,
      now: () => now,
    })
    await oldPersistence.persist("accepted")

    const rotatedPersistence = createPrivacyConsentPersistence({
      getCookieStore: async () => store,
      getSigningSecret: () => "rotated-consent-secret-that-is-at-least-32-characters",
      now: () => now,
    })
    const restored = await rotatedPersistence.read()

    expect(restored).toEqual(UNKNOWN_PRIVACY_CONSENT)
    expect(allowsAnonymousAnalytics(restored)).toBe(false)
  })
})
