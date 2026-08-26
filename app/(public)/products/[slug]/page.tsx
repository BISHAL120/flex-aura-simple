import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetails } from "@/components/public/product-details/product-details"
import { getProductBySlug, getRelatedProducts, products } from "@/lib/data"

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}
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
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const related = getRelatedProducts(product)

  return <ProductDetails product={product} related={related} />
}
