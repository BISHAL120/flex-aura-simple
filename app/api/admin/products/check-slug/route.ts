import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import { requireAdminApi } from "@/lib/check-Access"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const slug = request.nextUrl.searchParams.get("slug")
    const excludeId = request.nextUrl.searchParams.get("excludeId")

    if (!slug || !slug.trim()) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 })
    }

    const count = await db.product.count({
      where: {
        slug: slug.trim(),
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })

    return NextResponse.json({ exists: count > 0 }, { status: 200 })
  } catch (error) {
    console.error("Error checking product slug:", error)
    return NextResponse.json({ message: "Failed to check slug" }, { status: 500 })
  }
}
