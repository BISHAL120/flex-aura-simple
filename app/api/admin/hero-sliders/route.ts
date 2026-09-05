import { NextRequest, NextResponse } from "next/server"
import {
  createHeroSlide,
  getAllHeroSlides,
} from "@/lib/data-layer/admin/hero-sliders/hero-slider-data-layer"
import { mapHeroSlideToAdminHeroSlide } from "@/lib/data-layer/admin/hero-sliders/hero-slider-mapper"
import { heroSlideSchema } from "@/lib/validators"
import { requireAdminApi } from "@/lib/check-Access"

const VALID_PAGE_SIZES = [8, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 8

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const searchParams = request.nextUrl.searchParams
    const search = (searchParams.get("search") || "").trim()
    const deleted = searchParams.get("deleted") === "1"

    const parsedPage = Number(searchParams.get("page"))
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

    const parsedSize = Number(searchParams.get("per_page"))
    const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

    const result = await getAllHeroSlides(page, pageSize, search, deleted)

    return NextResponse.json(
      {
        slides: result.slides.map(mapHeroSlideToAdminHeroSlide),
        counts: result.counts,
        pagination: result.pagination,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching hero slides:", error)
    return NextResponse.json({ message: "Failed to fetch hero slides" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const body = await request.json()

    const parsed = heroSlideSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid hero slide data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const slide = await createHeroSlide({
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      image: data.image.trim(),
      alt: data.alt.trim(),
      ctaLabel: data.ctaLabel.trim(),
      ctaHref: data.ctaHref.trim(),
      order: data.order,
      isActive: data.isActive,
    })

    return NextResponse.json({ slide: mapHeroSlideToAdminHeroSlide(slide) }, { status: 201 })
  } catch (error) {
    console.error("Error creating hero slide:", error)
    return NextResponse.json({ message: "Failed to create hero slide" }, { status: 500 })
  }
}
