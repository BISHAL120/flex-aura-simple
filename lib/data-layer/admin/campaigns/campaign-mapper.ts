import type { Campaign } from "@prisma/client"
import type { AdminCampaign } from "@/lib/admin-campaigns-data"

export function mapCampaignToAdminCampaign(campaign: Campaign): AdminCampaign {
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    description: campaign.description,
    image: campaign.image,
    badge: campaign.badge,
    ctaLabel: campaign.ctaLabel,
    productIds: campaign.productIds,
    isActive: campaign.isActive,
    isDeleted: campaign.isDeleted,
    sortOrder: campaign.sortOrder,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  }
}

export function mapCampaignsToAdminCampaigns(campaigns: Campaign[]): AdminCampaign[] {
  return campaigns.map(mapCampaignToAdminCampaign)
}
