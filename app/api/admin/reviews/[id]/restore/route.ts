import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import { restoreReview } from "@/lib/data-layer/admin/reviews/review-data-layer"
import { requireAdminApi } from "@/lib/check-Access"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid review id" }, { status: 400 })
    }

    const existing = await db.review.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    })
    if (!existing) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    const review = await restoreReview(id)

    return NextResponse.json({ review }, { status: 200 })
  } catch (error) {
    console.error("Error restoring review:", error)
    return NextResponse.json({ message: "Failed to restore review" }, { status: 500 })
  }
}
