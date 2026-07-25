import "server-only"

/* eslint-disable no-console -- Safe server diagnostics are required until centralized observability is available. */

import { randomUUID } from "node:crypto"
import type { AuthUnavailableStage } from "@/lib/auth/contracts"

export function reportAuthUnavailable(stage: AuthUnavailableStage): string {
  const reference = randomUUID()

  console.error("Authentication temporarily unavailable.", { reference, stage })

  return reference
}
