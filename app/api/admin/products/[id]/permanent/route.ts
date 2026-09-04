import { NextRequest, NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/check-Access"
import { permanentDeleteProduct } from "@/lib/data-layer/admin/products/product-data-layer"
import db from "@/lib/prisma"

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

    const existing = await db.product.findFirst({ where: { id, isDeleted: true } })
    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 400 })
    }

    await permanentDeleteProduct(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error permanently deleting product:", error)
    return NextResponse.json(
      { message: "Failed to permanently delete product" },
      { status: 500 }
    )
  }
}
