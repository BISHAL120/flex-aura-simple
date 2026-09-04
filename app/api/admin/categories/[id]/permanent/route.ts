import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import db from "@/lib/prisma"
import { permanentDeleteCategory } from "@/lib/data-layer/admin/categories/category-data-layer"
import { isAdmin } from "@/lib/check-Access"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    await isAdmin()

    const { id } = await params

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid category id" }, { status: 400 })
    }

    const existing = await db.category.findFirst({ where: { id, isDeleted: true } })
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 400 })
    }

    // TODO: Before delete check if any product is assigned to this category 
    

    await permanentDeleteCategory(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {

    console.error("Error permanently deleting category:", error)
    return NextResponse.json(
      { message: "Failed to permanently delete category" },
      { status: 500 }
    )
  }
}
