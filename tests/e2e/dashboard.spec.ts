import { expect, test } from "@playwright/test"
import { loginWithPassword } from "./support/auth"
import { resetControlledServices } from "./support/controlled-services-config"

test("the authenticated dashboard shell, content limits, and maintenance states work together", async ({
  page,
  request,
}) => {
  await resetControlledServices(request, "success", "success", "populated")
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.clock.install({ time: new Date(2026, 7, 4, 12) })
  await loginWithPassword(page)

  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Dashboard" })
  ).toHaveAttribute("aria-current", "page")
  await expect(page.getByRole("link", { name: "Ver vehículo" })).toHaveCount(3)
  await expect(page.getByRole("link", { name: "Gestionar vehículos" })).toHaveAttribute("href", "/vehicles")
  await expect(page.getByText("Vencido", { exact: true })).toBeVisible()
  await expect(page.getByText("Hoy", { exact: true })).toBeVisible()
  await expect(page.getByText("Próximo", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Mostrar 2 más" })).toBeVisible()
  await page.getByRole("button", { name: "Mostrar 2 más" }).click()
  await expect(page.getByText("Programado", { exact: true })).toHaveCount(2)
  await expect(page.getByRole("link", { name: /Abrir mantenimientos del vehículo/ })).toHaveCount(5)
  await expect(page.getByText("Gasto total", { exact: true })).toBeVisible()
  await expect(page.getByText("Próximos 30 días", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: "Ver Todos" })).toHaveCount(0)
})

test("the authenticated shell stays continuous from Dashboard through vehicle Maintenance", async ({
  page,
  request,
}) => {
  await resetControlledServices(request, "success", "success", "populated")
  await page.setViewportSize({ width: 1440, height: 900 })
  await loginWithPassword(page)

  await page.getByRole("button", { name: "Expandir navegación" }).click()
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Vehículos", exact: true })
    .click()

  await expect(page).toHaveURL(/\/vehicles$/)
  await expect(page.getByRole("heading", { name: "Mis Vehículos" })).toBeVisible()
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.getByRole("contentinfo")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Vehículos" })
  ).toHaveAttribute("aria-current", "page")

  await page.getByRole("link", { name: "Ver Mantenimientos" }).first().click()

  await expect(page).toHaveURL(/\/vehicles\/vehicle-1\/maintenance$/)
  await expect(page.getByRole("heading", { name: "Historial de Mantenimiento" })).toBeVisible()
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.getByRole("contentinfo")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Vehículos" })
  ).toHaveAttribute("aria-current", "page")
  const accountNavigation = page.getByRole("navigation", { name: "Cuenta y privacidad" })
  await expect(accountNavigation.getByRole("link", { name: "Privacidad", exact: true })).toHaveAttribute(
    "href",
    "/privacidad"
  )
  await expect(accountNavigation.getByRole("button", { name: "Configurar cookies" })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await accountNavigation.getByRole("button", { name: "Configurar cookies" }).click()
  await expect(page.getByRole("heading", { name: "Preferencias de privacidad" })).toBeVisible()
  await page.keyboard.press("Escape")

  await page.reload()
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByRole("heading", { name: "Historial de Mantenimiento" })).toBeVisible()

  await page.setViewportSize({ width: 320, height: 700 })
  await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))
    .toBe(false)
})

test("only explicitly registered authenticated product routes use the application shell", async ({ page, request }) => {
  await resetControlledServices(request)

  await page.goto("/")
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0)
  await page.goto("/auth/login")
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0)
  await page.goto("/auth/signup")
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0)
  await page.goto("/privacidad")
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0)

  await loginWithPassword(page)
  await page.getByRole("button", { name: "Expandir navegación" }).click()
  await page.getByRole("link", { name: "Privacidad", exact: true }).click()

  await expect(page).toHaveURL(/\/privacidad$/)
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible()
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.getByRole("contentinfo")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Política de Privacidad y Cookies" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Privacidad", exact: true })).toHaveAttribute("aria-current", "page")
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")

  await page.reload()
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByRole("link", { name: "Privacidad", exact: true })).toHaveAttribute("aria-current", "page")

  await page.setViewportSize({ width: 320, height: 700 })
  await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))
    .toBe(false)

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.getByRole("link", { name: "Dashboard", exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toHaveAttribute("aria-current", "page")
  await expect(page.getByRole("link", { name: "Privacidad", exact: true })).not.toHaveAttribute("aria-current", "page")
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test("external session loss keeps the public Privacy policy visible", async ({ page, request, context }) => {
  await resetControlledServices(request)
  await loginWithPassword(page)
  const privacyPage = await context.newPage()
  await privacyPage.goto("/privacidad")

  await expect(privacyPage.getByRole("navigation", { name: "Navegación principal" })).toBeVisible()

  await page.getByRole("button", { name: "Cerrar sesión" }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)

  await expect(privacyPage).toHaveURL(/\/privacidad$/)
  await expect(privacyPage.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0)
  await expect(privacyPage.getByRole("contentinfo")).toBeVisible()
  await expect(privacyPage.getByRole("heading", { name: "Política de Privacidad y Cookies" })).toBeVisible()
})

test("explicit logout from Privacy keeps the established login destination", async ({ page, request }) => {
  await resetControlledServices(request)
  await loginWithPassword(page, "/privacidad")

  await page.getByRole("button", { name: "Cerrar sesión" }).click()

  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0)
})

test("rail preference persists and the 320px dashboard has no horizontal overflow", async ({ page, request }) => {
  await resetControlledServices(request)
  await loginWithPassword(page)

  const toggle = page.getByRole("button", { name: "Expandir navegación" })
  await toggle.click()
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")
  await page.reload()
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toHaveAttribute("aria-expanded", "true")

  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Contraer navegación" })).toBeHidden()

  await page.setViewportSize({ width: 320, height: 700 })
  await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))
    .toBe(false)
})

