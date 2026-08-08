"use client"

import * as React from "react"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import { ReviewCard } from "@/components/site/review-card"
import { Button } from "@/components/ui/button"
import { reviews } from "@/lib/data"

const INITIAL_COUNT = 6
const INCREMENT = 4

export function Reviews() {
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_COUNT)

  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  return (
    <section aria-labelledby="reviews-heading">
      <Container className="flex flex-col items-center gap-8">
        <SectionHeading
          eyebrow="Reviews"
          title="What our customers say"
          description="Real feedback from real shoppers — over 20,000 happy customers and counting."
        />
        <div
          id="reviews-list"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleReviews.map((review) => (
            <ReviewCard key={`${review.name}-${review.date}`} review={review} />
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
      </Container>
    </section>
  )
}
