import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import { permanentDeleteReview } from "@/lib/data-layer/admin/reviews/review-data-layer"
import { requireAdminApi } from "@/lib/check-Access"

export async function DELETE(
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

    const existing = await db.review.findFirst({ where: { id, isDeleted: true } })
    if (!existing) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    await permanentDeleteReview(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error permanently deleting review:", error)
    return NextResponse.json(
      { message: "Failed to permanently delete review" },
      { status: 500 }
    )
  }
}
