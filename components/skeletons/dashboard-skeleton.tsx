import { Skeleton } from "@/components/ui/skeleton"

function PanelSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 ${className}`}>
      <Skeleton className="h-6 w-52" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }, (_, index) => `dashboard-skeleton-row-${index + 1}`).map((key) => (
          <div key={key} className="rounded-xl border border-[var(--shell-border)] p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div aria-label="Cargando dashboard" className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-48" />
      <Skeleton className="mt-3 mb-8 h-4 w-72 max-w-full" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)]">
        <PanelSkeleton className="lg:col-start-1 lg:row-start-1" />
        <PanelSkeleton rows={4} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
        <PanelSkeleton rows={5} className="lg:col-start-1 lg:row-start-2" />
      </div>
    </div>
  )
}
