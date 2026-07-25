const MINIMUM_CONSENT_SIGNING_SECRET_LENGTH = 32

export const CONSENT_SIGNING_SECRET_ERROR =
  "KEEPEL_CONSENT_SIGNING_SECRET must be defined and contain at least 32 characters."

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isValidConsentSigningSecret(value) {
  return typeof value === "string" && value.length >= MINIMUM_CONSENT_SIGNING_SECRET_LENGTH
}

/**
 * @param {Record<string, string | undefined>} [env]
 * @returns {string}
 */
export function getRequiredConsentSigningSecret(env = process.env) {
  const secret = env.KEEPEL_CONSENT_SIGNING_SECRET

  if (!isValidConsentSigningSecret(secret)) {
    throw new Error(CONSENT_SIGNING_SECRET_ERROR)
  }

  return secret
}
