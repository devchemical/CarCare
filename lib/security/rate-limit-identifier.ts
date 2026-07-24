import "server-only"

import { createHmac } from "node:crypto"

const MINIMUM_SECRET_LENGTH = 32

export const RATE_LIMIT_IDENTIFIER_DOMAINS = ["login-email", "login-ip", "signup-email", "signup-ip"] as const

export type RateLimitIdentifierDomain = (typeof RATE_LIMIT_IDENTIFIER_DOMAINS)[number]

export function createRateLimitIdentifier(
  domain: RateLimitIdentifierDomain,
  value: string,
  secret = process.env.KEEPEL_RATE_LIMIT_HMAC_SECRET
): string {
  if (!secret || secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error("Rate-limit HMAC secret is not configured.")
  }

  const digest = createHmac("sha256", secret).update(`keepel:rate-limit:v1\0${domain}\0${value}`).digest("base64url")

  return `v1_${domain}_${digest}`
}
