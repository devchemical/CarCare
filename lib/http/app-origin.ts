export function resolveAppOrigin(
  requestUrl: string,
  configuredOrigin = process.env.APP_BASE_URL,
  environment = process.env.NODE_ENV
): string {
  if (configuredOrigin) {
    const configuredUrl = new URL(configuredOrigin)

    if (
      configuredUrl.username ||
      configuredUrl.password ||
      configuredUrl.pathname !== "/" ||
      configuredUrl.search ||
      configuredUrl.hash
    ) {
      throw new Error("APP_BASE_URL must contain only the public application origin.")
    }

    if (environment === "production" && configuredUrl.protocol !== "https:") {
      throw new Error("APP_BASE_URL must use HTTPS in production.")
    }

    return configuredUrl.origin
  }

  if (environment === "production") {
    throw new Error("APP_BASE_URL is required in production.")
  }

  return new URL(requestUrl).origin
}
