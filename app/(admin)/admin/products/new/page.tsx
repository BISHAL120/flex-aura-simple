import * as React from "react"
import type { Metadata } from "next"
import { ProductForm } from "@/components/admin/products/product-form"

export const metadata: Metadata = {
  title: "Add Product — Flex Aura Admin",
  description: "Create and publish a new 2mm laser-cut metal art product to the catalog.",
}

export default function AdminNewProductPage() {
  return <ProductForm mode="create" />
}
