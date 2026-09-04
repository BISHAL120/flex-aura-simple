"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  Trash2Icon,
  ExternalLinkIcon,
  SparklesIcon,
  SlidersHorizontalIcon,
  LayersIcon,
  RotateCcwIcon,
  TrashIcon,
  Loader2Icon,
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
import { CategoryDialog } from "@/components/admin/categories/category-dialog"
import { CategoryDeleteDialog } from "@/components/admin/categories/category-delete-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import { products, type Product } from "@/lib/data"
import {
  deleteCategory,
  restoreCategory,
  permanentDeleteCategory,
} from "@/lib/data-layer/admin/categories/category-actions"
import type { AdminCategory } from "@/lib/admin-categories-data"
import { showError, showSuccess } from "@/lib/toast"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 6

interface CategoryTableProps {
  categories: AdminCategory[]
  total: number
  totalPages: number
  featuredCount: number
  totalCount: number
  deletedCount: number
  search: string
  featuredFilter: "all" | "featured"
  deletedFilter: "active" | "deleted"
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  featuredFilter: "all" | "featured"
  deletedFilter: "active" | "deleted"
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.featuredFilter === "featured") params.set("featured", "featured")
  if (state.deletedFilter === "deleted") params.set("deleted", "1")
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/categories?${qs}` : "/admin/categories"
}

export function CategoryTable({
  categories,
  total,
  totalPages,
  featuredCount,
  totalCount,
  deletedCount,
  search,
  featuredFilter,
  deletedFilter,
  page,
  pageSize,
}: CategoryTableProps) {
  const router = useRouter()

  // Local input state so typing feels instant; the URL is the source of truth.
  const [searchInput, setSearchInput] = React.useState(search)

  // While the input is focused, the typed value is authoritative. The URL is
  // only a delayed echo of what was typed, so syncing URL -> input mid-typing
  // would revert, truncate, or clear the value. Only sync URL -> input when
  // the input is not focused: back/forward navigation, reloads, clamping.
  const searchFocusedRef = React.useRef(false)

  // Last committed URL state. Every navigation merges onto this ref so a slow
  // debounce or a queued action can never drop a filter from the URL.
  const committedRef = React.useRef<CommittedState>({
    search,
    featuredFilter,
    deletedFilter,
    page,
    pageSize,
  })

  // Pending page size while DataPagination fires both size and page callbacks
  const pendingSizeRef = React.useRef<number | null>(null)

  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<AdminCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = React.useState<AdminCategory | null>(null)
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [restoringCategoryId, setRestoringCategoryId] = React.useState<string | null>(null)
  const [permanentDeletingId, setPermanentDeletingId] = React.useState<string | null>(null)

  // Sync the committed URL state ref when server-rendered props change:
  // back/forward navigation, reloads, and server-side page clamping all land
  // here. This only reads props into a ref - it does not navigate, so it
  // cannot loop.
  React.useEffect(() => {
    committedRef.current = { search, featuredFilter, deletedFilter, page, pageSize }
  }, [search, featuredFilter, deletedFilter, page, pageSize])

  // Keep the input in sync with the URL, but never while the user is typing in
  // it. The URL search value is a delayed echo; writing it back mid-typing is
  // what caused the reverting/truncating/clearing bugs.
  React.useEffect(() => {
    if (searchFocusedRef.current) return
    setSearchInput(search)
  }, [search])

  const navigate = React.useCallback((overrides: Partial<CommittedState>) => {
    const next: CommittedState = { ...committedRef.current, ...overrides }
    committedRef.current = next
    router.push(buildQuery(next), { scroll: false })
  }, [router])

  // Debounce typing into the URL. Compares against the committed state so it
  // never re-pushes a value that's already in the URL.
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

  // Calculate matching products count for each category (mock products)
  const getProductCount = React.useCallback(
    (cat: AdminCategory) => {
      return products.filter((p: Product) =>
        p.tags.some((pt: string) =>
          cat.tags.some((ct: string) => ct.toLowerCase() === pt.toLowerCase())
        )
      ).length
    },
    []
  )

  function handleFeaturedFilterChange(filter: "all" | "featured") {
    navigate({ featuredFilter: filter, page: 1 })
  }

  function handleDeletedFilterChange(filter: "active" | "deleted") {
    navigate({ deletedFilter: filter, featuredFilter: "all", page: 1 })
  }

  function handleOpenCreate() {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(cat: AdminCategory) {
    setEditingCategory(cat)
    setDialogOpen(true)
  }

  function handleOpenDelete(cat: AdminCategory) {
    setPermanentDeleteConfirm(false)
    setDeletingCategory(cat)
  }

  function handleOpenPermanentDelete(cat: AdminCategory) {
    setPermanentDeleteConfirm(true)
    setDeletingCategory(cat)
  }

  async function handleRestore(cat: AdminCategory) {
    if (restoringCategoryId) return
    setRestoringCategoryId(cat.id)

    try {
      await restoreCategory(cat.id)

      showSuccess({
        title: "Category Restored",
        message: `"${cat.name}" has been restored.`,
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to restore category",
      })
    } finally {
      setRestoringCategoryId(null)
    }
  }

  async function handlePermanentDelete(cat: AdminCategory) {
    if (permanentDeletingId) return
    setPermanentDeletingId(cat.id)

    try {
      await permanentDeleteCategory(cat.id)

      // Remove the Firebase image now that the DB record is gone.
      await deleteFirebaseImage(cat.image)

      showSuccess({
        title: "Category Permanently Deleted",
        message: `"${cat.name}" has been permanently removed.`,
      })

      setPermanentDeleteConfirm(false)
      setDeletingCategory(null)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to permanently delete category",
      })
    } finally {
      setPermanentDeletingId(null)
    }
  }

  function handlePageChange(nextPage: number) {
    // If a size change is in flight, apply it now and clear it.
    const size = pendingSizeRef.current
    pendingSizeRef.current = null
    navigate(size !== null ? { pageSize: size, page: nextPage } : { page: nextPage })
  }

  function handlePageSizeChange(nextSize: number) {
    // Stash the size; DataPagination immediately calls onPageChange(1), which
    // performs the single navigation with both values applied.
    pendingSizeRef.current = nextSize
  }

  async function handleConfirmDelete() {
    if (!deletingCategory || deleteLoading) return

    if (permanentDeleteConfirm) {
      await handlePermanentDelete(deletingCategory)
      return
    }

    setDeleteLoading(true)

    try {
      await deleteCategory(deletingCategory.id)

      showSuccess({
        title: "Category Deleted",
        message: `"${deletingCategory.name}" has been deleted.`,
      })

      setDeletingCategory(null)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to delete category",
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
              placeholder="Search categories by name, slug or keyword…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => handleDeletedFilterChange("active")}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                deletedFilter === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({totalCount})
            </button>
            {deletedFilter === "active" && (
              <button
                type="button"
                onClick={() => handleFeaturedFilterChange("featured")}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  featuredFilter === "featured"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Featured ({featuredCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeletedFilterChange("deleted")}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                deletedFilter === "deleted"
                  ? "bg-destructive text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Deleted ({deletedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deletedFilter === "active" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenCreate}
                className="h-9 text-xs gap-1.5"
                title="Open quick category modal"
              >
                <SparklesIcon className="size-3.5 text-amber-500" />
                <span>Quick Add</span>
              </Button>

              <Button
                size="sm"
                render={<Link href="/admin/categories/new" />}
                nativeButton={false}
                className="h-9 text-xs gap-1.5"
              >
                <PlusIcon className="size-4" />
                <span>Add Category</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[80px] text-xs">Banner</TableHead>
                <TableHead className="text-xs">Category Title &amp; Slug</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Product Mapping</TableHead>
                <TableHead className="text-xs">Featured</TableHead>
                <TableHead className="w-[140px] text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((cat) => {
                  const count = getProductCount(cat)
                  return (
                    <TableRow key={cat.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/admin/categories/${cat.id}/edit`}
                            className="font-semibold text-xs text-foreground hover:underline"
                          >
                            {cat.name}
                          </Link>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            /{cat.slug}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {cat.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1 font-medium">
                          <LayersIcon className="size-3" />
                          {count} {count === 1 ? "piece" : "pieces"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cat.featured ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Standard
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {deletedFilter === "deleted" ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleRestore(cat)}
                                disabled={restoringCategoryId === cat.id}
                                title="Restore category"
                              >
                                {restoringCategoryId === cat.id ? (
                                  <Loader2Icon className="size-3.5 animate-spin" />
                                ) : (
                                  <RotateCcwIcon className="size-3.5 text-muted-foreground hover:text-emerald-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenPermanentDelete(cat)}
                                disabled={permanentDeletingId === cat.id}
                                title="Permanently delete category"
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
                                onClick={() => handleOpenEdit(cat)}
                                title="Quick edit (Modal)"
                              >
                                <EditIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                render={
                                  <Link href={`/admin/categories/${cat.id}/edit`} />
                                }
                                nativeButton={false}
                                title="Full page editor"
                              >
                                <SlidersHorizontalIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                render={
                                  <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} target="_blank" />
                                }
                                nativeButton={false}
                                title="View in storefront shop"
                              >
                                <ExternalLinkIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenDelete(cat)}
                                title="Delete category"
                              >
                                <Trash2Icon className="size-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No product categories found matching your query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Reusable Data Pagination */}
        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemName="categories"
        />
      </div>

      {/* Quick Add/Edit Modal */}
      <CategoryDialog
        key={editingCategory?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoryToEdit={editingCategory}
      />

      {/* Delete Confirmation Modal */}
      <CategoryDeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCategory(null)
            setPermanentDeleteConfirm(false)
          }
        }}
        category={deletingCategory}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading || permanentDeletingId !== null}
        permanent={permanentDeleteConfirm}
      />
    </div>
  )
}
