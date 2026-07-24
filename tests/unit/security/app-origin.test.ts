import { describe, expect, it } from "vitest"
import { resolveAppOrigin } from "@/lib/http/app-origin"

describe("trusted application origin", () => {
  it("requires APP_BASE_URL in production", () => {
    expect(() => resolveAppOrigin("https://attacker.example/auth/google", undefined, "production")).toThrow(
      "APP_BASE_URL is required in production."
    )
  })

  it("requires HTTPS and an origin-only value in production", () => {
    expect(() => resolveAppOrigin("https://request.example", "http://keepel.example", "production")).toThrow()
    expect(() => resolveAppOrigin("https://request.example", "https://keepel.example/path", "production")).toThrow()
  })

  it("uses the configured canonical origin instead of the request host", () => {
    expect(resolveAppOrigin("https://attacker.example/auth/google", "https://keepel.example", "production")).toBe(
      "https://keepel.example"
    )
  })
})
