import { AUTH_COMMAND_STATUS, AUTH_ERROR_CODE, AUTH_UNAVAILABLE_STAGE, type AuthCommandResult } from "./contracts"
import { sanitizeInternalRedirect } from "./redirects"
import { parsePasswordLoginCredentials } from "./password-login-validation"
import { createTemporarilyUnavailableError, type AuthUnavailableReporter } from "./temporarily-unavailable"

export interface PasswordLoginInput {
  email: unknown
  password: unknown
  clientIp: string
  redirectTo: unknown
}

export type PasswordLoginResult = AuthCommandResult<{ redirectTo: string }>

export type PasswordLoginFailureCode =
  | typeof AUTH_ERROR_CODE.INVALID_CREDENTIALS
  | typeof AUTH_ERROR_CODE.PROVIDER_ERROR

export type PasswordLoginAdapterResult =
  | { authenticated: true }
  | { authenticated: false; errorCode: PasswordLoginFailureCode }

export interface PasswordLoginAuthAdapter {
  signInWithPassword(credentials: { email: string; password: string }): Promise<PasswordLoginAdapterResult>
}

export interface PasswordLoginRateLimitAdapter {
  isAllowed(input: { email: string; clientIp: string }): Promise<boolean>
}

interface PasswordLoginDependencies {
  authAdapter: PasswordLoginAuthAdapter
  rateLimitAdapter: PasswordLoginRateLimitAdapter
  reportUnavailable: AuthUnavailableReporter
}

export function createPasswordLoginCommand({
  authAdapter,
  rateLimitAdapter,
  reportUnavailable,
}: PasswordLoginDependencies) {
  return async function login(input: PasswordLoginInput): Promise<PasswordLoginResult> {
    const credentials = parsePasswordLoginCredentials({
      email: input.email,
      password: input.password,
    })

    if (!credentials.success) {
      return {
        status: AUTH_COMMAND_STATUS.ERROR,
        error: { code: AUTH_ERROR_CODE.VALIDATION_FAILED },
      }
    }

    const { email, password } = credentials.data

    let isAllowed: boolean

    try {
      isAllowed = await rateLimitAdapter.isAllowed({ email, clientIp: input.clientIp })
    } catch {
      return {
        status: AUTH_COMMAND_STATUS.ERROR,
        error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.RATE_LIMIT, reportUnavailable),
      }
    }

    if (!isAllowed) {
      return {
        status: AUTH_COMMAND_STATUS.ERROR,
        error: { code: AUTH_ERROR_CODE.RATE_LIMITED },
      }
    }

    let result: PasswordLoginAdapterResult

    try {
      result = await authAdapter.signInWithPassword({ email, password })
    } catch {
      return {
        status: AUTH_COMMAND_STATUS.ERROR,
        error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.AUTH_PROVIDER, reportUnavailable),
      }
    }

    if (!result.authenticated) {
      if (result.errorCode === AUTH_ERROR_CODE.PROVIDER_ERROR) {
        return {
          status: AUTH_COMMAND_STATUS.ERROR,
          error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.AUTH_PROVIDER, reportUnavailable),
        }
      }

      return {
        status: AUTH_COMMAND_STATUS.ERROR,
        error: { code: result.errorCode },
      }
    }

    return {
      status: AUTH_COMMAND_STATUS.SUCCESS,
      data: { redirectTo: sanitizeInternalRedirect(input.redirectTo) },
    }
  }
}
