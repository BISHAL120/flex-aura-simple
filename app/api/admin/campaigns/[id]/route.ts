import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import db from "@/lib/prisma"
import {
  updateCampaign,
} from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapCampaignToAdminCampaign } from "@/lib/data-layer/admin/campaigns/campaign-mapper"
import { campaignSchema } from "@/lib/validators"
import { requireAdminApi } from "@/lib/check-Access"
import { deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid campaign id" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = campaignSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid campaign data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const existing = await db.campaign.findFirst({ where: { id, isDeleted: false } })
    if (!existing) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 })
    }

    // Slug uniqueness check on another campaign.
    if (data.slug !== undefined) {
      const slugExists = await db.campaign.findFirst({
        where: { slug: data.slug.trim(), id: { not: id }, isDeleted: false },
      })
      if (slugExists) {
        return NextResponse.json({ message: "A campaign with this slug already exists" }, { status: 409 })
      }
    }

    const wasImageChanged = data.image !== undefined && data.image !== existing.image
    const campaign = await updateCampaign(id, {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.badge !== undefined && { badge: data.badge }),
      ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })

    // Best-effort cleanup of a replaced Firebase image, after the DB write.
    if (wasImageChanged) {
      await deleteFirebaseImageSafe(existing.image)
    }

    return NextResponse.json({ campaign: mapCampaignToAdminCampaign(campaign) }, { status: 200 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 })
    }
    console.error("Error updating campaign:", error)
    return NextResponse.json({ message: "Failed to update campaign" }, { status: 500 })
  }
}
