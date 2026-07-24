import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const projectRoot = process.cwd()
const sourceRoots = ["app", "components", "contexts", "hooks", "lib"]

function collectSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectSources(path)
    }

    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [path] : []
  })
}

describe("browser analytics contract", () => {
  it("retires browser analytics modules", () => {
    const retiredPaths = [
      "app/actions/analytics.ts",
      "hooks/use-analytics.ts",
      "components/analytics/auth-analytics-adapter.tsx",
      "components/analytics/tracked-button.tsx",
      "components/analytics/index.ts",
    ]

    expect(retiredPaths.filter((path) => existsSync(join(projectRoot, path)))).toEqual([])
  })

  it("keeps OpenPanel and identifying analytics out of client modules", () => {
    const offenders = sourceRoots
      .flatMap((root) => collectSources(join(projectRoot, root)))
      .filter((path) => readFileSync(path, "utf8").startsWith('"use client"'))
      .filter((path) =>
        /@openpanel|useAnalytics|useOpenPanel|OpenPanelComponent|data-track|profileId/.test(readFileSync(path, "utf8"))
      )
      .map((path) => relative(projectRoot, path))

    expect(offenders).toEqual([])
  })
})
