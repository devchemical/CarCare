import "server-only"

import { cookies } from "next/headers"
import {
  PRIVACY_CONSENT_COOKIE_NAME,
  PRIVACY_CONSENT_MAX_AGE_SECONDS,
  createPrivacyConsentCookieValue,
  parsePrivacyConsentCookieValue,
  type PrivacyConsentChoice,
  type PrivacyConsentState,
} from "@/lib/privacy/consent"
import { getRequiredConsentSigningSecret } from "@/lib/privacy/config.mjs"

interface PrivacyConsentCookieOptions {
  httpOnly: boolean
  maxAge: number
  path: string
  sameSite: "lax"
  secure: boolean
}

interface PrivacyConsentCookieStore {
  get(name: string): { value: string } | undefined
  set(name: string, value: string, options: PrivacyConsentCookieOptions): void
}

interface PrivacyConsentPersistenceDependencies {
  getCookieStore(): Promise<PrivacyConsentCookieStore>
  getSigningSecret(): string
  now?: () => Date
  nodeEnvironment?: typeof process.env.NODE_ENV
}

export function getPrivacyConsentCookieOptions(nodeEnvironment = process.env.NODE_ENV): PrivacyConsentCookieOptions {
  return {
    httpOnly: true,
    maxAge: PRIVACY_CONSENT_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: nodeEnvironment === "production",
  }
}

export function createPrivacyConsentPersistence({
  getCookieStore,
  getSigningSecret,
  now = () => new Date(),
  nodeEnvironment = process.env.NODE_ENV,
}: PrivacyConsentPersistenceDependencies) {
  return {
    async read(): Promise<PrivacyConsentState> {
      const cookieStore = await getCookieStore()
      const secret = getSigningSecret()

      return parsePrivacyConsentCookieValue(cookieStore.get(PRIVACY_CONSENT_COOKIE_NAME)?.value, secret, now())
    },

    async persist(choice: PrivacyConsentChoice): Promise<PrivacyConsentState> {
      const cookieStore = await getCookieStore()
      const secret = getSigningSecret()
      const decisionTime = now()
      const value = createPrivacyConsentCookieValue(choice, secret, decisionTime)

      if (!value) {
        throw new Error("Privacy consent cookie signing failed.")
      }

      cookieStore.set(PRIVACY_CONSENT_COOKIE_NAME, value, getPrivacyConsentCookieOptions(nodeEnvironment))

      return parsePrivacyConsentCookieValue(value, secret, decisionTime)
    },
  }
}

const privacyConsentPersistence = createPrivacyConsentPersistence({
  getCookieStore: cookies,
  getSigningSecret: getRequiredConsentSigningSecret,
})

export async function readPrivacyConsent(): Promise<PrivacyConsentState> {
  return privacyConsentPersistence.read()
}

export async function persistPrivacyConsent(choice: PrivacyConsentChoice): Promise<PrivacyConsentState> {
  return privacyConsentPersistence.persist(choice)
}
