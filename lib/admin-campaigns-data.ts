/** Admin/UI-facing shape for a campaign (homepage feature card). */
export type AdminCampaign = {
  id: string
  slug: string
  title: string
  description: string
  image: string
  badge: string
  ctaLabel: string
  productIds: string[]
  isActive: boolean
  isDeleted: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
