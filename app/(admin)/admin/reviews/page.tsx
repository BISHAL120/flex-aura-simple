import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ReviewModerator } from "@/components/admin/reviews/review-moderator"
import { getAllReviews } from "@/lib/data-layer/admin/reviews/review-data-layer"
import { mapReviewsToAdminReviews } from "@/lib/data-layer/admin/reviews/review-mapper"

export const metadata: Metadata = {
  title: "Customer Reviews — Flex Aura Admin",
  description: "Create, edit, moderate, and delete customer reviews shown on the storefront.",
}

const VALID_PAGE_SIZES = [6, 12, 24]
const DEFAULT_PAGE_SIZE = 6

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = (params?.search || "").trim()
  const deleted = params?.deleted === "1"
  const activeFilter = params?.filter === "active"
  const rawRating = params?.rating
  const rating: number | "all" =
    rawRating === "5" || rawRating === "4" || rawRating === "3"
      ? Number(rawRating)
      : "all"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const result = await getAllReviews(
    page,
    pageSize,
    search,
    rating,
    deleted,
    activeFilter
  )
  const reviews = mapReviewsToAdminReviews(result.reviews)

  // If the requested page is out of range, send the user back to a valid page.
  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const redirectParams = new URLSearchParams()
    if (search) redirectParams.set("search", search)
    if (deleted) redirectParams.set("deleted", "1")
    if (activeFilter) redirectParams.set("filter", "active")
    if (rating !== "all") redirectParams.set("rating", String(rating))
    if (pageSize !== DEFAULT_PAGE_SIZE) redirectParams.set("per_page", String(pageSize))
    redirectParams.set("page", "1")
    redirect(`/admin/reviews?${redirectParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Customer Reviews &amp; Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Create and manage the customer testimonials shown on the storefront.
        </p>
      </div>

      <ReviewModerator
        reviews={reviews}
        stats={result.stats}
        counts={result.counts}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        search={search}
        rating={rating}
        deletedFilter={deleted ? "deleted" : activeFilter ? "active" : "all"}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
