import { AUTH_ERROR_CODE, type AuthError, type AuthUnavailableStage } from "@/lib/auth/contracts"

export type AuthUnavailableReporter = (stage: AuthUnavailableStage) => string

export function createTemporarilyUnavailableError(
  stage: AuthUnavailableStage,
  reportUnavailable: AuthUnavailableReporter
): Extract<AuthError, { code: typeof AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE }> {
  return {
    code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE,
    reference: reportUnavailable(stage),
  }
}