test("mobile navigation is modal and the dashboard keeps the agreed content order", async ({ page, request }) => {
  await resetControlledServices(request, "success", "success", "populated")
  await page.setViewportSize({ width: 390, height: 844 })
  await loginWithPassword(page)
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible()

  const headings = await page.locator("#vehicles-heading, #pending-heading, #history-heading").allTextContents()
  expect(headings.slice(0, 3)).toEqual(["Mis vehículos", "Mantenimientos pendientes", "Historial de mantenimiento"])

  const trigger = page.getByRole("button", { name: "Abrir navegación" })
  await trigger.click()
  await expect(page.getByRole("dialog", { name: "Navegación de Keepel" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog", { name: "Navegación de Keepel" })).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test("mobile navigation closes on Vehicles and keeps private loading inside the shell", async ({ page, request }) => {
  await resetControlledServices(request, "success", "success", "populated", 800)
  await page.setViewportSize({ width: 320, height: 700 })
  await loginWithPassword(page)

  await page.getByRole("button", { name: "Abrir navegación" }).click()
  const drawer = page.getByRole("dialog", { name: "Navegación de Keepel" })
  await expect(drawer.getByRole("link", { name: "Privacidad", exact: true })).toBeVisible()
  await expect(drawer.getByRole("button", { name: "Configurar cookies" })).toBeVisible()
  await drawer.getByRole("button", { name: "Configurar cookies" }).click()
  await expect(drawer).toHaveCount(0)
  const preferences = page.getByRole("dialog", { name: "Preferencias de privacidad" })
  await expect(preferences).toHaveCount(1)
  await expect(preferences).toBeVisible()
  expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true)
  await preferences.getByRole("button", { name: "Usar solo necesarias" }).click()
  await expect(preferences).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeFocused()
  await page.getByRole("button", { name: "Abrir navegación" }).click()

  const reopenedDrawer = page.getByRole("dialog", { name: "Navegación de Keepel" })
  const navigation = reopenedDrawer.getByRole("link", { name: "Vehículos", exact: true }).click()

  await expect(page).toHaveURL(/\/vehicles$/)
  await expect(reopenedDrawer).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible()
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.getByRole("status", { name: "Cargando vehículos" })).toBeVisible()
  await navigation
  await expect(page.getByRole("heading", { name: "Mis Vehículos" })).toBeVisible()
  const maintenanceNavigation = page.getByRole("link", { name: "Ver Mantenimientos" }).first().click()
  await expect(page).toHaveURL(/\/vehicles\/vehicle-1\/maintenance$/)
  await expect(page.getByRole("status", { name: "Cargando detalles del vehículo" })).toBeVisible()
  await maintenanceNavigation
  await expect(page.getByRole("heading", { name: "Historial de Mantenimiento" })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))
    .toBe(false)
})

test("maintenance creation follows zero, one, and multiple vehicle context", async ({ page, request }) => {
  await resetControlledServices(request)
  await loginWithPassword(page)
  await expect(page.getByRole("link", { name: "Añadir mantenimiento" })).toHaveAttribute("href", "/vehicles")

  await resetControlledServices(request, "success", "success", "one-vehicle")
  await loginWithPassword(page)
  await page.getByRole("button", { name: "Añadir mantenimiento" }).click()
  await expect(page.getByRole("dialog", { name: "Agregar Mantenimiento" })).toBeVisible()
  await page.keyboard.press("Escape")

  await resetControlledServices(request, "success", "success", "populated")
  await loginWithPassword(page)
  await page.getByRole("button", { name: "Añadir mantenimiento" }).click()
  await expect(page.getByRole("dialog", { name: "Selecciona un vehículo" })).toBeVisible()
  await page.getByRole("button", { name: /Toyota Corolla/ }).click()
  await expect(page.getByRole("dialog", { name: "Agregar Mantenimiento" })).toBeVisible()
})
