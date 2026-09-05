import { HeroCarouselContent } from "@/components/site/hero-carousel-content"
import { getActiveHeroSlides } from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"

/** Server wrapper that loads active hero slides from the DB for the homepage. */
export async function HeroCarousel() {
  const slides = await getActiveHeroSlides()

  if (slides.length === 0) return null

  return (
    <HeroCarouselContent
      slides={slides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        alt: slide.alt,
        ctaLabel: slide.ctaLabel,
        ctaHref: slide.ctaHref,
      }))}
    />
  )
}
