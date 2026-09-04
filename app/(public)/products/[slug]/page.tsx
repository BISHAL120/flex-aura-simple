import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetails } from "@/components/public/product-details/product-details"
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductToStoreProduct } from "@/lib/data-layer/admin/products/product-mapper"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const dbProduct = await getProductBySlug(slug, true)
  if (!dbProduct) return {}
  const product = mapProductToStoreProduct(dbProduct)
  return {
    title: `${product.name} — Flex Aura`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const dbProduct = await getProductBySlug(slug, true)

  if (!dbProduct) {
    notFound()
  }

  const product = mapProductToStoreProduct(dbProduct)
  const related = (await getRelatedProducts(dbProduct)).map(mapProductToStoreProduct)

  return <ProductDetails product={product} related={related} />
}
