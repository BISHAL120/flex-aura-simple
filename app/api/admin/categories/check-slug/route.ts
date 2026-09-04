import db from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug")
    const excludeId = request.nextUrl.searchParams.get("excludeId")

    if (!slug || !slug.trim()) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 })
    }

    const count = await db.category.count({
      where: {
        slug: slug.trim(),
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })

    return NextResponse.json({ exists: count > 0 }, { status: 200 })
  } catch (error) {
    console.error("Error checking category slug:", error)
    return NextResponse.json({ message: "Failed to check slug" }, { status: 500 })
  }
}
