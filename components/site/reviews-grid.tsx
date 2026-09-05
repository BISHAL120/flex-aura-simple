"use client"

import * as React from "react"

import { ReviewCard } from "@/components/site/review-card"
import { Button } from "@/components/ui/button"
import type { AdminReview } from "@/lib/admin-reviews-data"

const INITIAL_COUNT = 6
const INCREMENT = 4

export function ReviewsGrid({ reviews }: { reviews: AdminReview[] }) {
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_COUNT)

  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        No customer reviews yet — check back soon.
      </div>
    )
  }

  return (
    <>
      <div id="reviews-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {hasMore ? (
        <Button
          variant="outline"
          size="lg"
          aria-controls="reviews-list"
          onClick={() => setVisibleCount((count) => count + INCREMENT)}
        >
          View more reviews
        </Button>
      ) : null}
    </>
  )
}
