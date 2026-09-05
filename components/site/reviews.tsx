import * as React from "react"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import { ReviewsGrid } from "@/components/site/reviews-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { getActiveReviews } from "@/lib/data-layer/admin/reviews/review-data-layer"
import { mapReviewsToAdminReviews } from "@/lib/data-layer/admin/reviews/review-mapper"

export async function Reviews() {
  const reviews = mapReviewsToAdminReviews(await getActiveReviews(50))

  return (
    <section aria-labelledby="reviews-heading">
      <Container className="flex flex-col items-center gap-8">
        <SectionHeading
          eyebrow="Reviews"
          title="What our customers say"
          description="Real feedback from real walls — every review is from a delivered Flex Aura piece."
        />
        <React.Suspense
          fallback={
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          }
        >
          <ReviewsGrid reviews={reviews} />
        </React.Suspense>
      </Container>
    </section>
  )
}
