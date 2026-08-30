"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import { CategoryForm } from "@/components/admin/categories/category-form"

export default function AdminEditCategoryPage() {
  const params = useParams()
  const id = params?.id as string
  const { categories, hasHydrated } = useAdminStore()

  const category = React.useMemo(() => {
    return categories.find((c) => c.id === id || c.slug === id)
  }, [categories, id])

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

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
