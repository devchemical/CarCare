import { expect, test } from "@playwright/test"
import { CONTROLLED_SERVICES_URL } from "../support/controlled-services-config"

test.describe("privacy and cookies", () => {
  test("publishes the combined policy and global privacy controls", async ({ page }) => {
    await page.goto("/privacidad")

    await expect(page).toHaveTitle(/Política de Privacidad y Cookies/)
    await expect(page.getByRole("heading", { level: 1, name: "Política de Privacidad y Cookies" })).toHaveCount(1)
    await expect(page.getByText("Alejandro Bayón Burgos")).toBeVisible()
    await expect(page.getByRole("link", { name: "privacidad@keepel.dev" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Privacidad y cookies", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Configurar cookies" })).toBeVisible()
  })

  test("rejects optional analytics, persists the choice, and allows changing it", async ({
    context,
    page,
    request,
  }) => {
    await request.post(`${CONTROLLED_SERVICES_URL}/__test__/reset`, { data: {} })

    const browserAnalyticsRequests: string[] = []
    page.on("request", (browserRequest) => {
      if (browserRequest.url().includes("openpanel")) {
        browserAnalyticsRequests.push(browserRequest.url())
      }
    })

    await page.goto("/")

    const accept = page.getByRole("button", { name: "Aceptar analítica" })
    const reject = page.getByRole("button", { name: "Rechazar analítica" })
    await expect(accept).toBeVisible()
    await expect(reject).toBeVisible()

    await reject.click()
    await expect(reject).toBeHidden()
    expect(await (await request.get(`${CONTROLLED_SERVICES_URL}/__test__/analytics`)).json()).toEqual({ events: [] })

    const consentCookie = (await context.cookies()).find((cookie) => cookie.name === "keepel_privacy_consent")
    expect(consentCookie).toMatchObject({ httpOnly: true, sameSite: "Lax" })

    await page.reload()
    await expect(page.getByRole("button", { name: "Rechazar analítica" })).toBeHidden()

    await page.getByRole("button", { name: "Configurar cookies" }).click()
    await expect(page.getByRole("heading", { name: "Preferencias de privacidad" })).toBeVisible()
    expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true)
    await page.getByRole("button", { name: "Permitir analítica" }).click()
    await expect(page.getByRole("heading", { name: "Preferencias de privacidad" })).toBeHidden()

    await page.goto("/auth/login")
    await page.getByLabel("Email").fill("driver@keepel.test")
    await page.getByLabel("Contraseña").fill("correct-horse")
    await page.getByRole("button", { name: "Iniciar Sesión", exact: true }).click()
    await expect(page).toHaveURL(/\/$/)

    await expect
      .poll(async () => (await (await request.get(`${CONTROLLED_SERVICES_URL}/__test__/analytics`)).json()).events)
      .toEqual([{ type: "track", payload: { name: "auth_login_email_succeeded" } }])

    expect(browserAnalyticsRequests).toEqual([])
  })

  test("shows an informational privacy notice at signup without a checkbox", async ({ page }) => {
    await page.goto("/auth/signup")

    await expect(page.getByText("Keepel está dirigido a personas mayores de 18 años.")).toBeVisible()
    await expect(
      page.locator("#main-content").getByRole("link", { name: "Política de Privacidad y Cookies" })
    ).toHaveAttribute("href", "/privacidad")
    await expect(page.getByRole("checkbox")).toHaveCount(0)
  })
})
