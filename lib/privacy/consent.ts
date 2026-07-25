import { Buffer } from "node:buffer"
import { createHmac, timingSafeEqual } from "node:crypto"
import { isValidConsentSigningSecret } from "@/lib/privacy/config.mjs"

export const PRIVACY_POLICY_VERSION = "1.0"
export const PRIVACY_CONSENT_COOKIE_NAME = "keepel_privacy_consent"
export const PRIVACY_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const CONSENT_COOKIE_FORMAT_VERSION = 1
const MAX_FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000

export const PRIVACY_CONSENT_CHOICES = ["accepted", "rejected"] as const

export type PrivacyConsentChoice = (typeof PRIVACY_CONSENT_CHOICES)[number]
export type PrivacyConsentPreference = PrivacyConsentChoice | "unknown"

export interface PrivacyConsentState {
  preference: PrivacyConsentPreference
  decidedAt: string | null
  policyVersion: string | null
}

interface ConsentPayload {
  version: number
  choice: PrivacyConsentChoice
  decidedAt: string
  policyVersion: string
}

export const UNKNOWN_PRIVACY_CONSENT: PrivacyConsentState = {
  preference: "unknown",
  decidedAt: null,
  policyVersion: null,
}

function isConsentChoice(value: unknown): value is PrivacyConsentChoice {
  return PRIVACY_CONSENT_CHOICES.includes(value as PrivacyConsentChoice)
}

function encodePayload(payload: ConsentPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

function signaturesMatch(actual: string, expected: string): boolean {
  try {
    const actualBuffer = Buffer.from(actual, "base64url")
    const expectedBuffer = Buffer.from(expected, "base64url")

    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  } catch {
    return false
  }
}

function parsePayload(encodedPayload: string): ConsentPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as unknown

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null
    }

    const payload = parsed as Partial<ConsentPayload>

    return payload.version === CONSENT_COOKIE_FORMAT_VERSION &&
      isConsentChoice(payload.choice) &&
      typeof payload.decidedAt === "string" &&
      payload.policyVersion === PRIVACY_POLICY_VERSION
      ? (payload as ConsentPayload)
      : null
  } catch {
    return null
  }
}

export function createPrivacyConsentCookieValue(
  choice: PrivacyConsentChoice,
  secret: string | undefined,
  now = new Date()
): string | null {
  if (!isValidConsentSigningSecret(secret)) {
    return null
  }

  const encodedPayload = encodePayload({
    version: CONSENT_COOKIE_FORMAT_VERSION,
    choice,
    decidedAt: now.toISOString(),
    policyVersion: PRIVACY_POLICY_VERSION,
  })

  return `${encodedPayload}.${signPayload(encodedPayload, secret)}`
}

export function parsePrivacyConsentCookieValue(
  value: string | undefined,
  secret: string | undefined,
  now = new Date()
): PrivacyConsentState {
  if (!value || !isValidConsentSigningSecret(secret)) {
    return UNKNOWN_PRIVACY_CONSENT
  }

  const separatorIndex = value.lastIndexOf(".")

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return UNKNOWN_PRIVACY_CONSENT
  }

  const encodedPayload = value.slice(0, separatorIndex)
  const actualSignature = value.slice(separatorIndex + 1)
  const expectedSignature = signPayload(encodedPayload, secret)

  if (!signaturesMatch(actualSignature, expectedSignature)) {
    return UNKNOWN_PRIVACY_CONSENT
  }

  const payload = parsePayload(encodedPayload)

  if (!payload) {
    return UNKNOWN_PRIVACY_CONSENT
  }

  const decidedAt = new Date(payload.decidedAt)
  const decidedAtMs = decidedAt.getTime()
  const nowMs = now.getTime()
  const expiresAtMs = decidedAtMs + PRIVACY_CONSENT_MAX_AGE_SECONDS * 1000

  if (Number.isNaN(decidedAtMs) || decidedAtMs > nowMs + MAX_FUTURE_CLOCK_SKEW_MS || expiresAtMs <= nowMs) {
    return UNKNOWN_PRIVACY_CONSENT
  }

  return {
    preference: payload.choice,
    decidedAt: decidedAt.toISOString(),
    policyVersion: payload.policyVersion,
  }
}

export function allowsAnonymousAnalytics(state: PrivacyConsentState): boolean {
  return state.preference === "accepted"
}
