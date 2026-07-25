import { describe, expect, it, vi } from "vitest"
import { createSavePrivacyConsent } from "@/lib/privacy/save-consent"
import type { PrivacyConsentChoice, PrivacyConsentState } from "@/lib/privacy/consent"

function consentState(preference: PrivacyConsentChoice): PrivacyConsentState {
  return {
    preference,
    decidedAt: "2026-07-25T12:00:00.000Z",
    policyVersion: "1.0",
  }
}

describe("save privacy consent", () => {
  it("rejects invalid input without persisting or reporting an operational failure", async () => {
    const persistConsent = vi.fn()
    const reportUnexpectedFailure = vi.fn()
    const saveConsent = createSavePrivacyConsent({ persistConsent, reportUnexpectedFailure })

    await expect(saveConsent("invalid-choice")).resolves.toEqual({ status: "error" })
    expect(persistConsent).not.toHaveBeenCalled()
    expect(reportUnexpectedFailure).not.toHaveBeenCalled()
  })

  it.each(["accepted", "rejected"] as const)("returns persisted %s consent", async (choice) => {
    const consent = consentState(choice)
    const persistConsent = vi.fn().mockResolvedValue(consent)
    const saveConsent = createSavePrivacyConsent({ persistConsent, reportUnexpectedFailure: vi.fn() })

    await expect(saveConsent(choice)).resolves.toEqual({ status: "success", consent })
    expect(persistConsent).toHaveBeenCalledOnce()
    expect(persistConsent).toHaveBeenCalledWith(choice)
  })

  it("returns a sanitized error and reports unexpected failures without arguments", async () => {
    const sensitiveFailure = new Error("secret=cookie=user=request")
    const reportUnexpectedFailure = vi.fn()
    const saveConsent = createSavePrivacyConsent({
      persistConsent: vi.fn().mockRejectedValue(sensitiveFailure),
      reportUnexpectedFailure,
    })

    await expect(saveConsent("accepted")).resolves.toEqual({ status: "error" })
    expect(reportUnexpectedFailure).toHaveBeenCalledOnce()
    expect(reportUnexpectedFailure).toHaveBeenCalledWith()
    expect(reportUnexpectedFailure.mock.calls.flat()).not.toContain(sensitiveFailure)
  })
})
