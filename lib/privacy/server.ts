import "server-only"

import { cookies } from "next/headers"
import {
  PRIVACY_CONSENT_COOKIE_NAME,
  PRIVACY_CONSENT_MAX_AGE_SECONDS,
  createPrivacyConsentCookieValue,
  parsePrivacyConsentCookieValue,
  type PrivacyConsentChoice,
  type PrivacyConsentState,
} from "./consent"

function getConsentSecret() {
  return process.env.KEEPEL_CONSENT_SIGNING_SECRET
}

export function getPrivacyConsentCookieOptions() {
  return {
    httpOnly: true,
    maxAge: PRIVACY_CONSENT_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  }
}

export async function readPrivacyConsent(): Promise<PrivacyConsentState> {
  const cookieStore = await cookies()

  return parsePrivacyConsentCookieValue(cookieStore.get(PRIVACY_CONSENT_COOKIE_NAME)?.value, getConsentSecret())
}

export async function persistPrivacyConsent(choice: PrivacyConsentChoice): Promise<PrivacyConsentState | null> {
  const cookieStore = await cookies()
  const now = new Date()
  const value = createPrivacyConsentCookieValue(choice, getConsentSecret(), now)

  if (!value) {
    return null
  }

  cookieStore.set(PRIVACY_CONSENT_COOKIE_NAME, value, getPrivacyConsentCookieOptions())

  return parsePrivacyConsentCookieValue(value, getConsentSecret(), now)
}
