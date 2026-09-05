"use client"

import Image from "next/image"
import Link from "next/link"
import { ExternalLinkIcon, MegaphoneIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { campaigns, type Campaign } from "@/lib/data"

/**
 * Read-only preview of the storefront's featured campaigns.
 *
 * Campaigns are still defined statically in `lib/data.ts` and rendered on the
 * public site. Editing is intentionally disabled until campaigns are migrated
 * to the database — an edit control that only showed a toast and persisted
 * nothing would silently mislead admins into thinking changes were saved.
 */
export function CampaignsManager() {
  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading flex items-center gap-2 text-lg font-semibold tracking-tight">
          <MegaphoneIcon className="size-4 text-primary" />
          Featured Campaigns &amp; Promotional Pages
        </CardTitle>
        <CardDescription className="text-xs">
          Landing pages, banner callouts, and curated product collections shown on the storefront.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        {campaigns.map((campaign: Campaign) => (
          <div
            key={campaign.slug}
            className="flex flex-col overflow-hidden rounded-lg border bg-muted/20"
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
                  <Badge className="mb-1 bg-white font-semibold text-[10px] text-black">
                    {campaign.discount}
                  </Badge>
                  <h3 className="font-heading text-base font-semibold">{campaign.title}</h3>
                </div>
                <span className="text-[11px] text-white/80">
                  {campaign.productSlugs.length} featured items
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {campaign.description}
              </p>
              <div className="mt-auto flex items-center justify-between border-t pt-4 text-xs">
                <span className="font-mono text-[11px] text-muted-foreground">
                  /promotions/{campaign.slug}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/promotions/${campaign.slug}`} target="_blank" rel="noreferrer noopener" />}
                  nativeButton={false}
                  className="h-7 gap-1 text-xs"
                >
                  <ExternalLinkIcon className="size-3" />
                  <span>View page</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="border-t px-6 py-3">
        <p className="text-[11px] text-muted-foreground">
          Campaign content is read-only for now. Editing from the dashboard is coming once
          campaigns move to the database.
        </p>
      </div>
    </Card>
  )
}
