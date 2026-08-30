"use client"

import * as React from "react"
import { StarIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import { ReviewDeleteDialog } from "@/components/admin/reviews/review-delete-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import type { Review } from "@/lib/data"

export function ReviewModerator() {
  const { reviews } = useAdminStore()
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState<number | "all">("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const [deletingReview, setDeletingReview] = React.useState<Review | null>(null)

  // Statistics
  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1)
  const fiveStarsCount = reviews.filter((r) => r.rating === 5).length
  const fourStarsCount = reviews.filter((r) => r.rating === 4).length

  const filtered = React.useMemo(() => {
    let list = [...reviews]

    if (ratingFilter !== "all") {
      list = list.filter((r) => r.rating === ratingFilter)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q)
      )
    }

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [reviews, ratingFilter, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))
  const paginatedReviews = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Average Rating</span>
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
              <StarIcon className="size-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold">{averageRating}</span>
            <span className="text-xs text-muted-foreground">/ 5.0 rating</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Based on {reviews.length} customer reviews</p>
        </Card>

        <Card className="border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">5-Star Verified</span>
            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10">
              {Math.round((fiveStarsCount / (reviews.length || 1)) * 100)}%
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold">{fiveStarsCount}</span>
            <span className="text-xs text-muted-foreground">reviews</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Flawless laser cut &amp; powder coat</p>
        </Card>

        <Card className="border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">4-Star Reviews</span>
            <Badge variant="secondary" className="text-[10px]">
              {fourStarsCount} reviews
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold">{fourStarsCount}</span>
            <span className="text-xs text-muted-foreground">reviews</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Feedback on cord lengths &amp; sizing</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search reviews by name or text…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase">
            Rating:
          </span>
          <button
            type="button"
            onClick={() => {
              setRatingFilter("all")
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              ratingFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setRatingFilter(5)
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              ratingFilter === 5
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            5 Stars ({fiveStarsCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setRatingFilter(4)
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              ratingFilter === 4
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            4 Stars ({fourStarsCount})
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => {
            const initials = review.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)

            return (
              <Card
                key={`${review.name}-${review.date}`}
                className="flex flex-col justify-between border bg-card p-4 shadow-xs"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs text-foreground mt-1">
                    &ldquo;{review.title}&rdquo;
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {review.body}
                  </p>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                      {initials}
                    </span>
                    <span className="text-xs font-medium text-foreground">{review.name}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDeletingReview(review)}
                    title="Delete review"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full rounded-lg border bg-card p-12 text-center text-xs text-muted-foreground">
            No customer reviews found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="reviews"
        />
      </div>

      <ReviewDeleteDialog
        open={!!deletingReview}
        onOpenChange={(open) => !open && setDeletingReview(null)}
        review={deletingReview}
      />
    </div>
  )
}
