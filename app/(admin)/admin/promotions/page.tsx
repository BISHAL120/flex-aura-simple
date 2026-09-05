import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
          Manage promotional campaign messages and featured collections.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm font-semibold tracking-tight">
            Homepage Hero Carousel
          </span>
          <span className="text-xs text-muted-foreground">
            Add, edit, reorder, and publish the slides shown on the store homepage.
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

      <CampaignsManager />
    </div>
  )
}
