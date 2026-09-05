import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CampaignForm } from "@/components/admin/promotions/campaign-form"
import { getCampaignById } from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapCampaignToAdminCampaign } from "@/lib/data-layer/admin/campaigns/campaign-mapper"

export const metadata: Metadata = {
  title: "Edit Campaign Card — Flex Aura Admin",
  description: "Edit a homepage feature card's content and banner image.",
}

export default async function AdminEditCampaignPage({
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

  return <CampaignForm campaign={mapCampaignToAdminCampaign(dbCampaign)} />
}
