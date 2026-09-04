import type { Metadata } from "next"
import { ProductForm } from "@/components/admin/products/product-form"
import { getAllCategories } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoriesToAdminCategories } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Add Product — Flex Aura Admin",
  description: "Create and publish a new 2mm laser-cut metal art product to the catalog.",
}

export default async function AdminNewProductPage() {
  const categoryResult = await getAllCategories(1, 100)
  const categories = mapCategoriesToAdminCategories(categoryResult.categories)

  return <ProductForm mode="create" categories={categories} />
}
