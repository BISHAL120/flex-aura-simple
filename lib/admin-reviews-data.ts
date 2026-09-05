/** Admin/UI-facing shape for a review (mirrors the DB record). */
export type AdminReview = {
  id: string
  name: string
  rating: number
  /** ISO date string of when the customer wrote the review. */
  date: string
  title: string
  body: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type ReviewStats = {
  averageRating: number
  fiveStarsCount: number
  fourStarsCount: number
}
