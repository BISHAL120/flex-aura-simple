import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"

/**
 * Public endpoint: returns current prices for the cart line items.
 * Each item is identified by { id, variant } where `id` is the product id and
 * `variant` is the variant name (or the base product when omitted).
 *
 * Response: { items: [{ id, variant, name, price, compareAtPrice, image }] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items: { id: string; variant?: string }[] = Array.isArray(body?.items)
      ? body.items
      : []

    const ids = Array.from(
      new Set(items.map((item) => item?.id).filter((id): id is string => !!id))
    )
    if (ids.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const products = await db.product.findMany({
      where: { id: { in: ids }, isDeleted: false, isActive: true },
      include: { variants: true },
    })

    const byId = new Map(products.map((p) => [p.id, p]))
    const result = items.flatMap((item) => {
      const product = byId.get(item.id)
      if (!product) return []
      const variant = item.variant
        ? product.variants.find((v) => v.name === item.variant)
        : undefined
      const price = variant?.price ?? product.price
      const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice ?? null
      return [
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          variant: variant?.name ?? null,
          price: price / 100,
          compareAtPrice: compareAtPrice != null ? compareAtPrice / 100 : null,
        },
      ]
    })

    return NextResponse.json({ items: result }, { status: 200 })
  } catch (error) {
    console.error("Error fetching cart prices:", error)
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
