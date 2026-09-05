import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HeroSlideForm } from "@/components/admin/hero-sliders/hero-slide-form"
import { getHeroSlideById } from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"
import { mapHeroSlideToAdminHeroSlide } from "@/lib/data-layer/admin/hero-sliders/hero-slider-mapper"

export const metadata: Metadata = {
  title: "Edit Hero Slide — Flex Aura Admin",
  description: "Update a homepage hero carousel slide's content, image, and ordering.",
}

export default async function AdminEditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const dbSlide = await getHeroSlideById(id)

  if (!dbSlide) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Hero Slide Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          No hero slide matching ID &quot;{id}&quot; was found.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/hero-sliders" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Hero Sliders
        </Button>
      </div>
    )
  }

  return (
    <HeroSlideForm
      key={dbSlide.id}
      slide={mapHeroSlideToAdminHeroSlide(dbSlide)}
      mode="edit"
    />
  )
}
