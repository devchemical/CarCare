"use server"

/* eslint-disable no-console -- Server actions log unexpected consent failures without sensitive context. */

import { createSavePrivacyConsent, type SavePrivacyConsentResult } from "@/lib/privacy/save-consent"
import { persistPrivacyConsent } from "@/lib/privacy/server"

const saveConsent = createSavePrivacyConsent({
  persistConsent: persistPrivacyConsent,
  reportUnexpectedFailure: () => {
    console.error("Unexpected privacy consent persistence failure.")
  },
})

export async function savePrivacyConsent(choice: unknown): Promise<SavePrivacyConsentResult> {
  return saveConsent(choice)
}
