export const ANONYMOUS_ANALYTICS_EVENTS = [
  "auth_login_email_succeeded",
  "auth_login_google_succeeded",
  "auth_logout_succeeded",
] as const

export type AnonymousAnalyticsEvent = (typeof ANONYMOUS_ANALYTICS_EVENTS)[number]
