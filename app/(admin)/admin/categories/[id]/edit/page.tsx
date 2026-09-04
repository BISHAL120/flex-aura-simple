import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryForm } from "@/components/admin/categories/category-form"
import { getCategoryById, getCategoryBySlug } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoryToAdminCategory } from "@/lib/data-layer/admin/categories/category-mapper"

export const metadata: Metadata = {
  title: "Edit Category — Flex Aura Admin",
  description: "Update a product category's details, tags, and featured status.",
}

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The edit URL uses the category ID, but links can also arrive by slug.
  // Fall back to a slug lookup so both link styles keep working.
  const dbCategory = (await getCategoryById(id)) ?? (await getCategoryBySlug(id))

  if (!dbCategory) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Category Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          No product category matching ID &quot;{id}&quot; was found.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/categories" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Categories
        </Button>
      </div>
    )
  }

  return (
    <CategoryForm
      key={dbCategory.id}
      category={mapCategoryToAdminCategory(dbCategory)}
      mode="edit"
    />
  )
}
