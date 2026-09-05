import db from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const productInclude = {
  variants: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude
}>

export interface ProductListResult {
  products: ProductWithRelations[]
  counts: {
    total: number
    deleted: number
  }
  badges: { badge: string; count: number }[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export type ProductSort = "name" | "price-asc" | "price-desc" | "rating" | "newest"

export interface ProductListFilters {
  search?: string
  categorySlug?: string
  badge?: string
  sort?: ProductSort
  deletedOnly?: boolean
  /** When true, only returns products with isActive: true (storefront scope). */
  activeOnly?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const orderByMap: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  name: { name: "asc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  rating: { rating: "desc" },
  newest: { createdAt: "desc" },
}

/** Returns the badge frequency map for active (non-deleted) products. */
export async function getBadgeCounts(): Promise<{ badge: string; count: number }[]> {
  const grouped = await db.product.groupBy({
    by: ["badge"],
    where: { isDeleted: false, badge: { not: null } },
    _count: { _all: true },
  })

  return grouped
    .filter((g) => g.badge !== null)
    .map((g) => ({ badge: g.badge as string, count: g._count._all }))
}

// ---------------------------------------------------------------------------
// Admin list query
// ---------------------------------------------------------------------------

export const getAllProducts = async (
  page: number = 1,
  perPage: number = 8,
  filters: ProductListFilters = {}
): Promise<ProductListResult> => {
  try {
    const { search, categorySlug, badge, sort = "newest", deletedOnly = false, activeOnly = false } = filters
    const skip = (page - 1) * perPage
    const limit = perPage

    const where: Prisma.ProductWhereInput = { isDeleted: deletedOnly }
    if (activeOnly) where.isActive = true

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    if (badge) {
      where.badge = badge
    }

    const total = await db.product.count({ where })

    const [deletedCount, badges] = await Promise.all([
      db.product.count({ where: { isDeleted: true } }),
      getBadgeCounts(),
    ])

    const products = await db.product.findMany({
      where,
      include: productInclude,
      take: limit,
      skip,
      orderBy: orderByMap[sort],
    })

    return {
      products,
      counts: { total, deleted: deletedCount },
      badges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to fetch products")
  }
}

export const getProductById = async (id: string) => {
  try {
    return await db.product.findFirst({
      where: { id, isDeleted: false },
      include: productInclude,
    })
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw new Error("Failed to fetch product")
  }
}

export const getProductBySlug = async (slug: string, activeOnly = false) => {
  try {
    return await db.product.findFirst({
      where: { slug, isDeleted: false, ...(activeOnly && { isActive: true }) },
      include: productInclude,
    })
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error)
    throw new Error("Failed to fetch product by slug")
  }
}

// ---------------------------------------------------------------------------
// Create / Update / Delete
// ---------------------------------------------------------------------------

export interface ProductWriteData {
  name: string
  slug: string
  description: string
  /** price in cents (integer) */
  price: number
  /** compareAtPrice in cents (integer) */
  compareAtPrice?: number | null
  image: string
  images?: string[]
  badge?: string | null
  isBestSeller?: boolean
  isNewArrival?: boolean
  tags: string[]
  rating?: number
  reviewCount?: number
  categoryId?: string | null
  variants: { name: string; price: number; compareAtPrice?: number | null }[]
}

export const createProduct = async (data: ProductWriteData) => {
  try {
    return await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        image: data.image,
        images: data.images ?? [],
        badge: data.badge ?? null,
        isBestSeller: data.isBestSeller ?? false,
        isNewArrival: data.isNewArrival ?? false,
        tags: data.tags,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        categoryId: data.categoryId ?? null,
        variants: {
          create: data.variants.map((v) => ({
            name: v.name,
            price: v.price,
            compareAtPrice: v.compareAtPrice ?? null,
          })),
        },
      },
      include: productInclude,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error("Failed to create product")
  }
}

export const updateProduct = async (id: string, data: ProductWriteData) => {
  try {
    return await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          image: data.image,
          images: data.images ?? [],
          badge: data.badge ?? null,
          isBestSeller: data.isBestSeller ?? false,
          isNewArrival: data.isNewArrival ?? false,
          tags: data.tags,
          rating: data.rating ?? 0,
          reviewCount: data.reviewCount ?? 0,
          categoryId: data.categoryId ?? null,
        },
      })

