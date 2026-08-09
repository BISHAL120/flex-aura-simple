import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { PageShell } from "@/components/site/page-shell"
import { HeroCarousel } from "@/components/site/hero-carousel"
import { SectionHeading } from "@/components/site/section-heading"
import { ProductGrid } from "@/components/site/product-grid"
import { FeatureCards } from "@/components/site/feature-cards"
import { Perks } from "@/components/site/perks"
import { Reviews } from "@/components/site/reviews"
import { FAQ } from "@/components/site/faq"
import { Newsletter } from "@/components/site/newsletter"
import { Button } from "@/components/ui/button"
import { getBestSellers, getNewArrivals } from "@/lib/data"

export const metadata: Metadata = {
  title: "Flex Aura — Laser-Cut Metal Art",
  description:
    "Precision laser-cut 2mm metal wall art of your favourite cars, bikes and custom designs — premium black powder coat, custom sizes, backlit LED options.",
}

export default function Page() {
  const bestSellers = getBestSellers()
  const newArrivals = getNewArrivals()

  return (
    <PageShell>
      <HeroCarousel />

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
            variant="outline"
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
    </PageShell>
  )
}
