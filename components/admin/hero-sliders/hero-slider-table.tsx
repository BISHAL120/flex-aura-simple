"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  Trash2Icon,
  ExternalLinkIcon,
  RotateCcwIcon,
  TrashIcon,
  Loader2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeOffIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataPagination } from "@/components/admin/common/data-pagination"
import {
  deleteHeroSlide,
  restoreHeroSlide,
  permanentDeleteHeroSlide,
  patchHeroSlide,
  moveHeroSlide,
} from "@/lib/data-layer/admin/hero-sliders/hero-slider-actions"
import type { AdminHeroSlide } from "@/lib/admin-hero-sliders-data"
import { showError, showSuccess } from "@/lib/toast"
import { deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"
import { ConfirmDeleteDialog } from "@/components/admin/common/confirm-delete-dialog"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 8

interface HeroSliderTableProps {
  slides: AdminHeroSlide[]
  total: number
  totalPages: number
  activeCount: number
  totalCount: number
  deletedCount: number
  search: string
  filter: "all" | "active" | "deleted"
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  filter: "all" | "active" | "deleted"
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.filter !== "all") params.set("filter", state.filter)
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/hero-sliders?${qs}` : "/admin/hero-sliders"
}

export function HeroSliderTable({
  slides,
  total,
  totalPages,
  activeCount,
  totalCount,
  deletedCount,
  search,
  filter,
  page,
  pageSize,
}: HeroSliderTableProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState(search)
  const searchFocusedRef = React.useRef(false)
  const committedRef = React.useRef<CommittedState>({
    search,
    filter,
    page,
    pageSize,
  })
  const [deletingSlide, setDeletingSlide] = React.useState<AdminHeroSlide | null>(null)
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const pendingSizeRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    committedRef.current = { search, filter, page, pageSize }
  }, [search, filter, page, pageSize])

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
    if (next !== committedRef.current.search) {
      navigate({ search: next, page: 1 })
    }
  }

  const handleSearchFocus = () => {
    searchFocusedRef.current = true
  }

  function handleFilterChange(nextFilter: "all" | "active" | "deleted") {
    navigate({ filter: nextFilter, page: 1 })
  }

  function handlePageChange(nextPage: number) {
    const size = pendingSizeRef.current
    pendingSizeRef.current = null
    navigate(size !== null ? { pageSize: size, page: nextPage } : { page: nextPage })
  }

  function handlePageSizeChange(nextSize: number) {
    pendingSizeRef.current = nextSize
  }

  async function handleToggleActive(slide: AdminHeroSlide) {
    if (busyId) return
    setBusyId(slide.id)
    try {
      await patchHeroSlide(slide.id, { isActive: !slide.isActive })
      showSuccess({
        title: slide.isActive ? "Slide hidden" : "Slide published",
        message: `"${slide.title}" is now ${slide.isActive ? "inactive" : "active"} on the homepage.`,
      })
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update slide status",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleMove(slide: AdminHeroSlide, direction: -1 | 1) {
    if (busyId) return
    setBusyId(slide.id)
    try {
      await moveHeroSlide(slide.id, direction)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to move slide",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleRestore(slide: AdminHeroSlide) {
    if (busyId) return
    setBusyId(slide.id)
    try {
      await restoreHeroSlide(slide.id)
      showSuccess({
        title: "Hero slide restored",
        message: `"${slide.title}" has been restored.`,
      })
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to restore slide",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handlePermanentDelete(slide: AdminHeroSlide) {
    if (busyId) return
    setBusyId(slide.id)
    try {
      await permanentDeleteHeroSlide(slide.id)
      await deleteFirebaseImageSafe(slide.image)
      showSuccess({
        title: "Slide permanently deleted",
        message: `"${slide.title}" has been permanently removed.`,
      })
      setDeletingSlide(null)
      setPermanentDeleteConfirm(false)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to permanently delete slide",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingSlide || deleteLoading) return
    if (permanentDeleteConfirm) {
      await handlePermanentDelete(deletingSlide)
      return
    }
    setDeleteLoading(true)
    try {
      await deleteHeroSlide(deletingSlide.id)
      showSuccess({
        title: "Hero slide deleted",
        message: `"${deletingSlide.title}" has been moved to trash.`,
      })
      setDeletingSlide(null)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to delete slide",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search slides by title or subtitle…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("active")}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                filter === "active"
                  ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("deleted")}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                filter === "deleted"
                  ? "bg-destructive text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Deleted ({deletedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {filter !== "deleted" && (
            <Button
              size="sm"
              render={<Link href="/admin/hero-sliders/new" />}
              nativeButton={false}
              className="h-9 text-xs gap-1.5"
            >
              <PlusIcon className="size-4" />
              <span>Add Slide</span>
            </Button>
          )}
        </div>
      </div>

      {/* Slides Table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[60px] text-xs">Order</TableHead>
                <TableHead className="w-[110px] text-xs">Banner</TableHead>
                <TableHead className="text-xs">Slide Content</TableHead>
                <TableHead className="text-xs">CTA</TableHead>
                <TableHead className="w-[90px] text-xs">Status</TableHead>
                <TableHead className="w-[150px] text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.length > 0 ? (
                slides.map((slide, index) => (
                  <TableRow key={slide.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {slide.order}
                        </span>
                        {filter !== "deleted" && (
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleMove(slide, -1)}
                              disabled={busyId !== null || index === 0}
                              title="Move up"
                              className="h-4 w-4"
                            >
                              <ArrowUpIcon className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleMove(slide, 1)}
                              disabled={busyId !== null || index === slides.length - 1}
                              title="Move down"
                              className="h-4 w-4"
                            >
                              <ArrowDownIcon className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={slide.image}
                          alt={slide.alt}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/hero-sliders/${slide.id}/edit`}
                          className="text-xs font-semibold text-foreground hover:underline"
                        >
                          {slide.title}
                        </Link>
                        <span className="max-w-md text-[11px] text-muted-foreground line-clamp-2">
                          {slide.subtitle}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">
                          {slide.ctaLabel}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {slide.ctaHref}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {slide.isActive ? (
                        <Badge className="border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-300">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {filter === "deleted" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRestore(slide)}
                              disabled={busyId === slide.id}
                              title="Restore slide"
                            >
                              {busyId === slide.id ? (
                                <Loader2Icon className="size-3.5 animate-spin" />
                              ) : (
                                <RotateCcwIcon className="size-3.5 text-muted-foreground hover:text-emerald-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setPermanentDeleteConfirm(true)
                                setDeletingSlide(slide)
                              }}
                              disabled={busyId === slide.id}
                              title="Permanently delete slide"
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
                              onClick={() => handleToggleActive(slide)}
                              disabled={busyId !== null}
                              title={slide.isActive ? "Hide slide" : "Publish slide"}
                            >
                              {busyId === slide.id ? (
                                <Loader2Icon className="size-3.5 animate-spin" />
                              ) : (
                                <EyeOffIcon
                                  className={`size-3.5 ${
                                    slide.isActive
                                      ? "text-muted-foreground hover:text-amber-600"
                                      : "text-muted-foreground hover:text-emerald-600"
                                  }`}
                                />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              render={
                                <Link href={`/admin/hero-sliders/${slide.id}/edit`} />
                              }
                              nativeButton={false}
                              title="Edit slide"
                            >
                              <EditIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              render={
                                <Link href={slide.ctaHref} target="_blank" rel="noreferrer noopener" />
                              }
                              nativeButton={false}
                              title="Open CTA link"
                            >
                              <ExternalLinkIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setPermanentDeleteConfirm(false)
                                setDeletingSlide(slide)
                              }}
                              title="Delete slide"
                            >
                              <Trash2Icon className="size-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No hero slides found matching your query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          pageSizeOptions={[8, 12, 24]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemName="slides"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={!!deletingSlide}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSlide(null)
            setPermanentDeleteConfirm(false)
          }
        }}
        title={
          permanentDeleteConfirm
            ? "Permanently Delete Slide?"
            : "Delete Hero Slide?"
        }
        description={
          permanentDeleteConfirm ? (
            <>
              This will permanently remove the slide{" "}
              <strong className="text-foreground">{deletingSlide?.title}</strong> and its banner
              image from the database. This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to move the slide{" "}
              <strong className="text-foreground">{deletingSlide?.title}</strong> to trash? It will
              no longer appear on the homepage carousel. You can restore it later from the Deleted tab.
            </>
          )
        }
        confirmLabel={permanentDeleteConfirm ? "Permanently Delete" : "Delete Slide"}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
