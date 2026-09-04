import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CategoryTable } from "@/components/admin/categories/category-table"
import { getAllCategories } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoriesToAdminCategories } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Categories Management — Flex Aura Admin",
  description: "Manage metal art categories, vehicle collections, backlit collections, and tags.",
}

const VALID_PAGE_SIZES = [6, 12, 24]
const DEFAULT_PAGE_SIZE = 6

const AdminCategoriesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) => {
  const params = await searchParams
  const search = (params?.search || "").trim()
  const featured = params?.featured === "featured"
  const deleted = params?.deleted === "1"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const result = await getAllCategories(
    page,
    pageSize,
    search,
    deleted ? null : featured ? true : null,
    deleted
  )
  const categories = mapCategoriesToAdminCategories(result.categories)

  // If the requested page is out of range (e.g. after a filter narrows the
  // results), send the user back to a valid page in one round trip.
  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (featured && !deleted) params.set("featured", "featured")
    if (deleted) params.set("deleted", "1")
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(pageSize))
    params.set("page", "1")
    redirect(`/admin/categories?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Categories &amp; Collections
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage product categories, cover photos, keyword tag mappings, and featured collections.
        </p>
      </div>

      <CategoryTable
        categories={categories}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        featuredCount={result.counts.featured}
        totalCount={result.counts.total}
        deletedCount={result.counts.deleted}
        search={search}
        featuredFilter={featured ? "featured" : "all"}
        deletedFilter={deleted ? "deleted" : "active"}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}

export default AdminCategoriesPage
