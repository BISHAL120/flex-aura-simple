import type { Metadata } from "next"
import { ProductTable } from "@/components/admin/products/product-table"
import { getAllCategories } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoriesToAdminCategories } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Products Catalog — Flex Aura Admin",
  description: "Manage 2mm laser-cut metal art products, size variants, and pricing.",
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const categoryResult = await getAllCategories(1, 100)
  const categories = mapCategoriesToAdminCategories(categoryResult.categories)

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

      <ProductTable initialQuery={q ?? ""} categories={categories} />
    </div>
  )
}
