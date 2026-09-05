import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, EditIcon, LayersIcon, MegaphoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllCampaigns, getCampaignProducts } from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapCampaignsToAdminCampaigns } from "@/lib/data-layer/admin/campaigns/campaign-mapper"

export const metadata: Metadata = {
  title: "Homepage Cards & Promotions — Flex Aura Admin",
  description: "Manage the two homepage feature cards, their content, and featured products.",
}

export default async function AdminPromotionsPage() {
  const campaigns = mapCampaignsToAdminCampaigns(await getAllCampaigns())

  const productCounts = new Map<string, number>()
  for (const campaign of campaigns) {
    const products = await getCampaignProducts(campaign)
    productCounts.set(campaign.id, products.length)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Homepage Feature Cards
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit the content of the two &quot;Custom &amp; Backlit&quot; cards on the homepage and
          choose which products appear on each card&apos;s landing page.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
          <MegaphoneIcon className="size-6" />
          <p>No feature cards yet. Add a campaign to show cards on the homepage.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {campaigns.map((campaign) => {
            const count = productCounts.get(campaign.id) ?? 0
            return (
              <div
                key={campaign.id}
                className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-xs"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <Badge className="mb-1 bg-white text-[10px] font-semibold text-black">
                        {campaign.badge}
                      </Badge>
                      <h3 className="font-heading text-base font-semibold">{campaign.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!campaign.isActive && (
                        <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                      )}
                      <span className="rounded bg-black/50 px-2 py-0.5 text-[11px] text-white/90">
                        {count} featured
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Mini metrics */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center rounded-md border bg-muted/30 p-2">
                      <LayersIcon className="size-3.5 text-primary" />
                      <span className="mt-0.5 text-sm font-bold">{count}</span>
                      <span className="text-[10px] text-muted-foreground">Products</span>
                    </div>
                    <div className="flex flex-col items-center rounded-md border bg-muted/30 p-2">
                      <span className="mt-0.5 text-sm font-bold">{campaign.ctaLabel}</span>
                      <span className="text-[10px] text-muted-foreground">Button</span>
                    </div>
                    <div className="flex flex-col items-center rounded-md border bg-muted/30 p-2">
                      <span className="mt-0.5 text-sm font-bold">/{campaign.slug}</span>
                      <span className="text-[10px] text-muted-foreground">Route</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      /promotions/{campaign.slug}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/promotions/${campaign.id}/products`} />}
                        nativeButton={false}
                        className="h-8 gap-1 text-xs"
                      >
                        <LayersIcon className="size-3.5" />
                        <span>Manage Products ({count})</span>
                      </Button>
                      <Button
                        size="sm"
                        render={<Link href={`/admin/promotions/${campaign.id}/edit`} />}
                        nativeButton={false}
                        className="h-8 gap-1 text-xs"
                      >
                        <EditIcon className="size-3.5" />
                        <span>Edit Card</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm font-semibold tracking-tight">
            Homepage Hero Carousel
          </span>
          <span className="text-xs text-muted-foreground">
            Add, edit, reorder, and publish the slides shown at the top of the store homepage.
          </span>
        </div>
        <Button
          size="sm"
          render={<Link href="/admin/hero-sliders" />}
          nativeButton={false}
          className="h-9 shrink-0 gap-1.5 text-xs"
        >
          Manage Hero Sliders
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
