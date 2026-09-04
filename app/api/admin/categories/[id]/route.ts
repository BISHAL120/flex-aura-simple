import { isAdmin } from "@/lib/check-Access"
import { checkCategorySlug } from "@/lib/data-layer/admin/categories/category-actions"
import { deleteCategory, updateCategory } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoryToAdminCategory } from "@/lib/data-layer/admin/categories/category-mapper"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"
import db from "@/lib/prisma"
import { categorySchema } from "@/lib/validators"
import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await isAdmin()

    const { id } = await params

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid category id" }, { status: 400 })
    }

    const body = await request.json()

    const parsed = categorySchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid category data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const existing = await db.category.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    // check if slug exist 
    const slugExists = await checkCategorySlug(existing.slug)
    if (slugExists) {
      return NextResponse.json({ message: "A category with this slug already exists" }, { status: 409 })
    }

    // if new image uploaded then detele the old image
    if (data.image !== existing.imageUrl) {
      try {
        await deleteFirebaseImage(existing.imageUrl)
      } catch (error) {
        console.error("Error deleting old image:", error)
        
      }
    }

    const category = await updateCategory(id, {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.slug !== undefined && { slug: data.slug.trim() }),
      ...(data.image !== undefined && { imageUrl: data.image.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.tags !== undefined && {
        tags: data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      }),
      ...(data.featured !== undefined && { featured: data.featured }),
    })

    return NextResponse.json({ category: mapCategoryToAdminCategory(category) }, { status: 200 })
  } catch (error) {
    
    console.error("Error updating category:", error)
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    )
  }
}

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

    const existing = await db.category.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    await deleteCategory(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    )
  }
}
