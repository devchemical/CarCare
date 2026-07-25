export const AUTH_STATE_STATUS = {
  ANONYMOUS: "anonymous",
  AUTHENTICATED: "authenticated",
} as const

export const AUTH_COMMAND_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
} as const

export const AUTH_ERROR_CODE = {
  AUTHENTICATION_REQUIRED: "authentication_required",
  INVALID_CREDENTIALS: "invalid_credentials",
  RATE_LIMITED: "rate_limited",
  VALIDATION_FAILED: "validation_failed",
  PROVIDER_ERROR: "provider_error",
  SESSION_EXPIRED: "session_expired",
  TEMPORARILY_UNAVAILABLE: "temporarily_unavailable",
  UNEXPECTED: "unexpected",
} as const

export const OAUTH_ERROR_CODE = {
  CANCELLED: "oauth_cancelled",
  PROVIDER_ERROR: AUTH_ERROR_CODE.PROVIDER_ERROR,
  UNEXPECTED: AUTH_ERROR_CODE.UNEXPECTED,
} as const

export const SIGN_UP_STATUS = {
  AUTHENTICATED: "authenticated",
  CONFIRMATION_REQUIRED: "confirmation_required",
  ERROR: "error",
} as const

export const SIGN_UP_RATE_LIMIT_SCOPE = {
  IP: "ip",
  EMAIL: "email",
} as const

export const AUTH_UNAVAILABLE_STAGE = {
  ACTION: "action",
  AUTH_PROVIDER: "auth_provider",
  RATE_LIMIT: "rate_limit",
} as const

type ValueOf<T> = T[keyof T]

declare const userIdBrand: unique symbol

export type UserId = string & { readonly [userIdBrand]: "UserId" }

export type AuthErrorCode = ValueOf<typeof AUTH_ERROR_CODE>
export type AuthUnavailableStage = ValueOf<typeof AUTH_UNAVAILABLE_STAGE>

export type OAuthErrorCode = ValueOf<typeof OAUTH_ERROR_CODE>

export type SignUpRateLimitScope = ValueOf<typeof SIGN_UP_RATE_LIMIT_SCOPE>

export type AuthError = {
  [Code in AuthErrorCode]: Code extends typeof AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE
    ? { code: Code; reference: string }
    : { code: Code }
}[AuthErrorCode]

export interface CurrentUser {
  id: UserId
  email: string | null
  displayName: string
}

export type AuthState =
  | {
      status: typeof AUTH_STATE_STATUS.ANONYMOUS
      user: null
    }
  | {
      status: typeof AUTH_STATE_STATUS.AUTHENTICATED
      user: CurrentUser
    }

export type AuthCommandResult<SuccessData = undefined> =
  | {
      status: typeof AUTH_COMMAND_STATUS.SUCCESS
      data: SuccessData
    }
  | {
      status: typeof AUTH_COMMAND_STATUS.ERROR
      error: AuthError
    }

export type SignUpError =
  | Exclude<AuthError, { code: typeof AUTH_ERROR_CODE.RATE_LIMITED }>
  | {
      code: typeof AUTH_ERROR_CODE.RATE_LIMITED
      scope: SignUpRateLimitScope
      remaining: number
      limit: number
      reset: number
    }

export type SignUpResult =
  | {
      status: typeof SIGN_UP_STATUS.AUTHENTICATED
      user: CurrentUser
    }
  | {
      status: typeof SIGN_UP_STATUS.CONFIRMATION_REQUIRED
    }
  | {
      status: typeof SIGN_UP_STATUS.ERROR
      error: SignUpError
    }
