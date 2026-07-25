export interface RateLimitEnvironment {
  UPSTASH_REDIS_REST_URL?: string
  UPSTASH_REDIS_REST_TOKEN?: string
  KEEPEL_RATE_LIMIT_HMAC_SECRET?: string
}

export function validateRateLimitEnvironment(environment?: RateLimitEnvironment): void
