import type { HeroSlide } from "@prisma/client"
import type { AdminHeroSlide } from "@/lib/admin-hero-sliders-data"

export function mapHeroSlideToAdminHeroSlide(slide: HeroSlide): AdminHeroSlide {
  return {
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    alt: slide.alt,
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref,
    order: slide.order,
    isActive: slide.isActive,
    isDeleted: slide.isDeleted,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString(),
  }
}

export function mapHeroSlidesToAdminHeroSlides(slides: HeroSlide[]): AdminHeroSlide[] {
  return slides.map(mapHeroSlideToAdminHeroSlide)
}
