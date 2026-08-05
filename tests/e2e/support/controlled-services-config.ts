import type { APIRequestContext } from "@playwright/test"

export const APP_URL = "http://localhost:3100"
export const CONTROLLED_SERVICES_URL = "http://127.0.0.1:54321"

export type ControlledOAuthMode = "success" | "cancel" | "provider_error" | "exchange_error"
export type ControlledRateLimitMode = "success" | "error"
export type ControlledDashboardScenario = "empty" | "one-vehicle" | "populated"

export async function resetControlledServices(
  request: APIRequestContext,
  oauthMode: ControlledOAuthMode = "success",
  rateLimitMode: ControlledRateLimitMode = "success",
  dashboardScenario: ControlledDashboardScenario = "empty",
  privateViewDelayMs = 0
) {
  await request.post(`${CONTROLLED_SERVICES_URL}/__test__/reset`, {
    data: { oauthMode, rateLimitMode, dashboardScenario, privateViewDelayMs },
  })
}
