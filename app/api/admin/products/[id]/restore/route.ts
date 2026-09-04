import { NextRequest, NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/check-Access"
import { restoreProduct } from "@/lib/data-layer/admin/products/product-data-layer"
import db from "@/lib/prisma"

export async function POST(
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

    const existing = await db.product.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    })
    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 400 })
    }

    const product = await restoreProduct(id)

    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    console.error("Error restoring product:", error)
    return NextResponse.json({ message: "Failed to restore product" }, { status: 500 })
  }
}
