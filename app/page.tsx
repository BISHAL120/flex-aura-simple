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
import { getBestSellers, getNewArrivals } from "@/lib/data"

export default function Page() {
  const bestSellers = getBestSellers()
  const newArrivals = getNewArrivals()

  return (
    <PageShell>
      <HeroCarousel />

      <section id="best-sellers" aria-labelledby="best-sellers-heading" className="scroll-mt-20 py-14 sm:py-20">
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading
            eyebrow="Bestsellers"
            title="Best Sellers"
            description="The pieces our customers keep coming back for."
          />
        </Container>
        <ProductGrid products={bestSellers} priority />
      </section>

      <section aria-labelledby="offers-heading" className="pb-14 sm:pb-20">
        <Container className="mb-8">
          <SectionHeading
            eyebrow="Offers"
            title="Live promotions"
            description="Two campaigns running right now — tap through to shop the deal."
          />
        </Container>
        <FeatureCards />
      </section>

      <section id="new-arrivals" aria-labelledby="new-arrivals-heading" className="scroll-mt-20 py-14 sm:py-20">
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading
            eyebrow="Just landed"
            title="New Arrivals"
            description="Fresh drops added this week across tech, fashion and home."
          />
        </Container>
        <ProductGrid products={newArrivals} />
      </section>

      <section aria-labelledby="perks-heading" className="pb-14 sm:pb-20">
        <Perks />
      </section>

      <section aria-labelledby="reviews-heading" className="py-14 sm:py-20">
        <Reviews />
      </section>

      <section aria-labelledby="faq-heading" className="pb-14 sm:pb-20">
        <FAQ />
      </section>

      <section aria-labelledby="newsletter-heading" className="pb-14 sm:pb-20">
        <Newsletter />
      </section>
    </PageShell>
  )
}
