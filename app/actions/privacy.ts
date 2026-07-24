"use server"

import { z } from "zod"
import { PRIVACY_CONSENT_CHOICES, type PrivacyConsentState } from "@/lib/privacy/consent"
import { persistPrivacyConsent } from "@/lib/privacy/server"

const privacyChoiceSchema = z.enum(PRIVACY_CONSENT_CHOICES)

export type SavePrivacyConsentResult = { status: "success"; consent: PrivacyConsentState } | { status: "error" }

export async function savePrivacyConsent(choice: unknown): Promise<SavePrivacyConsentResult> {
  const parsedChoice = privacyChoiceSchema.safeParse(choice)

  if (!parsedChoice.success) {
    return { status: "error" }
  }

  const consent = await persistPrivacyConsent(parsedChoice.data)

  return consent ? { status: "success", consent } : { status: "error" }
}
