import * as React from "react"
import type { Metadata } from "next"
import { CategoryTable } from "@/components/admin/categories/category-table"

export const metadata: Metadata = {
  title: "Categories Management — Flex Aura Admin",
  description: "Manage metal art categories, vehicle collections, backlit collections, and tags.",
}

export default function AdminCategoriesPage() {
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

      <CategoryTable />
    </div>
  )
}
