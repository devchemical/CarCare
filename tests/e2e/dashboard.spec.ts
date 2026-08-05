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
