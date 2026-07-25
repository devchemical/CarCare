import { z } from "zod"
import { PRIVACY_CONSENT_CHOICES, type PrivacyConsentChoice, type PrivacyConsentState } from "@/lib/privacy/consent"

const privacyChoiceSchema = z.enum(PRIVACY_CONSENT_CHOICES)

export type SavePrivacyConsentResult = { status: "success"; consent: PrivacyConsentState } | { status: "error" }

interface SavePrivacyConsentDependencies {
  persistConsent(choice: PrivacyConsentChoice): Promise<PrivacyConsentState>
  reportUnexpectedFailure(): void
}

export function createSavePrivacyConsent({
  persistConsent,
  reportUnexpectedFailure,
}: SavePrivacyConsentDependencies): (choice: unknown) => Promise<SavePrivacyConsentResult> {
  return async (choice) => {
    const parsedChoice = privacyChoiceSchema.safeParse(choice)

    if (!parsedChoice.success) {
      return { status: "error" }
    }

    try {
      const consent = await persistConsent(parsedChoice.data)

      return { status: "success", consent }
    } catch {
      reportUnexpectedFailure()

      return { status: "error" }
    }
  }
}