      // Replace variants wholesale on every update.
      await tx.productVariant.deleteMany({ where: { productId: id } })
      await tx.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId: id,
          name: v.name,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
        })),
      })

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: productInclude,
      })
    })
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw new Error("Failed to update product")
  }
}

export const softDeleteProduct = async (id: string) => {
  try {
    return await db.product.update({
      where: { id },
      data: { isDeleted: true },
    })
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw new Error("Failed to delete product")
  }
}

export const restoreProduct = async (id: string) => {
  try {
    return await db.product.update({
      where: { id },
      data: { isDeleted: false },
      select: { id: true, isDeleted: true, name: true },
    })
  } catch (error) {
    console.error(`Error restoring product ${id}:`, error)
    throw new Error("Failed to restore product")
  }
}

export const permanentDeleteProduct = async (id: string) => {
  try {
    return await db.product.delete({
      where: { id },
    })
  } catch (error) {
    console.error(`Error permanently deleting product ${id}:`, error)
    throw new Error("Failed to permanently delete product")
  }
}

/** Counts active (non-deleted) products per category id. */
export const getProductCountsByCategoryIds = async (
  categoryIds: string[]
): Promise<Record<string, number>> => {
  if (categoryIds.length === 0) return {}
  try {
    const grouped = await db.product.groupBy({
      by: ["categoryId"],
      where: { isDeleted: false, categoryId: { in: categoryIds } },
      _count: { _all: true },
    })
    const map: Record<string, number> = {}
    for (const g of grouped) {
      if (g.categoryId) map[g.categoryId] = g._count._all
    }
    return map
  } catch (error) {
    console.error("Error counting products by category:", error)
    throw new Error("Failed to count products by category")
  }
}

// ---------------------------------------------------------------------------
// Storefront queries
// ---------------------------------------------------------------------------

export const getBestSellers = async (limit = 4) => {
  try {
    return await db.product.findMany({
      where: { isDeleted: false, isActive: true, isBestSeller: true },
      include: productInclude,
      take: limit,
      orderBy: { reviewCount: "desc" },
    })
  } catch (error) {
    console.error("Error fetching best sellers:", error)
    throw new Error("Failed to fetch best sellers")
  }
}

export const getNewArrivals = async (limit = 4) => {
  try {
    return await db.product.findMany({
      where: { isDeleted: false, isActive: true, isNewArrival: true },
      include: productInclude,
      take: limit,
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching new arrivals:", error)
    throw new Error("Failed to fetch new arrivals")
  }
}

export const getProductsByIds = async (ids: string[]) => {
  if (ids.length === 0) return []
  try {
    return await db.product.findMany({
      where: { id: { in: ids }, isDeleted: false, isActive: true },
      include: productInclude,
    })
  } catch (error) {
    console.error("Error fetching products by ids:", error)
    throw new Error("Failed to fetch products by ids")
  }
}

/** Fetches active products by slug. */
export const getProductsBySlugs = async (slugs: string[]) => {
  if (slugs.length === 0) return []
  try {
    return await db.product.findMany({
      where: { slug: { in: slugs }, isDeleted: false, isActive: true },
      include: productInclude,
    })
  } catch (error) {
    console.error("Error fetching products by slugs:", error)
    throw new Error("Failed to fetch products by slugs")
  }
}

export const getRelatedProducts = async (product: ProductWithRelations, limit = 4) => {
  try {
    // Score products by shared tags, bestsellers first, then pad with newest.
    const candidates = await db.product.findMany({
      where: { isDeleted: false, isActive: true, id: { not: product.id } },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit * 4,
    })

    const productTags = new Set(product.tags)
    const scored = candidates
      .map((p) => ({
        product: p,
        score: p.tags.filter((t) => productTags.has(t)).length,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        const aBest = a.product.isBestSeller ? 1 : 0
        const bBest = b.product.isBestSeller ? 1 : 0
        return bBest - aBest
      })

    return scored.slice(0, limit).map((entry) => entry.product)
  } catch (error) {
    console.error("Error fetching related products:", error)
    throw new Error("Failed to fetch related products")
  }
}
