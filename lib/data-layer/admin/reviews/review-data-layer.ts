import db from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { ReviewStats } from "@/lib/admin-reviews-data"

export interface ReviewListResult {
  reviews: Prisma.ReviewGetPayload<object>[]
  counts: {
    total: number
    active: number
    deleted: number
  }
  stats: ReviewStats
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const getAllReviews = async (
  page: number = 1,
  per_page: number = 6,
  search: string = "",
  ratingFilter: number | "all" = "all",
  deletedOnly: boolean = false,
  activeOnly: boolean = false,
): Promise<ReviewListResult> => {
  try {
    const skip = (page - 1) * per_page
    const limit = per_page

    const where: Prisma.ReviewWhereInput = { isDeleted: deletedOnly }
    if (activeOnly) where.isActive = true

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ]
    }

    if (ratingFilter !== "all") where.rating = ratingFilter

    const total = await db.review.count({ where })

    const [activeCount, deletedCount, statsAgg] = await Promise.all([
      db.review.count({ where: { isDeleted: false, isActive: true } }),
      db.review.count({ where: { isDeleted: true } }),
      db.review.aggregate({
        where: { isDeleted: false, isActive: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ])

    const [fiveStarsCount, fourStarsCount] = await Promise.all([
      db.review.count({ where: { isDeleted: false, isActive: true, rating: 5 } }),
      db.review.count({ where: { isDeleted: false, isActive: true, rating: 4 } }),
    ])

    const reviews = await db.review.findMany({
      where,
      take: limit,
      skip,
      orderBy: { date: "desc" },
    })

    return {
      reviews,
      counts: { total, active: activeCount, deleted: deletedCount },
      stats: {
        averageRating: Math.round((statsAgg._avg.rating ?? 0) * 10) / 10,
        fiveStarsCount,
        fourStarsCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    throw new Error("Failed to fetch reviews")
  }
}

export const getReviewById = async (id: string) => {
  try {
    return await db.review.findFirst({ where: { id, isDeleted: false } })
  } catch (error) {
    console.error(`Error fetching review ${id}:`, error)
    throw new Error("Failed to fetch review")
  }
}

export interface ReviewWriteData {
  name: string
  rating: number
  date: Date
  title: string
  body: string
  isActive?: boolean
}

export const createReview = async (data: ReviewWriteData) => {
  try {
    return await db.review.create({
      data: {
        name: data.name.trim(),
        rating: data.rating,
        date: data.date,
        title: data.title.trim(),
        body: data.body.trim(),
        isActive: data.isActive ?? true,
      },
    })
  } catch (error) {
    console.error("Error creating review:", error)
    throw new Error("Failed to create review")
  }
}

export const updateReview = async (
  id: string,
  data: Partial<ReviewWriteData>,
) => {
  try {
    return await db.review.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.body !== undefined && { body: data.body.trim() }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  } catch (error) {
    console.error(`Error updating review ${id}:`, error)
    throw new Error("Failed to update review")
  }
}

export const softDeleteReview = async (id: string) => {
  try {
    return await db.review.update({
      where: { id },
      data: { isDeleted: true },
    })
  } catch (error) {
    console.error(`Error deleting review ${id}:`, error)
    throw new Error("Failed to delete review")
  }
}

export const restoreReview = async (id: string) => {
  try {
    return await db.review.update({
      where: { id },
      data: { isDeleted: false },
      select: { id: true, isDeleted: true, name: true },
    })
  } catch (error) {
    console.error(`Error restoring review ${id}:`, error)
    throw new Error("Failed to restore review")
  }
}

export const permanentDeleteReview = async (id: string) => {
  try {
    return await db.review.delete({ where: { id } })
  } catch (error) {
    console.error(`Error permanently deleting review ${id}:`, error)
    throw new Error("Failed to permanently delete review")
  }
}

/** Storefront: active, non-deleted reviews newest first. */
export const getActiveReviews = async (limit = 20) => {
  try {
    return await db.review.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: { date: "desc" },
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching active reviews:", error)
    throw new Error("Failed to fetch active reviews")
  }
}
