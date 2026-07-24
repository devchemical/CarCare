import "server-only"

import type { AnonymousAnalyticsEvent } from "./events"

export interface AnonymousAnalyticsTransport {
  track(event: AnonymousAnalyticsEvent): Promise<void>
}

function buildTrackUrl(apiUrl: string): string | null {
  try {
    const normalizedBase = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`
    return new URL("track", normalizedBase).toString()
  } catch {
    return null
  }
}

export function createOpenPanelServerAdapter(
  configuration: {
    apiUrl: string | undefined
    clientId: string | undefined
    clientSecret: string | undefined
  } = {
    apiUrl: process.env.OPENPANEL_API_URL,
    clientId: process.env.OPENPANEL_SERVER_CLIENT_ID,
    clientSecret: process.env.OPENPANEL_SERVER_CLIENT_SECRET,
  }
): AnonymousAnalyticsTransport | null {
  const trackUrl = configuration.apiUrl ? buildTrackUrl(configuration.apiUrl) : null
  const clientId = configuration.clientId
  const clientSecret = configuration.clientSecret

  if (!trackUrl || !clientId || !clientSecret) {
    return null
  }

  return {
    async track(event) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)

      try {
        const response = await fetch(trackUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "openpanel-client-id": clientId,
            "openpanel-client-secret": clientSecret,
          },
          body: JSON.stringify({
            type: "track",
            payload: { name: event },
          }),
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`OpenPanel rejected the event with status ${response.status}.`)
        }
      } catch {
        // Analytics is best-effort and must never affect product behavior.
      } finally {
        clearTimeout(timeout)
      }
    },
  }
}
