import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import db from "@/lib/prisma"
import {
  softDeleteReview,
  updateReview,
} from "@/lib/data-layer/admin/reviews/review-data-layer"
import { mapReviewToAdminReview } from "@/lib/data-layer/admin/reviews/review-mapper"
import { reviewSchema } from "@/lib/validators"
import { requireAdminApi } from "@/lib/check-Access"

export async function PATCH(
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

    const body = await request.json()
    const parsed = reviewSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const existing = await db.review.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    const review = await updateReview(id, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })

    return NextResponse.json({ review: mapReviewToAdminReview(review) }, { status: 200 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }
    console.error("Error updating review:", error)
    return NextResponse.json({ message: "Failed to update review" }, { status: 500 })
  }
}

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

    const existing = await db.review.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    await softDeleteReview(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ message: "Failed to delete review" }, { status: 500 })
  }
}
