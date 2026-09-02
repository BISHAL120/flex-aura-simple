"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  Trash2Icon,
  ExternalLinkIcon,
  SparklesIcon,
  SlidersHorizontalIcon,
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
import { formatPrice, products, type Product } from "@/lib/data"
import { initialCategories, type AdminCategory } from "@/lib/admin-data"
import { ProductDialog } from "@/components/admin/products/product-dialog"
import { ProductDeleteDialog } from "@/components/admin/products/product-delete-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"

export function ProductTable({ initialQuery = "" }: { initialQuery?: string }) {
  const categories: AdminCategory[] = initialCategories
  const [search, setSearch] = React.useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
  const [selectedBadge, setSelectedBadge] = React.useState<string>("All")
  const [sortBy, setSortBy] = React.useState<"name" | "price-asc" | "price-desc" | "rating">("name")

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null)

  React.useEffect(() => {
    if (initialQuery) {
      setSearch(initialQuery)
      setPage(1)
    }
  }, [initialQuery])

  const dynamicBadges = React.useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.badge) set.add(p.badge)
    })
    return ["All", ...Array.from(set)]
  }, [products])

  const categorizeProduct = React.useCallback(
    (product: Product) => {
      const match = categories.find((c) =>
        c.tags.some((t) => product.tags.some((pt) => pt.toLowerCase() === t.toLowerCase()))
      )
      return match ? match.name : "Uncategorized"
    },
    [categories]
  )

  const filtered = React.useMemo(() => {
    let list = [...products]

    if (selectedCategory !== "All") {
      const targetCat = categories.find((c) => c.name === selectedCategory || c.slug === selectedCategory)
      if (targetCat) {
        list = list.filter((p) =>
          targetCat.tags.some((t) => p.tags.some((pt) => pt.toLowerCase() === t.toLowerCase()))
        )
      }
    }

    if (selectedBadge !== "All") {
      list = list.filter((p) => p.badge?.toLowerCase() === selectedBadge.toLowerCase())
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price)
      case "price-desc":
        return list.sort((a, b) => b.price - a.price)
      case "rating":
        return list.sort((a, b) => b.rating - a.rating)
      default:
        return list.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [products, categories, search, selectedCategory, selectedBadge, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))
  const paginatedProducts = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  function handleOpenCreate() {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  function handleOpenDelete(product: Product) {
    setDeletingProduct(product)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Filter by name, slug or tag…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy)
              setPage(1)
            }}
            className="h-9 rounded-md border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
        </div>
      </div>

      {/* Category & Badge Filter Pills */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase">
            Category:
          </span>
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat)
                setPage(1)
              }}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase">
            Badge:
          </span>
          {dynamicBadges.map((bdg) => (
            <button
              key={bdg}
              type="button"
              onClick={() => {
                setSelectedBadge(bdg)
                setPage(1)
              }}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                selectedBadge === bdg
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {bdg}
            </button>
          ))}
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
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
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
                        {categorizeProduct(product)}
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
                        <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
                        <span className="text-[11px] text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[8, 12, 24, 48]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="products"
        />
      </div>

      {/* Dialogs */}
      <ProductDialog
        key={editingProduct?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productToEdit={editingProduct}
      />

      <ProductDeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
      />
    </div>
  )
}
