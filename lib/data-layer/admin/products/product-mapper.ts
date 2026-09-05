import type { AdminProduct, AdminProductVariant } from "@/lib/admin-products-data"
import type { ProductWithRelations } from "@/lib/data-layer/admin/products/product-data-layer"

/** Integer cents -> USD dollars. */
const fromCents = (cents: number) => cents / 100

export function mapProductToAdminProduct(product: ProductWithRelations): AdminProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: fromCents(product.price),
    compareAtPrice:
      product.compareAtPrice != null ? fromCents(product.compareAtPrice) : undefined,
    image: product.image,
    images: product.images,
    badge: product.badge ?? undefined,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    variants: product.variants.map(
      (v): AdminProductVariant => ({
        name: v.name,
        price: fromCents(v.price),
        compareAtPrice: v.compareAtPrice != null ? fromCents(v.compareAtPrice) : undefined,
      })
    ),
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
    isActive: product.isActive,
    isDeleted: product.isDeleted,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    categorySlug: product.category?.slug ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export function mapProductsToAdminProducts(
  products: ProductWithRelations[]
): AdminProduct[] {
  return products.map(mapProductToAdminProduct)
}

/** Storefront shape: structurally matches the legacy `Product` type. */
export function mapProductToStoreProduct(product: ProductWithRelations) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: fromCents(product.price),
    compareAtPrice:
      product.compareAtPrice != null ? fromCents(product.compareAtPrice) : undefined,
    image: product.image,
    images: product.images,
    badge: product.badge ?? undefined,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    variants: product.variants.map((v) => ({
      name: v.name,
      price: fromCents(v.price),
      compareAtPrice: v.compareAtPrice != null ? fromCents(v.compareAtPrice) : undefined,
    })),
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
  }
}
