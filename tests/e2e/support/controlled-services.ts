/* eslint-disable no-console -- Controlled E2E service reports startup and request failures. */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import {
  APP_URL,
  CONTROLLED_SERVICES_URL,
  type ControlledDashboardScenario,
  type ControlledOAuthMode,
  type ControlledRateLimitMode,
} from "./controlled-services-config"

const controlledServicesUrl = new URL(CONTROLLED_SERVICES_URL)
const HOST = controlledServicesUrl.hostname
const PORT = Number(controlledServicesUrl.port)
const PASSWORD = "correct-horse"

interface ControlledUser {
  id: string
  email: string
  app_metadata: { provider: "email"; providers: ["email"] }
  aud: "authenticated"
  confirmed_at?: string
  created_at: string
  email_confirmed_at?: string
  identities: []
  is_anonymous: false
  role: "authenticated"
  updated_at: string
  user_metadata: { full_name: string }
}

const sessions = new Map<string, ControlledUser>()
const analyticsEvents: unknown[] = []
let sessionSequence = 0
let oauthMode: ControlledOAuthMode = "success"
let rateLimitMode: ControlledRateLimitMode = "success"
let dashboardScenario: ControlledDashboardScenario = "empty"
let privateViewDelayMs = 0

const dashboardVehicles = [
  {
    id: "vehicle-1",
    user_id: "00000000-0000-4000-8000-000000000051",
    make: "Toyota",
    model: "Corolla",
    year: 2021,
    license_plate: "1234 KPL",
    mileage: 48200,
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "vehicle-2",
    user_id: "00000000-0000-4000-8000-000000000051",
    make: "Seat",
    model: "León",
    year: 2020,
    license_plate: "5678 KPL",
    mileage: 63500,
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "vehicle-3",
    user_id: "00000000-0000-4000-8000-000000000051",
    make: "Renault",
    model: "Clio",
    year: 2019,
    license_plate: "9012 KPL",
    mileage: 72100,
    created_at: "2026-02-01T00:00:00.000Z",
    updated_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "vehicle-4",
    user_id: "00000000-0000-4000-8000-000000000051",
    make: "Ford",
    model: "Focus",
    year: 2018,
    license_plate: "3456 KPL",
    mileage: 88400,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
]

const dashboardMaintenance = Array.from({ length: 6 }, (_, index) => {
  const vehicle = dashboardVehicles[index % 2]
  return {
    id: `maintenance-${index + 1}`,
    vehicle_id: vehicle.id,
    user_id: vehicle.user_id,
    type: index % 2 === 0 ? "oil_change" : "brake_service",
    cost: 75 + index * 10,
    service_date: `2026-07-${String(31 - index).padStart(2, "0")}`,
    mileage: vehicle.mileage - 1000,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    vehicles: { make: vehicle.make, model: vehicle.model, year: vehicle.year },
  }
})

const dashboardScheduled = [
  {
    id: "scheduled-overdue",
    vehicle_id: "vehicle-1",
    type: "oil_change",
    scheduled_date: "2026-08-01",
    scheduled_mileage: 50000,
  },
  {
    id: "scheduled-today",
    vehicle_id: "vehicle-2",
    type: "brake_service",
    scheduled_date: "2026-08-04",
    scheduled_mileage: 65000,
  },
  { id: "scheduled-upcoming", vehicle_id: "vehicle-1", type: "battery", scheduled_date: "2026-08-20" },
  { id: "scheduled-later", vehicle_id: "vehicle-2", type: "transmission", scheduled_date: "2026-10-01" },
  { id: "scheduled-undated", vehicle_id: "vehicle-1", type: "tire_rotation", scheduled_mileage: 52000 },
].map((service) => {
  const vehicle = dashboardVehicles.find(({ id }) => id === service.vehicle_id)
  if (!vehicle) throw new Error(`Missing controlled vehicle ${service.vehicle_id}`)
  return {
    ...service,
    user_id: vehicle.user_id,
    status: "pending",
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    vehicles: { make: vehicle.make, model: vehicle.model, year: vehicle.year, license_plate: vehicle.license_plate },
  }
})

function controlledDashboardRows(table: string) {
  if (dashboardScenario === "empty") return []
  if (table === "vehicles")
    return dashboardScenario === "one-vehicle" ? dashboardVehicles.slice(0, 1) : dashboardVehicles
  if (dashboardScenario === "one-vehicle") return []
  if (table === "maintenance_records") return dashboardMaintenance
  if (table === "scheduled_services") return dashboardScheduled
  return []
}

function corsHeaders() {
  return {
    "access-control-allow-headers":
      "accept-profile, apikey, authorization, content-profile, content-type, prefer, x-client-info, x-supabase-api-version",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "access-control-allow-origin": APP_URL,
    "access-control-expose-headers": "content-range",
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  response.writeHead(status, {
    ...corsHeaders(),
    "content-type": "application/json",
    ...headers,
  })
  response.end(status === 204 ? undefined : JSON.stringify(body))
}

function sendRedirect(response: ServerResponse, destination: string) {
  response.writeHead(302, { ...corsHeaders(), location: destination })
  response.end()
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return null
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

function encodeJwtPart(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function createAccessToken(user: ControlledUser) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const header = encodeJwtPart({ alg: "HS256", typ: "JWT" })
  const payload = encodeJwtPart({
    aud: "authenticated",
    email: user.email,
    exp: issuedAt + 60 * 60,
    iat: issuedAt,
    role: "authenticated",
    sub: user.id,
  })

  return `${header}.${payload}.controlled-signature`
}

function createUser(email: string, fullName = "Ada Driver"): ControlledUser {
  return {
    id: "00000000-0000-4000-8000-000000000051",
    email,
    app_metadata: { provider: "email", providers: ["email"] },
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    identities: [],
    is_anonymous: false,
    role: "authenticated",
    updated_at: "2026-01-01T00:00:00.000Z",
    user_metadata: { full_name: fullName },
  }
}

function createSession(user: ControlledUser) {
  const accessToken = createAccessToken(user)
  const refreshToken = `controlled-refresh-${++sessionSequence}`
  const authenticatedUser = {
    ...user,
    confirmed_at: "2026-01-01T00:00:00.000Z",
    email_confirmed_at: "2026-01-01T00:00:00.000Z",
  }
  sessions.set(accessToken, authenticatedUser)

  return {
    access_token: accessToken,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: authenticatedUser,
  }
}

function readBearerToken(request: IncomingMessage) {
  const authorization = request.headers.authorization
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null
}

function handleRedis(body: unknown) {
  if (!Array.isArray(body)) {
    return { result: 1 }
  }

  const command = String(body[0] ?? "").toLowerCase()
  return command === "evalsha" || command === "eval" ? { result: [100, 100] } : { result: 1 }
}

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? "/", `http://${HOST}:${PORT}`)

  if (request.method === "OPTIONS") {
    sendJson(response, 204, null)
    return
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { ok: true })
    return
  }

  if (request.method === "POST" && url.pathname === "/__test__/reset") {
    const body = (await readJson(request)) as {
      oauthMode?: unknown
      rateLimitMode?: unknown
      dashboardScenario?: unknown
      privateViewDelayMs?: unknown
    } | null
    sessions.clear()
    analyticsEvents.length = 0
    sessionSequence = 0
    oauthMode =
      body?.oauthMode === "cancel" || body?.oauthMode === "provider_error" || body?.oauthMode === "exchange_error"
        ? body.oauthMode
        : "success"
    rateLimitMode = body?.rateLimitMode === "error" ? "error" : "success"
    dashboardScenario =
      body?.dashboardScenario === "one-vehicle" || body?.dashboardScenario === "populated"
        ? body.dashboardScenario
        : "empty"
    privateViewDelayMs =
      typeof body?.privateViewDelayMs === "number" &&
      Number.isInteger(body.privateViewDelayMs) &&
      body.privateViewDelayMs >= 0 &&
      body.privateViewDelayMs <= 2_000
        ? body.privateViewDelayMs
        : 0
    sendJson(response, 200, { ok: true })
    return
  }

  if (request.method === "GET" && url.pathname === "/__test__/analytics") {
    sendJson(response, 200, { events: analyticsEvents })
    return
  }

  if (request.method === "POST" && url.pathname === "/track") {
    const clientId = request.headers["openpanel-client-id"]
    const clientSecret = request.headers["openpanel-client-secret"]

    if (clientId !== "e2e-openpanel-writer" || clientSecret !== "e2e-openpanel-secret") {
      sendJson(response, 401, { message: "Invalid OpenPanel credentials" })
      return
    }

    analyticsEvents.push(await readJson(request))
    sendJson(response, 202, { accepted: true })
    return
  }

  if (request.method === "GET" && url.pathname === "/auth/v1/authorize") {
    const redirectTo = url.searchParams.get("redirect_to")

    if (!redirectTo) {
      sendJson(response, 400, { message: "redirect_to is required" })
      return
    }

    const callbackUrl = new URL(redirectTo)

    if (oauthMode === "cancel") {
      callbackUrl.searchParams.set("error", "access_denied")
      callbackUrl.searchParams.set("error_description", "controlled provider description")
    } else if (oauthMode === "provider_error") {
      callbackUrl.searchParams.set("error", "server_error")
      callbackUrl.searchParams.set("error_description", "controlled-provider-secret")
    } else {
      callbackUrl.searchParams.set("code", "controlled-oauth-code")
    }

    sendRedirect(response, callbackUrl.toString())
    return
  }

  if (request.method === "POST" && url.pathname === "/auth/v1/token") {
    const body = (await readJson(request)) as { email?: unknown; password?: unknown } | null
    const grantType = url.searchParams.get("grant_type")

    if (grantType === "pkce") {
      if (oauthMode === "exchange_error") {
        sendJson(response, 400, {
          code: "bad_oauth_state",
          message: "controlled-provider-secret",
          msg: "controlled-provider-secret",
        })
        return
      }

      sendJson(response, 200, createSession(createUser("driver@keepel.test")))
      return
    }

    if (grantType !== "password" || body?.password !== PASSWORD || typeof body.email !== "string") {
      sendJson(response, 400, {
        code: "invalid_credentials",
        error_code: "invalid_credentials",
        message: "Invalid login credentials",
        msg: "Invalid login credentials",
      })
      return
    }

    sendJson(response, 200, createSession(createUser(body.email)))
    return
  }

  if (request.method === "POST" && url.pathname === "/auth/v1/signup") {
    const body = (await readJson(request)) as { email?: unknown; data?: { full_name?: unknown } } | null

    if (typeof body?.email !== "string") {
      sendJson(response, 400, { code: "validation_failed", message: "Email is required" })
      return
    }

    const fullName = typeof body.data?.full_name === "string" ? body.data.full_name : "Keepel User"
    sendJson(response, 200, {
      ...createUser(body.email, fullName),
      confirmation_sent_at: "2026-01-01T00:00:00.000Z",
    })
    return
  }

  if (request.method === "GET" && url.pathname === "/auth/v1/user") {
    const accessToken = readBearerToken(request)
    const user = accessToken ? sessions.get(accessToken) : null

    if (!user) {
      sendJson(response, 401, {
        code: "session_not_found",
        error_code: "session_not_found",
        message: "Auth session missing!",
        msg: "Auth session missing!",
      })
      return
    }

    sendJson(response, 200, user)
    return
  }

  if (request.method === "GET" && url.pathname.startsWith("/rest/v1/")) {
    if (privateViewDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, privateViewDelayMs))
    }
    const table = url.pathname.slice("/rest/v1/".length)
    const rows = controlledDashboardRows(table)
    const wantsSingleObject = request.headers.accept?.includes("application/vnd.pgrst.object+json")
    sendJson(response, 200, wantsSingleObject ? (rows[0] ?? null) : rows, {
      "content-range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}`,
    })
    return
  }

  if (request.method === "POST" && url.pathname === "/pipeline") {
    if (rateLimitMode === "error") {
      sendJson(response, 503, { message: "Controlled Redis failure" })
      return
    }

    const commands = await readJson(request)
    const results = Array.isArray(commands) ? commands.map(handleRedis) : []
    sendJson(response, 200, results)
    return
  }

  if (request.method === "POST" && url.pathname === "/") {
    if (rateLimitMode === "error") {
      sendJson(response, 503, { message: "Controlled Redis failure" })
      return
    }

    sendJson(response, 200, handleRedis(await readJson(request)))
    return
  }

  sendJson(response, 404, { message: "Not found" })
}

const server = createServer((request, response) => {
  void handleRequest(request, response).catch((error) => {
    console.error(error)
    sendJson(response, 500, { message: "Controlled service failure" })
  })
})

server.listen(PORT, HOST, () => {
  console.log(`Controlled services listening on http://${HOST}:${PORT}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
