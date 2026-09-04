import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import db from "@/lib/prisma"
import { requireAdminApi } from "@/lib/check-Access"
import { createProduct } from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductToAdminProduct } from "@/lib/data-layer/admin/products/product-mapper"
import { productSchema } from "@/lib/validators"

/** USD dollars -> integer cents (rounds half-up on floating representation). */
const toCents = (amount: number) => Math.round(amount * 100)

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const body = await request.json()

    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid product data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Pre-check slug uniqueness before persisting anything.
    const existingProduct = await db.product.findUnique({
      where: { slug: data.slug.trim() },
    })
    if (existingProduct) {
      return NextResponse.json(
        { message: "A product with this slug already exists" },
        { status: 400 }
      )
    }

    const product = await createProduct({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description.trim(),
      price: toCents(data.price),
      compareAtPrice: data.compareAtPrice != null ? toCents(data.compareAtPrice) : null,
      image: data.image.trim(),
      images: data.images.map((i) => i.trim()).filter(Boolean),
      badge: data.badge?.trim() || null,
      tags: data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      variants: data.variants.map((v) => ({
        name: v.name.trim(),
        price: toCents(v.price),
        compareAtPrice: v.compareAtPrice != null ? toCents(v.compareAtPrice) : null,
      })),
      categoryId: data.categoryId || null,
    })

    return NextResponse.json(
      { product: mapProductToAdminProduct(product) },
      { status: 201 }
    )
  } catch (error) {
    // Race: another request created the same slug between pre-check and create.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "A product with this slug already exists" },
        { status: 409 }
      )
    }
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}
