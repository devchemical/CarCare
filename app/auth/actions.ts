"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { recordAnonymousAnalytics } from "@/lib/analytics/anonymous-analytics"
import {
  AUTH_COMMAND_STATUS,
  AUTH_UNAVAILABLE_STAGE,
  SIGN_UP_RATE_LIMIT_SCOPE,
  SIGN_UP_STATUS,
  type SignUpResult,
} from "@/lib/auth/contracts"
import { createPasswordLoginCommand, type PasswordLoginResult } from "@/lib/auth/password-login"
import { reportAuthUnavailable } from "@/lib/auth/auth-unavailable"
import { createTemporarilyUnavailableError } from "@/lib/auth/temporarily-unavailable"
import { createLogoutCommand, type LogoutResult } from "@/lib/auth/logout"
import { getCurrentUser, requireCurrentUser } from "@/lib/auth/server"
import { createSignupCommand } from "@/lib/auth/signup"
import { createSupabasePasswordLoginAuthAdapter } from "@/lib/auth/supabase-password-login-adapter"
import { createSupabaseLogoutAuthAdapter } from "@/lib/auth/supabase-logout-adapter"
import { createSupabaseSignupAuthAdapter } from "@/lib/auth/supabase-signup-adapter"
import { loginRateLimiter, signupRateLimiter } from "@/lib/ratelimit"
import { readClientIp } from "@/lib/security/client-ip"
import { createRateLimitIdentifier } from "@/lib/security/rate-limit-identifier"
import { createClient } from "@/lib/supabase/server"

const passwordLogin = createPasswordLoginCommand({
  authAdapter: createSupabasePasswordLoginAuthAdapter(createClient),
  rateLimitAdapter: {
    async isAllowed({ email, clientIp }) {
      const [emailLimit, ipLimit] = await Promise.all([
        loginRateLimiter.limit(createRateLimitIdentifier("login-email", email)),
        loginRateLimiter.limit(createRateLimitIdentifier("login-ip", clientIp)),
      ])

      return emailLimit.success && ipLimit.success
    },
  },
  reportUnavailable: reportAuthUnavailable,
})

const logout = createLogoutCommand({
  authAdapter: createSupabaseLogoutAuthAdapter(createClient),
  requireCurrentUser,
})

const signup = createSignupCommand({
  authAdapter: createSupabaseSignupAuthAdapter(createClient),
  rateLimitAdapter: {
    async isAllowed({ email, clientIp }) {
      const ipLimit = await signupRateLimiter.limit(createRateLimitIdentifier("signup-ip", clientIp))

      if (!ipLimit.success) {
        return {
          allowed: false,
          scope: SIGN_UP_RATE_LIMIT_SCOPE.IP,
          remaining: ipLimit.remaining,
          limit: ipLimit.limit,
          reset: ipLimit.reset,
        }
      }

      const emailLimit = await signupRateLimiter.limit(createRateLimitIdentifier("signup-email", email))

      return emailLimit.success
        ? { allowed: true }
        : {
            allowed: false,
            scope: SIGN_UP_RATE_LIMIT_SCOPE.EMAIL,
            remaining: emailLimit.remaining,
            limit: emailLimit.limit,
            reset: emailLimit.reset,
          }
    },
  },
  reportUnavailable: reportAuthUnavailable,
})

export async function loginAction(
  _previousResult: PasswordLoginResult | null,
  formData: FormData
): Promise<PasswordLoginResult> {
  try {
    const headersList = await headers()

    const result = await passwordLogin({
      email: formData.get("email"),
      password: formData.get("password"),
      clientIp: readClientIp(headersList),
      redirectTo: formData.get("redirectTo"),
    })

    if (result.status === AUTH_COMMAND_STATUS.SUCCESS) {
      await recordAnonymousAnalytics("auth_login_email_succeeded")
    }

    return result
  } catch {
    return {
      status: AUTH_COMMAND_STATUS.ERROR,
      error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.ACTION, reportAuthUnavailable),
    }
  }
}

export async function logoutAction(_previousResult: LogoutResult | null, _formData: FormData): Promise<LogoutResult> {
  const result = await logout()

  if (result.status === AUTH_COMMAND_STATUS.SUCCESS) {
    await recordAnonymousAnalytics("auth_logout_succeeded")
    revalidatePath("/", "layout")
  }

  return result
}

export async function signupAction(_previousResult: SignUpResult | null, formData: FormData): Promise<SignUpResult> {
  try {
    const currentUser = await getCurrentUser()

    if (currentUser) {
      return { status: SIGN_UP_STATUS.AUTHENTICATED, user: currentUser }
    }

    const headersList = await headers()

    return await signup({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      fullName: formData.get("fullName"),
      clientIp: readClientIp(headersList),
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
        "http://localhost:3000/",
    })
  } catch {
    return {
      status: SIGN_UP_STATUS.ERROR,
      error: createTemporarilyUnavailableError(AUTH_UNAVAILABLE_STAGE.ACTION, reportAuthUnavailable),
    }
  }
}
