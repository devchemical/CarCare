import { describe, expect, it, vi } from "vitest"
import { createAnonymousAnalyticsRecorder } from "@/lib/analytics/anonymous-analytics"
import { createOpenPanelServerAdapter } from "@/lib/analytics/openpanel-server-adapter"
import type { PrivacyConsentState } from "@/lib/privacy/consent"

const accepted: PrivacyConsentState = {
  preference: "accepted",
  decidedAt: "2026-07-22T12:00:00.000Z",
  policyVersion: "1.0",
}

const rejected: PrivacyConsentState = {
  preference: "rejected",
  decidedAt: "2026-07-22T12:00:00.000Z",
  policyVersion: "1.0",
}

describe("anonymous analytics recorder", () => {
  it("schedules one property-free event only after accepted consent", async () => {
    const tracked: string[] = []
    const scheduled: Array<() => Promise<void>> = []
    const record = createAnonymousAnalyticsRecorder({
      async readConsent() {
        return accepted
      },
      schedule(task) {
        scheduled.push(task)
      },
      transport: {
        async track(event) {
          tracked.push(event)
        },
      },
    })

    await record("auth_login_email_succeeded")
    expect(scheduled).toHaveLength(1)
    await scheduled[0]()
    expect(tracked).toEqual(["auth_login_email_succeeded"])
  })

  it("rechecks consent inside the deferred delivery", async () => {
    const tracked: string[] = []
    const scheduled: Array<() => Promise<void>> = []
    let consent = accepted
    const record = createAnonymousAnalyticsRecorder({
      async readConsent() {
        return consent
      },
      schedule(task) {
        scheduled.push(task)
      },
      transport: {
        async track(event) {
          tracked.push(event)
        },
      },
    })

    await record("auth_login_email_succeeded")
    consent = rejected
    await scheduled[0]()

    expect(tracked).toEqual([])
  })

  it("does nothing without accepted consent or a configured transport", async () => {
    const schedule = vi.fn()
    const rejectedRecorder = createAnonymousAnalyticsRecorder({
      async readConsent() {
        return rejected
      },
      schedule,
      transport: { async track() {} },
    })
    const unconfiguredRecorder = createAnonymousAnalyticsRecorder({
      async readConsent() {
        return accepted
      },
      schedule,
      transport: null,
    })

    await rejectedRecorder("auth_login_email_succeeded")
    await unconfiguredRecorder("auth_login_email_succeeded")

    expect(schedule).not.toHaveBeenCalled()
  })
})

describe("OpenPanel server adapter", () => {
  it("sends only the allowlisted event name and server credentials", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 202 }))
    vi.stubGlobal("fetch", fetchMock)

    try {
      const adapter = createOpenPanelServerAdapter({
        apiUrl: "https://openpanel.example/api",
        clientId: "writer-id",
        clientSecret: "writer-secret",
      })

      await adapter?.track("auth_logout_succeeded")

      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe("https://openpanel.example/api/track")
      expect(init?.headers).toEqual({
        "content-type": "application/json",
        "openpanel-client-id": "writer-id",
        "openpanel-client-secret": "writer-secret",
      })
      expect(JSON.parse(String(init?.body))).toEqual({
        type: "track",
        payload: { name: "auth_logout_succeeded" },
      })
      expect(String(init?.body)).not.toMatch(/profile|properties|email|vehicle|record|referrer|path/i)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
