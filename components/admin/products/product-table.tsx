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
import { formatPrice } from "@/lib/data"
import type { AdminProduct, AdminBadgeCount } from "@/lib/admin-products-data"
import type { AdminCategory } from "@/lib/admin-categories-data"
import type { ProductSort } from "@/lib/data-layer/admin/products/product-data-layer"
import { ProductDialog } from "@/components/admin/products/product-dialog"
import { ProductDeleteDialog } from "@/components/admin/products/product-delete-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import {
  deleteProduct,
  restoreProduct,
  permanentDeleteProduct,
} from "@/lib/data-layer/admin/products/product-actions"
import { showError, showSuccess } from "@/lib/toast"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 8

interface ProductTableProps {
  products: AdminProduct[]
  total: number
  totalPages: number
  deletedCount: number
  badges: AdminBadgeCount[]
  categories: AdminCategory[]
  search: string
  category: string
  badge: string
  sort: ProductSort
  deletedFilter: "active" | "deleted"
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  category: string
  badge: string
  sort: ProductSort
  deletedFilter: "active" | "deleted"
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.category) params.set("category", state.category)
  if (state.badge) params.set("badge", state.badge)
  if (state.sort !== "newest") params.set("sort", state.sort)
  if (state.deletedFilter === "deleted") params.set("deleted", "1")
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/products?${qs}` : "/admin/products"
}

export function ProductTable({
  products,
  total,
  totalPages,
  deletedCount,
  badges,
  categories,
  search,
  category,
  badge,
  sort,
  deletedFilter,
  page,
  pageSize,
}: ProductTableProps) {
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
    category,
    badge,
    sort,
    deletedFilter,
    page,
    pageSize,
  })

  // Pending page size while DataPagination fires both size and page callbacks
  const pendingSizeRef = React.useRef<number | null>(null)

  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<AdminProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = React.useState<AdminProduct | null>(null)
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [restoringId, setRestoringId] = React.useState<string | null>(null)
  const [permanentDeletingId, setPermanentDeletingId] = React.useState<string | null>(null)

  // Sync the committed URL state ref when server-rendered props change:
  // back/forward navigation, reloads, and server-side page clamping all land
  // here. This only reads props into a ref - it does not navigate, so it
  // cannot loop.
  React.useEffect(() => {
    committedRef.current = {
      search,
      category,
      badge,
      sort,
      deletedFilter,
      page,
      pageSize,
    }
  }, [search, category, badge, sort, deletedFilter, page, pageSize])

  // Keep the input in sync with the URL, but never while the user is typing in
  // it. The URL search value is a delayed echo; writing it back mid-typing is
  // what caused the reverting/truncating/clearing bugs.
  React.useEffect(() => {
    if (searchFocusedRef.current) return
    setSearchInput(search)
  }, [search])

  const navigate = React.useCallback(
    (overrides: Partial<CommittedState>) => {
      const next: CommittedState = { ...committedRef.current, ...overrides }
      committedRef.current = next
      router.push(buildQuery(next), { scroll: false })
    },
    [router]
  )

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

  function handleDeletedFilterChange(filter: "active" | "deleted") {
    navigate({
      deletedFilter: filter,
      page: 1,
      category: "",
      badge: "",
      search: "",
    })
  }

  function handleOpenCreate() {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(product: AdminProduct) {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  function handleOpenDelete(product: AdminProduct) {
    setPermanentDeleteConfirm(false)
    setDeletingProduct(product)
  }

  function handleOpenPermanentDelete(product: AdminProduct) {
    setPermanentDeleteConfirm(true)
    setDeletingProduct(product)
  }

  async function handleRestore(product: AdminProduct) {
    if (restoringId) return
    setRestoringId(product.id)

    try {
      await restoreProduct(product.id)

      showSuccess({
        title: "Product Restored",
        message: `"${product.name}" has been restored.`,
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to restore product",
      })
    } finally {
      setRestoringId(null)
    }
  }

  async function handlePermanentDelete(product: AdminProduct) {
    if (permanentDeletingId) return
    setPermanentDeletingId(product.id)

    try {
      await permanentDeleteProduct(product.id)

      // Remove the Firebase image now that the DB record is gone. Local
      // images and missing Firebase objects are treated as success.
      if (product.image.startsWith("https://")) {
        try {
          await deleteFirebaseImage(product.image)
        } catch (err) {
          console.error("Error deleting product image:", err)
        }
      }

      showSuccess({
        title: "Product Permanently Deleted",
        message: `"${product.name}" has been permanently removed.`,
      })

      setPermanentDeleteConfirm(false)
      setDeletingProduct(null)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to permanently delete product",
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
    if (!deletingProduct || deleteLoading) return

    if (permanentDeleteConfirm) {
      await handlePermanentDelete(deletingProduct)
      return
    }

    setDeleteLoading(true)

    try {
      await deleteProduct(deletingProduct.id)

      showSuccess({
        title: "Product Deleted",
        message: `"${deletingProduct.name}" has been deleted.`,
      })

      setDeletingProduct(null)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to delete product",
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
              placeholder="Search products by name, slug or tag…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value as ProductSort, page: 1 })}
            className="h-9 rounded-md border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="newest">Sort: Newest</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
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
                title="Open quick add modal"
              >
                <SparklesIcon className="size-3.5 text-amber-500" />
                <span>Quick Add</span>
              </Button>

              <Button
                size="sm"
                render={<Link href="/admin/products/new" />}
                nativeButton={false}
                className="h-9 text-xs gap-1.5"
              >
                <PlusIcon className="size-4" />
                <span>Add Product</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-col gap-2">
        {deletedFilter === "active" && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase">
              Category:
            </span>
            {[{ slug: "", name: "All" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))].map(
              (cat) => (
                <button
                  key={cat.slug || "all"}
                  type="button"
                  onClick={() => navigate({ category: cat.slug, page: 1 })}
                  className={`rounded-full px-3 py-1 font-medium transition-colors ${
                    category === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              )
            )}
          </div>
        )}

        {deletedFilter === "active" && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase">
              Badge:
            </span>
            {[{ badge: "" as const, count: 0 }, ...badges].map((bdg) => (
              <button
                key={bdg.badge || "all"}
                type="button"
                onClick={() => navigate({ badge: bdg.badge, page: 1 })}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  badge === bdg.badge
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {bdg.badge === "" ? `All (${total})` : `${bdg.badge} (${bdg.count})`}
              </button>
            ))}
          </div>
        )}

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
            All ({total})
          </button>
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

      {/* Table Container */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[80px] text-xs">Image</TableHead>
                <TableHead className="text-xs">Product Details</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Base Price</TableHead>
                <TableHead className="text-xs">Variants</TableHead>
                <TableHead className="text-xs">Rating</TableHead>
                <TableHead className="w-[140px] text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-semibold text-xs text-foreground hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.badge && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          /{product.slug}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag) => (
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
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {product.categoryName || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {product.variants.length} dimensions
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-bold text-amber-500">★</span>
                        <span className="font-medium text-foreground">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {deletedFilter === "deleted" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRestore(product)}
                              disabled={restoringId === product.id}
                              title="Restore product"
                            >
                              {restoringId === product.id ? (
                                <Loader2Icon className="size-3.5 animate-spin" />
                              ) : (
                                <RotateCcwIcon className="size-3.5 text-muted-foreground hover:text-emerald-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenPermanentDelete(product)}
                              disabled={permanentDeletingId === product.id}
                              title="Permanently delete product"
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
                              onClick={() => handleOpenEdit(product)}
                              title="Quick edit (Modal)"
                            >
                              <EditIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              render={
                                <Link href={`/admin/products/${product.id}/edit`} />
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
                                <Link href={`/products/${product.slug}`} target="_blank" />
                              }
                              nativeButton={false}
                              title="View on storefront"
                            >
                              <ExternalLinkIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenDelete(product)}
                              title="Delete product"
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
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No metal art products found matching your search or filters.
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
          pageSizeOptions={[8, 12, 24, 48]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemName="products"
        />
      </div>

      {/* Dialogs */}
      <ProductDialog
        key={editingProduct?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productToEdit={editingProduct}
        categories={categories}
      />

      <ProductDeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProduct(null)
            setPermanentDeleteConfirm(false)
          }
        }}
        product={deletingProduct}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading || permanentDeletingId !== null}
        permanent={permanentDeleteConfirm}
      />
    </div>
  )
}
