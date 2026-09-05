import { Skeleton } from "@/components/ui/skeleton"

/** Loading placeholder shown while hero slide data streams from the DB. */
export function HeroCarouselSkeleton() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-muted sm:h-[480px] lg:h-[560px]">
      <Skeleton className="h-full w-full rounded-none" />
      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-9 w-3/4 sm:h-12" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
            <Skeleton className="mt-6 h-11 w-44 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
