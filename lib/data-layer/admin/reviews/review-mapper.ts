import type { Review } from "@prisma/client"
import type { AdminReview } from "@/lib/admin-reviews-data"

export function mapReviewToAdminReview(review: Review): AdminReview {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating,
    date: review.date.toISOString(),
    title: review.title,
    body: review.body,
    isActive: review.isActive,
    isDeleted: review.isDeleted,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }
}

export function mapReviewsToAdminReviews(reviews: Review[]): AdminReview[] {
  return reviews.map(mapReviewToAdminReview)
}
