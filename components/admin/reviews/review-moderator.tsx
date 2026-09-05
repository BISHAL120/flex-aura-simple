"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditIcon, PlusIcon, SearchIcon, StarIcon, Trash2Icon, Loader2Icon, RotateCcwIcon, TrashIcon, EyeOffIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ConfirmDeleteDialog } from "@/components/admin/common/confirm-delete-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import type { AdminReview, ReviewStats } from "@/lib/admin-reviews-data"
import {
  deleteReview,
  restoreReview,
  permanentDeleteReview,
  patchReview,
} from "@/lib/data-layer/admin/reviews/review-actions"
import { showError, showSuccess } from "@/lib/toast"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 6

type DeletedFilter = "all" | "active" | "deleted"

interface ReviewModeratorProps {
  reviews: AdminReview[]
  stats: ReviewStats
  counts: { total: number; active: number; deleted: number }
  total: number
  totalPages: number
  search: string
  rating: number | "all"
  deletedFilter: DeletedFilter
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  rating: number | "all"
  deletedFilter: DeletedFilter
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.rating !== "all") params.set("rating", String(state.rating))
  if (state.deletedFilter === "deleted") params.set("deleted", "1")
  if (state.deletedFilter === "active") params.set("filter", "active")
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/reviews?${qs}` : "/admin/reviews"
}

export function ReviewModerator({
  reviews,
  stats,
  counts,
  total,
  totalPages,
  search,
  rating,
  deletedFilter,
  page,
  pageSize,
}: ReviewModeratorProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState(search)
  const searchFocusedRef = React.useRef(false)
  const committedRef = React.useRef<CommittedState>({ search, rating, deletedFilter, page, pageSize })
  const pendingSizeRef = React.useRef<number | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [deletingReview, setDeletingReview] = React.useState<AdminReview | null>(null)
  const [permanentDelete, setPermanentDelete] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  React.useEffect(() => {
    committedRef.current = { search, rating, deletedFilter, page, pageSize }
  }, [search, rating, deletedFilter, page, pageSize])

  React.useEffect(() => {
    if (searchFocusedRef.current) return
    setSearchInput(search)
  }, [search])

  const navigate = React.useCallback(
    (overrides: Partial<CommittedState>) => {
      const next = { ...committedRef.current, ...overrides }
      committedRef.current = next
      router.push(buildQuery(next), { scroll: false })
    },
    [router]
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next !== committedRef.current.search) {
        navigate({ search: next, page: 1 })
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, navigate])

  const handleSearchBlur = () => {
    searchFocusedRef.current = false
    const next = searchInput.trim()
    if (next !== committedRef.current.search) navigate({ search: next, page: 1 })
  }
  const handleSearchFocus = () => {
    searchFocusedRef.current = true
  }

  function handleRatingChange(next: number | "all") {
    navigate({ rating: next, page: 1 })
  }

  function handleDeletedFilterChange(next: DeletedFilter) {
    navigate({ deletedFilter: next, rating: "all", page: 1 })
  }

  function handlePageChange(nextPage: number) {
    const size = pendingSizeRef.current
    pendingSizeRef.current = null
    navigate(size !== null ? { pageSize: size, page: nextPage } : { page: nextPage })
  }
  function handlePageSizeChange(nextSize: number) {
    pendingSizeRef.current = nextSize
  }

  async function handleToggleActive(review: AdminReview) {
    if (busyId) return
    setBusyId(review.id)
    try {
      await patchReview(review.id, { isActive: !review.isActive })
      showSuccess({
        title: review.isActive ? "Review hidden" : "Review published",
        message: `"${review.title}" is now ${review.isActive ? "inactive" : "active"} on the storefront.`,
      })
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to update review" })
    } finally {
      setBusyId(null)
    }
  }

  async function handleRestore(review: AdminReview) {
    if (busyId) return
    setBusyId(review.id)
    try {
      await restoreReview(review.id)
      showSuccess({ title: "Review restored", message: `"${review.title}" has been restored.` })
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to restore review" })
    } finally {
      setBusyId(null)
    }
  }

  async function handlePermanentDelete(review: AdminReview) {
    if (busyId) return
    setBusyId(review.id)
    try {
      await permanentDeleteReview(review.id)
      showSuccess({ title: "Review permanently deleted", message: `"${review.title}" was removed.` })
      setDeletingReview(null)
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to permanently delete review" })
    } finally {
      setBusyId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingReview || deleteLoading) return
    if (permanentDelete) {
      await handlePermanentDelete(deletingReview)
      return
    }
    setDeleteLoading(true)
    try {
      await deleteReview(deletingReview.id)
      showSuccess({ title: "Review deleted", message: `"${deletingReview.title}" was moved to trash.` })
      setDeletingReview(null)
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to delete review" })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Average Rating</span>
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
              <StarIcon className="size-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 5.0 rating</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Based on {counts.active} published customer reviews
          </p>
        </Card>

        <Card className="border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">5-Star Reviews</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-[10px] text-emerald-600">
              {counts.active > 0 ? Math.round((stats.fiveStarsCount / counts.active) * 100) : 0}%
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold">{stats.fiveStarsCount}</span>
            <span className="text-xs text-muted-foreground">reviews</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Flawless laser cut &amp; powder coat</p>
        </Card>

        <Card className="border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">4-Star Reviews</span>
            <Badge variant="secondary" className="text-[10px]">
              {stats.fourStarsCount} reviews
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold">{stats.fourStarsCount}</span>
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search reviews by name or text…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase text-muted-foreground">Status:</span>
          <button
            type="button"
            onClick={() => handleDeletedFilterChange("all")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              deletedFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => handleDeletedFilterChange("active")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              deletedFilter === "active" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Published ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => handleDeletedFilterChange("deleted")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              deletedFilter === "deleted" ? "bg-destructive text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Deleted ({counts.deleted})
          </button>

          {deletedFilter !== "deleted" && (
            <>
              <span className="mx-1 text-[11px] font-semibold uppercase text-muted-foreground">Rating:</span>
              <button
                type="button"
                onClick={() => handleRatingChange("all")}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  rating === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {[5, 4].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRatingChange(r)}
                  className={`rounded-full px-3 py-1 font-medium transition-colors ${
                    rating === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {r} Stars
                </button>
              ))}
            </>
          )}

          <Button
            size="sm"
            render={<Link href="/admin/reviews/new" />}
            nativeButton={false}
            className="ml-2 h-9 gap-1.5 text-xs"
          >
            <PlusIcon className="size-4" />
            <span>Add Review</span>
          </Button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const initials = review.name
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .slice(0, 2)

            return (
              <Card
                key={review.id}
                className="flex flex-col justify-between border bg-card p-4 shadow-xs"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {!review.isActive && (
                        <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-1 text-xs font-semibold text-foreground">
                    &ldquo;{review.title}&rdquo;
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{review.body}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                      {initials}
                    </span>
                    <span className="text-xs font-medium text-foreground">{review.name}</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {deletedFilter === "deleted" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRestore(review)}
                          disabled={busyId === review.id}
                          title="Restore review"
                        >
                          {busyId === review.id ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <RotateCcwIcon className="size-3.5 text-muted-foreground hover:text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setPermanentDelete(true)
                            setDeletingReview(review)
                          }}
                          title="Permanently delete"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleToggleActive(review)}
                          disabled={busyId !== null}
                          title={review.isActive ? "Hide review" : "Publish review"}
                        >
                          {busyId === review.id ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <EyeOffIcon className="size-3.5 text-muted-foreground hover:text-amber-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/admin/reviews/${review.id}/edit`} />}
                          nativeButton={false}
                          title="Edit review"
                        >
                          <EditIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setPermanentDelete(false)
                            setDeletingReview(review)
                          }}
                          title="Delete review"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
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
      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemName="reviews"
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deletingReview}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingReview(null)
            setPermanentDelete(false)
          }
        }}
        title={permanentDelete ? "Permanently Delete Review?" : "Delete Customer Review?"}
        description={
          permanentDelete ? (
            <>
              This will permanently remove the review from{" "}
              <strong className="text-foreground">{deletingReview?.name}</strong> (
              &ldquo;{deletingReview?.title}&rdquo;). This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to move the review from{" "}
              <strong className="text-foreground">{deletingReview?.name}</strong> to trash? It will
              no longer be visible on the storefront. You can restore it later from the Deleted tab.
            </>
          )
        }
        confirmLabel={permanentDelete ? "Permanently Delete" : "Delete Review"}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
