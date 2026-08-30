import * as React from "react"
import type { Metadata } from "next"
import { CategoryForm } from "@/components/admin/categories/category-form"

export const metadata: Metadata = {
  title: "New Category — Flex Aura Admin",
  description: "Create and publish a new product category to the storefront.",
}

export default function AdminNewCategoryPage() {
  return <CategoryForm mode="create" />
}
