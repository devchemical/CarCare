import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Validamos que las variables de entorno existan para evitar errores silenciosos en producción
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Redis credentials are not defined in environment variables.")
}

// Rate Limiter para LOGIN: 5 intentos cada 60 segundos (1 minuto)
export const loginRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "@upstash/ratelimit/login",
  analytics: true,
})

// Rate Limiter para SIGNUP: 3 intentos cada hora
export const signupRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "3600 s"), // 3600s = 1 hora
  prefix: "@upstash/ratelimit/signup",
  analytics: true,
})
