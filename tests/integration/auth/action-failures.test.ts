import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { AUTH_COMMAND_STATUS, AUTH_ERROR_CODE, SIGN_UP_STATUS } from "@/lib/auth/contracts"
import type { loginAction as LoginAction, signupAction as SignupAction } from "@/app/auth/actions"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => {
    throw new Error("raw-boundary-failure")
  }),
}))
vi.mock("@/lib/analytics/anonymous-analytics", () => ({ recordAnonymousAnalytics: vi.fn() }))
vi.mock("@/lib/auth/server", () => ({
  getCurrentUser: vi.fn(async () => null),
  requireCurrentUser: vi.fn(),
}))

let loginAction: typeof LoginAction
let signupAction: typeof SignupAction

beforeAll(async () => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com")
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token")
  vi.stubEnv("KEEPEL_RATE_LIMIT_HMAC_SECRET", "test-rate-limit-secret-that-is-long-enough")

  const actions = await import("@/app/auth/actions")
  loginAction = actions.loginAction
  signupAction = actions.signupAction
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe("auth action failures", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ["login", () => loginAction(null, new FormData()), AUTH_COMMAND_STATUS.ERROR],
    ["signup", () => signupAction(null, new FormData()), SIGN_UP_STATUS.ERROR],
  ])("sanitizes unexpected %s boundary failures with a correlatable reference", async (_name, run, status) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)

    const result = await run()

    expect(result).toEqual({
      status,
      error: {
        code: AUTH_ERROR_CODE.TEMPORARILY_UNAVAILABLE,
        reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
      },
    })
    expect(consoleError).toHaveBeenCalledWith("Authentication temporarily unavailable.", {
      reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
      stage: "action",
    })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("raw-boundary-failure")
  })
})
