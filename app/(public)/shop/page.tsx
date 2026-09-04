import type { Metadata } from "next"
import * as React from "react"

import { ShopView } from "@/components/site/shop-view"
import { getAllProducts } from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductToStoreProduct } from "@/lib/data-layer/admin/products/product-mapper"
import { getAllCategories } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoriesToAdminCategories } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Shop Metal Art — Flex Aura",
  description:
    "Laser-cut 2mm metal wall art — cars, bikes, custom designs and backlit LED pieces, made to order in your size.",
}

const PRODUCTS_PER_PAGE = 9

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const query = (params?.q || "").trim()
  const categoryParam = params?.category || ""
  const sortParam = params?.sort || "featured"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  // The shop exposes a "featured" sort; the store treats it as newest-first.
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc" || sortParam === "rating" || sortParam === "newest"
      ? sortParam
      : "newest"

  const categoryResult = await getAllCategories(1, 100, "", null, false, true)
  const categories = mapCategoriesToAdminCategories(categoryResult.categories)

  const result = await getAllProducts(page, PRODUCTS_PER_PAGE, {
    search: query,
    categorySlug: categoryParam || undefined,
    sort,
    activeOnly: true,
  })
  const products = result.products.map(mapProductToStoreProduct)

  return (
    <React.Suspense fallback={null}>
      <ShopView
        products={products}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        categories={categories}
        query={query}
        category={categoryParam}
        sort={sortParam}
        currentPage={page}
      />
    </React.Suspense>
  )
}
