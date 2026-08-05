export type PendingMaintenanceKind = "overdue" | "today" | "upcoming" | "scheduled"

export interface PendingMaintenancePresentation {
  kind: PendingMaintenanceKind
  label: "Vencido" | "Hoy" | "Próximo" | "Programado"
}

export interface PendingMaintenanceInput {
  id: string
  scheduled_date?: string
}

const KIND_ORDER: Record<PendingMaintenanceKind, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
  scheduled: 3,
}

function localDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseLocalDate(value?: string) {
  if (!value) return null
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function classifyPendingMaintenance(
  scheduledDate: string | undefined,
  now = new Date()
): PendingMaintenancePresentation {
  const date = parseLocalDate(scheduledDate)
  if (!date) return { kind: "scheduled", label: "Programado" }

  const today = localDay(now)
  if (date < today) return { kind: "overdue", label: "Vencido" }
  if (date.getTime() === today.getTime()) return { kind: "today", label: "Hoy" }

  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + 30)
  return date <= horizon ? { kind: "upcoming", label: "Próximo" } : { kind: "scheduled", label: "Programado" }
}

export function sortPendingMaintenance<T extends PendingMaintenanceInput>(services: T[], now = new Date()): T[] {
  return services.toSorted((left, right) => {
    const leftKind = classifyPendingMaintenance(left.scheduled_date, now).kind
    const rightKind = classifyPendingMaintenance(right.scheduled_date, now).kind
    const kindDifference = KIND_ORDER[leftKind] - KIND_ORDER[rightKind]
    if (kindDifference !== 0) return kindDifference

    const leftDate = parseLocalDate(left.scheduled_date)?.getTime() ?? Number.POSITIVE_INFINITY
    const rightDate = parseLocalDate(right.scheduled_date)?.getTime() ?? Number.POSITIVE_INFINITY
    return leftDate - rightDate
  })
}

export function isWithinNextThirtyDays(scheduledDate: string | undefined, now = new Date()) {
  const kind = classifyPendingMaintenance(scheduledDate, now).kind
  return kind === "today" || kind === "upcoming"
}
