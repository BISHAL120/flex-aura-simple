import db from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const campaignProductInclude = {
  variants: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude

export type CampaignProduct = Prisma.ProductGetPayload<{
  include: typeof campaignProductInclude
}>

export const getAllCampaigns = async () => {
  try {
    return await db.campaign.findMany({
      where: { isDeleted: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    throw new Error("Failed to fetch campaigns")
  }
}

export const getCampaignById = async (id: string) => {
  try {
    return await db.campaign.findFirst({ where: { id, isDeleted: false } })
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error)
    throw new Error("Failed to fetch campaign")
  }
}

export const getCampaignBySlug = async (slug: string, activeOnly = false) => {
  try {
    return await db.campaign.findFirst({
      where: { slug, isDeleted: false, ...(activeOnly && { isActive: true }) },
    })
  } catch (error) {
    console.error(`Error fetching campaign by slug ${slug}:`, error)
    throw new Error("Failed to fetch campaign")
  }
}

/** Storefront: active campaigns (homepage feature cards), ordered. */
export const getActiveCampaigns = async (limit = 2) => {
  try {
    return await db.campaign.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching active campaigns:", error)
    throw new Error("Failed to fetch active campaigns")
  }
}

export interface CampaignWriteData {
  slug: string
  title: string
  description: string
  image: string
  badge: string
  ctaLabel: string
  isActive?: boolean
  sortOrder?: number
}

export const createCampaign = async (data: CampaignWriteData) => {
  try {
    return await db.campaign.create({
      data: {
        slug: data.slug.trim(),
        title: data.title.trim(),
        description: data.description.trim(),
        image: data.image.trim(),
        badge: data.badge.trim(),
        ctaLabel: data.ctaLabel.trim(),
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    })
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw new Error("Failed to create campaign")
  }
}

export const updateCampaign = async (
  id: string,
  data: Partial<Omit<CampaignWriteData, "slug"> & { slug?: string }>,
) => {
  try {
    return await db.campaign.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug.trim() }),
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.image !== undefined && { image: data.image.trim() }),
        ...(data.badge !== undefined && { badge: data.badge.trim() }),
        ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel.trim() }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error)
    throw new Error("Failed to update campaign")
  }
}

export const softDeleteCampaign = async (id: string) => {
  try {
    return await db.campaign.update({
      where: { id },
      data: { isDeleted: true },
    })
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error)
    throw new Error("Failed to delete campaign")
  }
}

export const restoreCampaign = async (id: string) => {
  try {
    return await db.campaign.update({
      where: { id },
      data: { isDeleted: false },
      select: { id: true, isDeleted: true, title: true },
    })
  } catch (error) {
    console.error(`Error restoring campaign ${id}:`, error)
    throw new Error("Failed to restore campaign")
  }
}

export const permanentDeleteCampaign = async (id: string) => {
  try {
    return await db.campaign.delete({ where: { id } })
  } catch (error) {
    console.error(`Error permanently deleting campaign ${id}:`, error)
    throw new Error("Failed to permanently delete campaign")
  }
}

// ---------------------------------------------------------------------------
// Campaign <-> Product management
// ---------------------------------------------------------------------------

/**
 * Fetches the active storefront products for a campaign, preserving the order
 * in which their ids appear in `campaign.productIds`.
 */
export const getCampaignProducts = async (campaign: { productIds: string[] }) => {
  if (campaign.productIds.length === 0) return []
  try {
    const products = await db.product.findMany({
      where: { id: { in: campaign.productIds }, isDeleted: false, isActive: true },
      include: campaignProductInclude,
    })
    const byId = new Map(products.map((p) => [p.id, p]))
    return campaign.productIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
  } catch (error) {
    console.error("Error fetching campaign products:", error)
    throw new Error("Failed to fetch campaign products")
  }
}

/** Adds a product id to a campaign if not already present. */
export const addProductToCampaign = async (campaignId: string, productId: string) => {
  try {
    return await db.campaign.update({
      where: { id: campaignId },
      data: { productIds: { push: productId } },
    })
  } catch (error) {
    console.error(`Error adding product ${productId} to campaign ${campaignId}:`, error)
    throw new Error("Failed to add product to campaign")
  }
}

/** Removes a product id from a campaign. */
export const removeProductFromCampaign = async (campaignId: string, productId: string) => {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { productIds: true },
    })
    if (!campaign) throw new Error("Campaign not found")
    return await db.campaign.update({
      where: { id: campaignId },
      data: {
        productIds: { set: campaign.productIds.filter((id) => id !== productId) },
      },
    })
  } catch (error) {
    console.error(`Error removing product ${productId} from campaign ${campaignId}:`, error)
    throw new Error("Failed to remove product from campaign")
  }
}
