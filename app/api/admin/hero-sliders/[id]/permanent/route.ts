import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import { permanentDeleteHeroSlide } from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"
import { deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"
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
      return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 })
    }

    const existing = await db.heroSlide.findFirst({ where: { id, isDeleted: true } })
    if (!existing) {
      return NextResponse.json({ message: "Hero slide not found" }, { status: 404 })
    }

    await permanentDeleteHeroSlide(id)

    // Remove the Firebase image now that the DB record is gone. Best-effort:
    // a missing object or bad URL must not fail the permanent delete.
    await deleteFirebaseImageSafe(existing.image)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error permanently deleting hero slide:", error)
    return NextResponse.json(
      { message: "Failed to permanently delete hero slide" },
      { status: 500 }
    )
  }
}
