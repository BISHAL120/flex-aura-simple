import { requireAdminApi } from "@/lib/check-Access"
import { restoreCategory } from "@/lib/data-layer/admin/categories/category-data-layer"
import db from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid category id" }, { status: 400 })
    }

    const existing = await db.category.findUnique({ where: { id }, select: { id: true, isDeleted: true } })

    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 400 })
    }

    const category = await restoreCategory(id)

    return NextResponse.json({ category }, { status: 200 })
  } catch (error) {

    console.error("Error restoring category:", error)
    return NextResponse.json({ message: "Failed to restore category" }, { status: 500 })
  }
}
