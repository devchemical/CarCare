import { isIP } from "node:net"

const FALLBACK_IP = "127.0.0.1"
const MAX_HEADER_LENGTH = 128

function normalizeIp(value: string | null | undefined): string | null {
  const candidate = value?.trim()

  if (!candidate || candidate.length > MAX_HEADER_LENGTH || isIP(candidate) === 0) {
    return null
  }

  return candidate
}

export function readClientIp(headersList: Pick<Headers, "get">): string {
  const cloudflareIp = normalizeIp(headersList.get("cf-connecting-ip"))

  if (cloudflareIp) {
    return cloudflareIp
  }

  const forwardedIp = normalizeIp(headersList.get("x-forwarded-for")?.split(",")[0])

  if (forwardedIp) {
    return forwardedIp
  }

  return normalizeIp(headersList.get("x-real-ip")) ?? FALLBACK_IP
}
