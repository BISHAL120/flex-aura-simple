"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { initialCategories } from "@/lib/admin-data"
import { CategoryForm } from "@/components/admin/categories/category-form"

export default function AdminEditCategoryPage() {
  const params = useParams()
  const id = params?.id as string

  const category = React.useMemo(() => {
    return initialCategories.find((c) => c.id === id || c.slug === id)
  }, [id])

  if (!category) {
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

  return <CategoryForm category={category} mode="edit" />
}
