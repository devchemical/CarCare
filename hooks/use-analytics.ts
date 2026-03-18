"use client"

import { useOpenPanel } from "@openpanel/nextjs"
import { useCallback } from "react"

interface TrackEventOptions {
  name: string
  properties?: Record<string, string | number | boolean | null>
}

export function useAnalytics() {
  const op = useOpenPanel()

  const trackEvent = useCallback(
    (options: TrackEventOptions) => {
      op.track(options.name, options.properties)
    },
    [op]
  )

  const trackButtonClick = useCallback(
    (buttonName: string, additionalProps?: Record<string, string | number | boolean | null>) => {
      op.track("button_click", {
        button_name: buttonName,
        ...additionalProps,
      })
    },
    [op]
  )

  const trackPageView = useCallback(
    (pageName: string, additionalProps?: Record<string, string | number | boolean | null>) => {
      op.track("page_view", {
        page: pageName,
        ...additionalProps,
      })
    },
    [op]
  )

  const trackFormSubmit = useCallback(
    (formName: string, additionalProps?: Record<string, string | number | boolean | null>) => {
      op.track("form_submit", {
        form_name: formName,
        ...additionalProps,
      })
    },
    [op]
  )

  const trackVehicleAction = useCallback(
    (action: "add" | "edit" | "delete" | "view", vehicleId?: string) => {
      op.track("vehicle_action", {
        action,
        vehicle_id: vehicleId || null,
      })
    },
    [op]
  )

  const trackMaintenanceAction = useCallback(
    (action: "add" | "edit" | "delete" | "view" | "complete", recordId?: string) => {
      op.track("maintenance_action", {
        action,
        record_id: recordId || null,
      })
    },
    [op]
  )

  const trackAuthAction = useCallback(
    (action: "sign_in" | "sign_out" | "sign_up" | "error", method?: string) => {
      op.track("auth_action", {
        action,
        method: method || null,
      })
    },
    [op]
  )

  const identifyUser = useCallback(
    (userId: string, properties?: Record<string, string | number | boolean>) => {
      op.identify({
        profileId: userId,
        ...properties,
      })
    },
    [op]
  )

  return {
    trackEvent,
    trackButtonClick,
    trackPageView,
    trackFormSubmit,
    trackVehicleAction,
    trackMaintenanceAction,
    trackAuthAction,
    identifyUser,
    op,
  }
}
