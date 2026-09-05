import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import { restoreHeroSlide } from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"
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
      return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 })
    }

    const existing = await db.heroSlide.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    })

    if (!existing) {
      return NextResponse.json({ message: "Hero slide not found" }, { status: 404 })
    }

    const slide = await restoreHeroSlide(id)

    return NextResponse.json({ slide }, { status: 200 })
  } catch (error) {
    console.error("Error restoring hero slide:", error)
    return NextResponse.json({ message: "Failed to restore hero slide" }, { status: 500 })
  }
}
