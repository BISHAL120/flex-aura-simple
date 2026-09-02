"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { products } from "@/lib/data"
import { ProductForm } from "@/components/admin/products/product-form"

export default function AdminEditProductPage() {
  const params = useParams()
  const id = params?.id as string

  const product = React.useMemo(() => {
    return products.find((p) => p.id === id || p.slug === id)
  }, [id])

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Product Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          No metal art product matching ID &quot;{id}&quot; was found in the workshop catalog.
        </p>
        <Button variant="outline" size="sm" render={<Link href="/admin/products" />} nativeButton={false}>
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Products Catalog
        </Button>
      </div>
    )
  }

  return <ProductForm product={product} mode="edit" />
}
