import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import db from "@/lib/prisma"
import {
  addProductToCampaign,
  removeProductFromCampaign,
} from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapCampaignToAdminCampaign } from "@/lib/data-layer/admin/campaigns/campaign-mapper"
import { requireAdminApi } from "@/lib/check-Access"

const bodySchema = z.object({ productId: z.string().min(1) })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success || typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 })
    }

    const campaign = await db.campaign.findFirst({ where: { id, isDeleted: false } })
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 })
    }

    const product = await db.product.findFirst({
      where: { id: parsed.data.productId, isDeleted: false, isActive: true },
    })
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    if (campaign.productIds.includes(product.id)) {
      return NextResponse.json(
        { message: "Product is already in this campaign" },
        { status: 400 }
      )
    }

    const updated = await addProductToCampaign(campaign.id, product.id)

    return NextResponse.json({ campaign: mapCampaignToAdminCampaign(updated) }, { status: 200 })
  } catch (error) {
    console.error("Error adding product to campaign:", error)
    return NextResponse.json({ message: "Failed to add product to campaign" }, { status: 500 })
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
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success || typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 })
    }

    const campaign = await db.campaign.findFirst({ where: { id, isDeleted: false } })
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 })
    }

    const updated = await removeProductFromCampaign(campaign.id, parsed.data.productId)

    return NextResponse.json({ campaign: mapCampaignToAdminCampaign(updated) }, { status: 200 })
  } catch (error) {
    console.error("Error removing product from campaign:", error)
    return NextResponse.json({ message: "Failed to remove product from campaign" }, { status: 500 })
  }
}
