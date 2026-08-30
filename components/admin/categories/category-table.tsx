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
  LayersIcon,
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
import { useAdminStore } from "@/components/admin/admin-store-provider"
import { CategoryDialog } from "@/components/admin/categories/category-dialog"
import { CategoryDeleteDialog } from "@/components/admin/categories/category-delete-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import type { AdminCategory } from "@/lib/admin-data"

export function CategoryTable() {
  const { categories, products } = useAdminStore()
  const [search, setSearch] = React.useState("")
  const [featuredFilter, setFeaturedFilter] = React.useState<"all" | "featured">("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<AdminCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = React.useState<AdminCategory | null>(null)

  // Calculate matching products count for each category
  const getProductCount = React.useCallback(
    (cat: AdminCategory) => {
      return products.filter((p) =>
        p.tags.some((pt) =>
          cat.tags.some((ct) => ct.toLowerCase() === pt.toLowerCase())
        )
      ).length
    },
    [products]
  )

  const filtered = React.useMemo(() => {
    let list = [...categories]

    if (featuredFilter === "featured") {
      list = list.filter((c) => c.featured)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return list
  }, [categories, featuredFilter, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))
  const paginatedCategories = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  function handleOpenCreate() {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(cat: AdminCategory) {
    setEditingCategory(cat)
    setDialogOpen(true)
  }

  function handleOpenDelete(cat: AdminCategory) {
    setDeletingCategory(cat)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top Action Bar */}
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
              placeholder="Search categories by name, slug or keyword…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setFeaturedFilter("all")
                setPage(1)
              }}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                featuredFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFeaturedFilter("featured")
                setPage(1)
              }}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                featuredFilter === "featured"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Featured ({categories.filter((c) => c.featured).length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat) => {
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
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
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
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        category={deletingCategory}
      />
    </div>
  )
}
