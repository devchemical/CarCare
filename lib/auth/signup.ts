import {
  AUTH_ERROR_CODE,
  AUTH_UNAVAILABLE_STAGE,
  SIGN_UP_STATUS,
  type SignUpRateLimitScope,
  type SignUpResult,
} from "./contracts"
import { parseSignupInput } from "./signup-validation"
import { createTemporarilyUnavailableError, type AuthUnavailableReporter } from "./temporarily-unavailable"

export interface SignupInput {
  email: unknown
  password: unknown
  confirmPassword: unknown
  fullName: unknown
  clientIp: string
  emailRedirectTo: string
}

export interface SignupAuthAdapter {
  signUp(input: { email: string; password: string; fullName: string; emailRedirectTo: string }): Promise<SignUpResult>
}

export interface SignupRateLimitAdapter {
  isAllowed(input: { email: string; clientIp: string }): Promise<
    | { allowed: true }
    | {
        allowed: false
        scope: SignUpRateLimitScope
        remaining: number
        limit: number
        reset: number
      }
  >
}

interface SignupDependencies {
  authAdapter: SignupAuthAdapter
  rateLimitAdapter: SignupRateLimitAdapter
  reportUnavailable: AuthUnavailableReporter
}

export function createSignupCommand({ authAdapter, rateLimitAdapter, reportUnavailable }: SignupDependencies) {
  return async function signup(input: SignupInput): Promise<SignUpResult> {
    const signupInput = parseSignupInput(input)

    if (!signupInput.success) {
      return {
        status: SIGN_UP_STATUS.ERROR,
        error: { code: AUTH_ERROR_CODE.VALIDATION_FAILED },
      }
    }

    const { email, password, fullName } = signupInput.data

    let rateLimit: Awaited<ReturnType<SignupRateLimitAdapter["isAllowed"]>>

    try {
      rateLimit = await rateLimitAdapter.isAllowed({ email, clientIp: input.clientIp })
    } catch {
      return {
        status: SIGN_UP_STATUS.ERROR,
        error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.RATE_LIMIT, reportUnavailable),
      }
    }

    if (!rateLimit.allowed) {
      return {
        status: SIGN_UP_STATUS.ERROR,
        error: {
          code: AUTH_ERROR_CODE.RATE_LIMITED,
          scope: rateLimit.scope,
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
          reset: rateLimit.reset,
        },
      }
    }

    let result: SignUpResult

    try {
      result = await authAdapter.signUp({
        email,
        password,
        fullName,
        emailRedirectTo: input.emailRedirectTo,
      })
    } catch {
      return {
        status: SIGN_UP_STATUS.ERROR,
        error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.AUTH_PROVIDER, reportUnavailable),
      }
    }

    if (result.status === SIGN_UP_STATUS.ERROR && result.error.code === AUTH_ERROR_CODE.PROVIDER_ERROR) {
      return {
        status: SIGN_UP_STATUS.ERROR,
        error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.AUTH_PROVIDER, reportUnavailable),
      }
    }

    return result
  }
}
