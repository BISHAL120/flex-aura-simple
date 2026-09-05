import type { Metadata } from "next"
import { HeroSlideForm } from "@/components/admin/hero-sliders/hero-slide-form"
import { getNextHeroSlideOrder } from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"

export const metadata: Metadata = {
  title: "New Hero Slide — Flex Aura Admin",
  description: "Create and publish a new homepage hero carousel slide.",
}

export default async function AdminNewHeroSlidePage() {
  const nextOrder = await getNextHeroSlideOrder()

  return <HeroSlideForm mode="create" nextOrder={nextOrder} />
}
