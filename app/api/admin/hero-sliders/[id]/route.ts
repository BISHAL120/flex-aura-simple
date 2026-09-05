import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import {
  softDeleteHeroSlide,
  updateHeroSlide,
} from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"
import { mapHeroSlideToAdminHeroSlide } from "@/lib/data-layer/admin/hero-sliders/hero-slider-mapper"
import { deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"
import { heroSlideSchema } from "@/lib/validators"
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
      return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 })
    }

    const body = await request.json()

    const parsed = heroSlideSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid hero slide data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const existing = await db.heroSlide.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Hero slide not found" }, { status: 404 })
    }

    // New image uploaded while editing — remove the old Firebase image after
    // the DB record points at the new one.
    if (data.image !== undefined && data.image !== existing.image) {
      const oldImage = existing.image
      const slide = await updateHeroSlide(id, {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle.trim() }),
        ...(data.image !== undefined && { image: data.image.trim() }),
        ...(data.alt !== undefined && { alt: data.alt.trim() }),
        ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel.trim() }),
        ...(data.ctaHref !== undefined && { ctaHref: data.ctaHref.trim() }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })

      // Best-effort cleanup of the replaced Firebase image.
      await deleteFirebaseImageSafe(oldImage)

      return NextResponse.json({ slide: mapHeroSlideToAdminHeroSlide(slide) }, { status: 200 })
    }

    const slide = await updateHeroSlide(id, {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle.trim() }),
      ...(data.image !== undefined && { image: data.image.trim() }),
      ...(data.alt !== undefined && { alt: data.alt.trim() }),
      ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel.trim() }),
      ...(data.ctaHref !== undefined && { ctaHref: data.ctaHref.trim() }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })

    return NextResponse.json({ slide: mapHeroSlideToAdminHeroSlide(slide) }, { status: 200 })
  } catch (error) {
    console.error("Error updating hero slide:", error)
    return NextResponse.json({ message: "Failed to update hero slide" }, { status: 500 })
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
      return NextResponse.json({ message: "Invalid hero slide id" }, { status: 400 })
    }

    const existing = await db.heroSlide.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Hero slide not found" }, { status: 404 })
    }

    await softDeleteHeroSlide(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting hero slide:", error)
    return NextResponse.json({ message: "Failed to delete hero slide" }, { status: 500 })
  }
}
