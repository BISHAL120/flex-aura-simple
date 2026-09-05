import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"

/**
 * Public lightweight search for the header search suggestions.
 * Matches active products by title or description (case-insensitive contains),
 * returning compact results for a live dropdown.
 */
export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get("q") || "").trim()
    if (!q) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }
    if (q.length > 100) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    const products = await db.product.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        price: true,
        badge: true,
        variants: { select: { name: true, price: true } },
      },
      take: 6,
      orderBy: [{ isBestSeller: "desc" }, { reviewCount: "desc" }],
    })

    return NextResponse.json(
      {
        products: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          image: p.image,
          badge: p.badge,
          // Show the same price the product card does: the first (default)
          // variant when one exists, otherwise the base price. Cents -> USD.
          price: (p.variants[0]?.price ?? p.price) / 100,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}
