import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { HeroSliderTable } from "@/components/admin/hero-sliders/hero-slider-table"
import {
  getAllHeroSlides,
} from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"
import { mapHeroSlidesToAdminHeroSlides } from "@/lib/data-layer/admin/hero-sliders/hero-slider-mapper"

export const metadata: Metadata = {
  title: "Hero Sliders — Flex Aura Admin",
  description: "Manage homepage hero carousel slides, banners, and their ordering.",
}

const VALID_PAGE_SIZES = [8, 12, 24]
const DEFAULT_PAGE_SIZE = 8

export default async function AdminHeroSlidersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = (params?.search || "").trim()
  const filter = params?.filter === "deleted" ? "deleted" : params?.filter === "active" ? "active" : "all"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const result = await getAllHeroSlides(
    page,
    pageSize,
    search,
    filter === "deleted",
    filter === "active"
  )
  const slides = mapHeroSlidesToAdminHeroSlides(result.slides)

  // If the requested page is out of range (e.g. after a filter narrows the
  // results), send the user back to a valid page in one round trip.
  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const redirectParams = new URLSearchParams()
    if (search) redirectParams.set("search", search)
    if (filter !== "all") redirectParams.set("filter", filter)
    if (pageSize !== DEFAULT_PAGE_SIZE) redirectParams.set("per_page", String(pageSize))
    redirectParams.set("page", "1")
    redirect(`/admin/hero-sliders?${redirectParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Hero Sliders
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage the high-impact banner slides displayed on the store homepage carousel.
        </p>
      </div>

      <HeroSliderTable
        slides={slides}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        activeCount={result.counts.active}
        totalCount={result.counts.total}
        deletedCount={result.counts.deleted}
        search={search}
        filter={filter}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
