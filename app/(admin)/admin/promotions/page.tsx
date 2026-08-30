import * as React from "react"
import type { Metadata } from "next"
import { HeroSlidesManager } from "@/components/admin/promotions/hero-slides-manager"
import { CampaignsManager } from "@/components/admin/promotions/campaigns-manager"

export const metadata: Metadata = {
  title: "Promotions & Hero Banners — Flex Aura Admin",
  description: "Manage homepage hero slides, campaign banners, and promotional landing pages.",
}

export default function AdminPromotionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Promotions &amp; Marketing Banners
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure homepage hero carousel slides, featured collections, and promotional campaign messages.
        </p>
      </div>

      <HeroSlidesManager />
      <CampaignsManager />
    </div>
  )
}
