import Link from "next/link"
import * as React from "react"
import type { Metadata } from "next"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { HeroCarousel } from "@/components/site/hero-carousel"
import { HeroCarouselSkeleton } from "@/components/site/hero-carousel-skeleton"
import { SectionHeading } from "@/components/site/section-heading"
import { ProductGrid } from "@/components/site/product-grid"
import { FeatureCards } from "@/components/site/feature-cards"
import { Perks } from "@/components/site/perks"
import { Reviews } from "@/components/site/reviews"
import { FAQ } from "@/components/site/faq"
import { Newsletter } from "@/components/public/contact/newsletter"
import { Button } from "@/components/ui/button"
import { getBestSellers, getNewArrivals } from "@/lib/data-layer/admin/products/product-data-layer"
import { getActiveCampaigns } from "@/lib/data-layer/admin/campaigns/campaign-data-layer"
import { mapProductToStoreProduct } from "@/lib/data-layer/admin/products/product-mapper"

export const metadata: Metadata = {
  title: "Flex Aura — Laser-Cut Metal Art",
  description:
    "Precision laser-cut 2mm metal wall art of your favourite cars, bikes and custom designs — premium black powder coat, custom sizes, backlit LED options.",
}

// The homepage renders DB-backed hero slides and product picks, so it must
// never be statically prerendered at build time (that would bake in stale
// content). Revalidate on a short budget so admin edits show up promptly.
export const revalidate = 60

export default async function Page() {
  const bestSellers = (await getBestSellers(4)).map(mapProductToStoreProduct)
  const newArrivals = (await getNewArrivals(4)).map(mapProductToStoreProduct)
  const campaignCount = (await getActiveCampaigns(2)).length

  return (
    <div>
      <React.Suspense fallback={<HeroCarouselSkeleton />}>
        <HeroCarousel />
      </React.Suspense>

      <section id="best-sellers" aria-labelledby="best-sellers-heading" className="scroll-mt-20 py-14 sm:py-20">
        <Container className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            id="best-sellers-heading"
            align="left"
            eyebrow="Bestsellers"
            title="Fan Favourites"
            description="The pieces our customers keep coming back for."
          />
          <Button
            variant="outline"
            render={<Link href="/shop" />}
            nativeButton={false}
            className="hidden shrink-0 sm:inline-flex"
          >
            View all
            <ArrowRightIcon />
          </Button>
        </Container>
        <ProductGrid products={bestSellers} priority />
        <Container className="mt-6 flex justify-center sm:hidden">
          <Button variant="outline" render={<Link href="/shop" />} nativeButton={false}>
            View all best sellers
            <ArrowRightIcon />
          </Button>
        </Container>
      </section>

      {campaignCount > 0 && (
        <section aria-labelledby="offers-heading" className="pb-14 sm:pb-20">
          <Container className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading
              id="offers-heading"
              align="left"
              eyebrow="Made to order"
              title="Custom & Backlit"
              description="Names, logos, dates and designs — cut in metal and lit with warm LEDs."
            />
            <Button
              render={<Link href="/shop" />}
              nativeButton={false}
              className="hidden shrink-0 sm:inline-flex"
            >
              View all
              <ArrowRightIcon />
            </Button>
          </Container>
          <FeatureCards />
        </section>
      )}

      <section id="new-arrivals" aria-labelledby="new-arrivals-heading" className="scroll-mt-20 py-14 sm:py-20">
        <Container className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            id="new-arrivals-heading"
            align="left"
            eyebrow="Just landed"
            title="New Drops"
            description="Fresh cuts added this week across cars, bikes and aviation."
          />
          <Button
            variant="outline"
            render={<Link href="/shop" />}
            nativeButton={false}
            className="hidden shrink-0 sm:inline-flex"
          >
            View all
            <ArrowRightIcon />
          </Button>
        </Container>
        <ProductGrid products={newArrivals} />
      </section>

      <section className="pb-14 sm:pb-20">
        <Perks />
      </section>

      <section className="py-14 sm:py-20">
        <Reviews />
      </section>

      <section className="pb-14 sm:pb-20">
        <FAQ />
      </section>

      <section className="pb-14 sm:pb-20">
        <Newsletter compact />
      </section>
    </div>
  )
}
