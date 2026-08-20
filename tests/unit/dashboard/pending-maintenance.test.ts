import { describe, expect, it } from "vitest"
import {
  classifyPendingMaintenance,
  isWithinNextThirtyDays,
  sortPendingMaintenance,
  type PendingMaintenanceInput,
} from "@/lib/dashboard/pending-maintenance"

const TODAY = new Date(2026, 7, 4, 12)

function service(id: string, scheduledDate?: string): PendingMaintenanceInput {
  return { id, scheduled_date: scheduledDate }
}

describe("pending maintenance date presentation", () => {
  it.each([
    ["2026-08-03", "overdue", "Vencido"],
    ["2026-08-04", "today", "Hoy"],
    ["2026-08-05", "upcoming", "Próximo"],
    ["2026-09-03", "upcoming", "Próximo"],
    ["2026-09-04", "scheduled", "Programado"],
    [undefined, "scheduled", "Programado"],
  ] as const)("classifies %s as %s", (scheduledDate, kind, label) => {
    expect(classifyPendingMaintenance(scheduledDate, TODAY)).toEqual({ kind, label })
  })

  it("orders by urgency, then date, with undated records last", () => {
    const values = [
      service("undated"),
      service("later", "2026-10-01"),
      service("today", "2026-08-04"),
      service("overdue-newer", "2026-08-03"),
      service("upcoming", "2026-08-20"),
      service("overdue-older", "2026-07-01"),
    ]

    expect(sortPendingMaintenance(values, TODAY).map(({ id }) => id)).toEqual([
      "overdue-older",
      "overdue-newer",
      "today",
      "upcoming",
      "later",
      "undated",
    ])
  })

  it("counts today and the following 30 calendar days in the dashboard horizon", () => {
    expect(isWithinNextThirtyDays("2026-08-04", TODAY)).toBe(true)
    expect(isWithinNextThirtyDays("2026-09-03", TODAY)).toBe(true)
    expect(isWithinNextThirtyDays("2026-09-04", TODAY)).toBe(false)
    expect(isWithinNextThirtyDays("2026-08-03", TODAY)).toBe(false)
  })
})
