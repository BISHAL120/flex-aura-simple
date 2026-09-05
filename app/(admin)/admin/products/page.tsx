import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ProductTable } from "@/components/admin/products/product-table"
import {
  getAllProducts,
  type ProductSort,
} from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductsToAdminProducts } from "@/lib/data-layer/admin/products/product-mapper"
import { getAllCategories } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoriesToAdminCategories } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Products Catalog — Flex Aura Admin",
  description: "Manage 2mm laser-cut metal art products, size variants, and pricing.",
}

const VALID_PAGE_SIZES = [8, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 8
const SORT_KEYS: ProductSort[] = ["name", "price-asc", "price-desc", "rating", "newest"]

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = (params?.search || "").trim()
  const categorySlug = params?.category || ""
  const badge = params?.badge || ""
  const deleted = params?.deleted === "1"
  const sortParam = params?.sort as ProductSort | undefined
  const sort = SORT_KEYS.includes(sortParam as ProductSort) ? (sortParam as ProductSort) : "newest"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const categoryResult = await getAllCategories(1, 100)
  const categories = mapCategoriesToAdminCategories(categoryResult.categories)

  const result = await getAllProducts(page, pageSize, {
    search,
    categorySlug: categorySlug || undefined,
    badge: badge || undefined,
    sort,
    deletedOnly: deleted,
    broadSearch: true,
  })
  const products = mapProductsToAdminProducts(result.products)

  // If the requested page is out of range (e.g. after a filter narrows the
  // results), send the user back to a valid page in one round trip.
  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const redirectParams = new URLSearchParams()
    if (search) redirectParams.set("search", search)
    if (categorySlug) redirectParams.set("category", categorySlug)
    if (badge) redirectParams.set("badge", badge)
    if (deleted) redirectParams.set("deleted", "1")
    if (sort !== "newest") redirectParams.set("sort", sort)
    if (pageSize !== DEFAULT_PAGE_SIZE) redirectParams.set("per_page", String(pageSize))
    redirectParams.set("page", "1")
    redirect(`/admin/products?${redirectParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Products Catalog
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage laser-cut metal art designs, dimension variants, powder coat finishes, and badges.
        </p>
      </div>

      <ProductTable
        products={products}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        deletedCount={result.counts.deleted}
        badges={result.badges}
        categories={categories}
        search={search}
        category={categorySlug}
        badge={badge}
        sort={sort}
        deletedFilter={deleted ? "deleted" : "active"}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
