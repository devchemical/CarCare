export const CONSENT_SIGNING_SECRET_ERROR: string

export function isValidConsentSigningSecret(value: unknown): value is string

export function getRequiredConsentSigningSecret(env?: Record<string, string | undefined>): string
