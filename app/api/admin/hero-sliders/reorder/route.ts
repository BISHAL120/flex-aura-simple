import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/prisma"
import { requireAdminApi } from "@/lib/check-Access"

/**
 * Moves one hero slide up or down in the carousel order.
 *
 * The server computes the current canonical ordering of active (non-deleted)
 * slides itself, then swaps the target slide with its neighbor and persists
 * the normalized sequence. This makes the operation safe against stale client
 * arrays and concurrent edits — the client only supplies the slide id and the
 * direction, never the full ordering.
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const id: unknown = body?.id
    const direction: unknown = body?.direction

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 })
    }
    if (direction !== 1 && direction !== -1) {
      return NextResponse.json({ message: "direction must be 1 or -1" }, { status: 400 })
    }

    // Canonical active ordering, as displayed in the admin table.
    const slides = await db.heroSlide.findMany({
      where: { isDeleted: false },
      select: { id: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    const index = slides.findIndex((s) => s.id === id)
    if (index === -1) {
      return NextResponse.json({ message: "Hero slide not found" }, { status: 404 })
    }

    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= slides.length) {
      return NextResponse.json({ message: "Slide is already at the edge" }, { status: 400 })
    }

    // Swap the two slides in the canonical list, then persist the normalized
    // order for every active slide so there are never duplicate order values.
    const reordered = [...slides]
    reordered[index] = slides[targetIndex]
    reordered[targetIndex] = slides[index]

    await db.$transaction(
      reordered.map((slide, order) =>
        db.heroSlide.update({
          where: { id: slide.id },
          data: { order },
        })
      )
    )

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error reordering hero slides:", error)
    return NextResponse.json({ message: "Failed to reorder hero slides" }, { status: 500 })
  }
}
