import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/container"
import { ProductGrid } from "@/components/site/product-grid"
import { SectionHeading } from "@/components/site/section-heading"
import { Newsletter } from "@/components/public/contact/newsletter"
import { Badge } from "@/components/ui/badge"
import { campaigns, getCampaignBySlug, getProductsByIds } from "@/lib/data"

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const campaign = getCampaignBySlug(slug)
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
  const campaign = getCampaignBySlug(slug)

  if (!campaign) {
    notFound()
  }

  const campaignProducts = getProductsByIds(campaign.productIds)

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
              <Badge className="mb-4 bg-white text-black">{campaign.discount}</Badge>
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
              eyebrow={campaign.discount}
              title={`Shop ${campaign.title}`}
              description={`${campaignProducts.length} handpicked products included in this promotion.`}
            />
          </Container>
          <ProductGrid products={campaignProducts} />
        </section>

        <section className="pb-14 sm:pb-20">
          <Newsletter />
        </section>
    </div>
  )
}
