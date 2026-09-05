import { NextRequest, NextResponse } from "next/server"
import {
  createReview,
  getAllReviews,
} from "@/lib/data-layer/admin/reviews/review-data-layer"
import { mapReviewToAdminReview } from "@/lib/data-layer/admin/reviews/review-mapper"
import { reviewSchema } from "@/lib/validators"
import { requireAdminApi } from "@/lib/check-Access"

const VALID_PAGE_SIZES = [6, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 6

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const searchParams = request.nextUrl.searchParams
    const search = (searchParams.get("search") || "").trim()
    const deleted = searchParams.get("deleted") === "1"
    const active = searchParams.get("filter") === "active"

    const rawRating = searchParams.get("rating")
    const rating: number | "all" =
      rawRating === "5" || rawRating === "4" || rawRating === "3"
        ? Number(rawRating)
        : "all"

    const parsedPage = Number(searchParams.get("page"))
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

    const parsedSize = Number(searchParams.get("per_page"))
    const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

    const result = await getAllReviews(page, pageSize, search, rating, deleted, active)

    return NextResponse.json(
      {
        reviews: result.reviews.map(mapReviewToAdminReview),
        counts: result.counts,
        stats: result.stats,
        pagination: result.pagination,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ message: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const body = await request.json()

    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    const review = await createReview({
      name: data.name,
      rating: data.rating,
      date: data.date,
      title: data.title,
      body: data.body,
      isActive: data.isActive,
    })

    return NextResponse.json({ review: mapReviewToAdminReview(review) }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ message: "Failed to create review" }, { status: 500 })
  }
}
