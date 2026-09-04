import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import db from "@/lib/prisma"
import { createCategory } from "@/lib/data-layer/admin/categories/category-data-layer"
import { mapCategoryToAdminCategory } from "@/lib/data-layer/admin/categories/category-mapper"
import { categorySchema } from "@/lib/validators"
import { requireAdminApi } from "@/lib/check-Access"

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const body = await request.json()

    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid category data" },
        { status: 400 }
      )
    }

    // Check if slug is already exist
    const existingCategory = await db.category.findUnique({
      where: {
        slug: parsed.data.slug.trim(),
      },
    })
    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this slug already exists" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const category = await createCategory({
      name: data.name.trim(),
      slug: data.slug.trim(),
      imageUrl: data.image.trim(),
      description: data.description.trim(),
      tags: data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      featured: data.featured,
    })

    return NextResponse.json({ category: mapCategoryToAdminCategory(category) }, { status: 201 })
  } catch (error) {
    // Race: another request created the same slug between pre-check and create.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "A category with this slug already exists" },
        { status: 409 }
      )
    }
    console.error("Error creating category:", error)
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    )
  }
}
