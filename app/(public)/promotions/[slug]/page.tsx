import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/container"
import { ProductGrid } from "@/components/site/product-grid"
import { SectionHeading } from "@/components/site/section-heading"
import { Newsletter } from "@/components/public/contact/newsletter"
import { Badge } from "@/components/ui/badge"
import {
  getCampaignBySlug,
  getCampaignProducts,
} from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapProductToStoreProduct } from "@/lib/data-layer/admin/products/product-mapper"

// Campaign pages resolve their content and featured products from the DB, so
// keep them fresh rather than baking a build-time snapshot into the HTML.
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign) return {}
  return {
    title: `${campaign.title} — Flex Aura`,
    description: campaign.description,
  }
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)

  if (!campaign) {
    notFound()
  }

  const campaignProducts = (await getCampaignProducts(campaign)).map(
    mapProductToStoreProduct
  )

  return (
    <div>
      {/* Campaign hero banner */}
      <section className="relative flex min-h-80 items-center sm:min-h-100">
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-black/10" />
        <Container className="relative text-white">
          <div className="max-w-xl">
            <Badge className="mb-4 bg-white text-black">{campaign.badge}</Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {campaign.title}
            </h1>
            <p className="mt-3 text-sm text-white/85 sm:text-base">
              {campaign.description}
            </p>
          </div>
        </Container>
      </section>

      {/* Campaign products */}
      <section className="py-14 sm:py-20">
        <Container className="mb-8">
          <SectionHeading
            eyebrow={campaign.badge}
            title={`Shop ${campaign.title}`}
            description={
              campaignProducts.length > 0
                ? `${campaignProducts.length} handpicked products included in this promotion.`
                : "Products for this collection are being added — check back soon."
            }
          />
        </Container>
        {campaignProducts.length > 0 ? (
          <ProductGrid products={campaignProducts} />
        ) : (
          <Container>
            <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
              No products have been added to this collection yet.
            </div>
          </Container>
        )}
      </section>

      <section className="pb-14 sm:pb-20">
        <Newsletter />
      </section>
    </div>
  )
}
