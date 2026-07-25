const MINIMUM_SECRET_LENGTH = 32
const CONFIGURATION_ERROR = "Rate-limit server environment is not configured."

export function validateRateLimitEnvironment(environment = process.env) {
  if (
    !environment.UPSTASH_REDIS_REST_URL ||
    !environment.UPSTASH_REDIS_REST_TOKEN ||
    !environment.KEEPEL_RATE_LIMIT_HMAC_SECRET ||
    environment.KEEPEL_RATE_LIMIT_HMAC_SECRET.length < MINIMUM_SECRET_LENGTH
  ) {
    throw new Error(CONFIGURATION_ERROR)
  }
}
