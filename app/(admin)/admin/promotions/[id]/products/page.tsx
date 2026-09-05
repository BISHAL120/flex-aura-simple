import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CampaignProductsManager } from "@/components/admin/promotions/campaign-products-manager"
import {
  getCampaignById,
  getCampaignProducts,
} from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapCampaignToAdminCampaign } from "@/lib/data-layer/admin/campaigns/campaign-mapper"
import { getAllProducts } from "@/lib/data-layer/admin/products/product-data-layer"
import { mapProductsToAdminProducts } from "@/lib/data-layer/admin/products/product-mapper"

export const metadata: Metadata = {
  title: "Campaign Products — Flex Aura Admin",
  description: "Choose which products appear on a homepage feature card's landing page.",
}

export default async function AdminCampaignProductsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dbCampaign = await getCampaignById(id)

  if (!dbCampaign) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Campaign Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          No feature card matching ID &quot;{id}&quot; was found.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/promotions" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Homepage Cards
        </Button>
      </div>
    )
  }

  const campaign = mapCampaignToAdminCampaign(dbCampaign)
  const [selected, catalogResult] = await Promise.all([
    getCampaignProducts(dbCampaign),
    getAllProducts(1, 100, { activeOnly: true }),
  ])

  return (
    <CampaignProductsManager
      campaign={campaign}
      selectedProducts={mapProductsToAdminProducts(selected)}
      catalog={mapProductsToAdminProducts(catalogResult.products)}
    />
  )
}
