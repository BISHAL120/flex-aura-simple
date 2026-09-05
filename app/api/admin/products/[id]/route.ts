import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireAdminApi } from "@/lib/check-Access"
import {
  softDeleteProduct,
  updateProduct,
} from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductToAdminProduct } from "@/lib/data-layer/admin/products/product-mapper"
import db from "@/lib/prisma"
import { productSchema } from "@/lib/validators"

/** USD dollars -> integer cents (rounds half-up on floating representation). */
const toCents = (amount: number) => Math.round(amount * 100)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 })
    }

    const body = await request.json()

    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid product data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const existing = await db.product.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Pre-check slug uniqueness (excluding this product).
    if (data.slug && data.slug.trim() !== existing.slug) {
      const slugExists = await db.product.findUnique({
        where: { slug: data.slug.trim() },
      })
      if (slugExists) {
        return NextResponse.json(
          { message: "A product with this slug already exists" },
          { status: 409 }
        )
      }
    }

    const product = await updateProduct(id, {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description.trim(),
      price: toCents(data.price),
      compareAtPrice: data.compareAtPrice != null ? toCents(data.compareAtPrice) : null,
      image: data.image.trim(),
      images: data.images.map((i) => i.trim()).filter(Boolean),
      badge: data.badge?.trim() || null,
      isBestSeller: data.isBestSeller ?? false,
      isNewArrival: data.isNewArrival ?? false,
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
      { status: 200 }
    )
  } catch (error) {
    // Race: another request claimed the slug between pre-check and update.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "A product with this slug already exists" },
        { status: 409 }
      )
    }
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 })
    }

    const existing = await db.product.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    await softDeleteProduct(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
