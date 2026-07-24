import "server-only"

import { after } from "next/server"
import { allowsAnonymousAnalytics, type PrivacyConsentState } from "@/lib/privacy/consent"
import { readPrivacyConsent } from "@/lib/privacy/server"
import { createOpenPanelServerAdapter, type AnonymousAnalyticsTransport } from "./openpanel-server-adapter"
import type { AnonymousAnalyticsEvent } from "./events"

interface AnonymousAnalyticsDependencies {
  readConsent(): Promise<PrivacyConsentState>
  schedule(task: () => Promise<void>): void
  transport: AnonymousAnalyticsTransport | null
}

export function createAnonymousAnalyticsRecorder(dependencies: AnonymousAnalyticsDependencies) {
  return async function scheduleAnonymousAnalytics(event: AnonymousAnalyticsEvent): Promise<void> {
    const consent = await dependencies.readConsent()
    const transport = dependencies.transport

    if (!allowsAnonymousAnalytics(consent) || !transport) {
      return
    }

    dependencies.schedule(async () => {
      const currentConsent = await dependencies.readConsent()

      if (allowsAnonymousAnalytics(currentConsent)) {
        await transport.track(event)
      }
    })
  }
}

const recordWithProductionDependencies = createAnonymousAnalyticsRecorder({
  readConsent: readPrivacyConsent,
  schedule(task) {
    after(task)
  },
  transport: createOpenPanelServerAdapter(),
})

export async function recordAnonymousAnalytics(event: AnonymousAnalyticsEvent): Promise<void> {
  try {
    await recordWithProductionDependencies(event)
  } catch {
    // A missing request context or provider failure must never affect the product operation.
  }
}
