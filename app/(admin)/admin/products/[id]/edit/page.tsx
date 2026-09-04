import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/admin/products/product-form"
import { getProductById, getProductBySlug } from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductToAdminProduct } from "@/lib/data-layer/admin/products/product-mapper"
import { getAllCategories } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoriesToAdminCategories } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Edit Product — Flex Aura Admin",
  description: "Update a metal art product's details, pricing, variants, and artwork.",
}

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The edit URL uses the product ID, but links can also arrive by slug.
  // Fall back to a slug lookup so both link styles keep working.
  const dbProduct = (await getProductById(id)) ?? (await getProductBySlug(id))

  if (!dbProduct) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Product Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          No metal art product matching ID &quot;{id}&quot; was found in the workshop catalog.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/products" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Products Catalog
        </Button>
      </div>
    )
  }

  const categoryResult = await getAllCategories(1, 100)
  const categories = mapCategoriesToAdminCategories(categoryResult.categories)

  return (
    <ProductForm
      key={dbProduct.id}
      product={mapProductToAdminProduct(dbProduct)}
      categories={categories}
      mode="edit"
    />
  )
}
