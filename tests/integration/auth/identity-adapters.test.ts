import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HeaderUserIdentity } from "@/components/layout/header-user-identity"
import type { CurrentUser, UserId } from "@/lib/auth/contracts"

const currentUser: CurrentUser = {
  id: "user-1" as UserId,
  email: "driver@example.com",
  displayName: "Ada Driver",
}

describe("auth identity adapters", () => {
  it("renders email and visible name from the server-projected CurrentUser", () => {
    const markup = renderToStaticMarkup(createElement(HeaderUserIdentity, { user: currentUser }))

    expect(markup).toContain("Ada Driver")
    expect(markup).toContain("driver@example.com")
  })
})
