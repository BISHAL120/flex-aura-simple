import db from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export interface HeroSlideListResult {
  slides: Prisma.HeroSlideGetPayload<object>[]
  counts: {
    total: number
    active: number
    deleted: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const getAllHeroSlides = async (
  page: number = 1,
  per_page: number = 8,
  search: string = "",
  deletedOnly: boolean = false,
  activeOnly: boolean = false,
): Promise<HeroSlideListResult> => {
  try {
    const skip = (page - 1) * per_page
    const limit = per_page

    // Active scope by default; deletedOnly shows the trash.
    const where: Prisma.HeroSlideWhereInput = { isDeleted: deletedOnly }
    if (activeOnly) where.isActive = true

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { subtitle: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
      ]
    }

    const total = await db.heroSlide.count({ where })

    const [activeCount, deletedCount] = await Promise.all([
      db.heroSlide.count({ where: { isDeleted: false, isActive: true } }),
      db.heroSlide.count({ where: { isDeleted: true } }),
    ])

    const slides = await db.heroSlide.findMany({
      where,
      take: limit,
      skip,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return {
      slides,
      counts: { total, active: activeCount, deleted: deletedCount },
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
    console.error("Error fetching hero slides:", error)
    throw new Error("Failed to fetch hero slides")
  }
}

export const getHeroSlideById = async (id: string) => {
  try {
    return await db.heroSlide.findFirst({
      where: { id, isDeleted: false },
    })
  } catch (error) {
    console.error(`Error fetching hero slide ${id}:`, error)
    throw new Error("Failed to fetch hero slide")
  }
}

export const createHeroSlide = async (data: {
  title: string
  subtitle: string
  image: string
  alt: string
  ctaLabel: string
  ctaHref: string
  order: number
  isActive?: boolean
}) => {
  try {
    return await db.heroSlide.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        alt: data.alt,
        ctaLabel: data.ctaLabel,
        ctaHref: data.ctaHref,
        order: data.order,
        isActive: data.isActive ?? true,
      },
    })
  } catch (error) {
    console.error("Error creating hero slide:", error)
    throw new Error("Failed to create hero slide")
  }
}

export const updateHeroSlide = async (
  id: string,
  data: Partial<{
    title: string
    subtitle: string
    image: string
    alt: string
    ctaLabel: string
    ctaHref: string
    order: number
    isActive: boolean
  }>,
) => {
  try {
    return await db.heroSlide.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.alt !== undefined && { alt: data.alt }),
        ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel }),
        ...(data.ctaHref !== undefined && { ctaHref: data.ctaHref }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  } catch (error) {
    console.error(`Error updating hero slide ${id}:`, error)
    throw new Error("Failed to update hero slide")
  }
}

export const softDeleteHeroSlide = async (id: string) => {
  try {
    return await db.heroSlide.update({
      where: { id },
      data: { isDeleted: true },
    })
  } catch (error) {
    console.error(`Error deleting hero slide ${id}:`, error)
    throw new Error("Failed to delete hero slide")
  }
}

export const restoreHeroSlide = async (id: string) => {
  try {
    return await db.heroSlide.update({
      where: { id },
      data: { isDeleted: false },
      select: { id: true, isDeleted: true, title: true },
    })
  } catch (error) {
    console.error(`Error restoring hero slide ${id}:`, error)
    throw new Error("Failed to restore hero slide")
  }
}

export const permanentDeleteHeroSlide = async (id: string) => {
  try {
    return await db.heroSlide.delete({
      where: { id },
    })
  } catch (error) {
    console.error(`Error permanently deleting hero slide ${id}:`, error)
    throw new Error("Failed to permanently delete hero slide")
  }
}

/** Storefront query: active, non-deleted slides ordered by sort order. */
export const getActiveHeroSlides = async (limit = 10) => {
  try {
    return await db.heroSlide.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching active hero slides:", error)
    throw new Error("Failed to fetch active hero slides")
  }
}

/** Next available sort order for a new slide. */
export const getNextHeroSlideOrder = async () => {
  try {
    const last = await db.heroSlide.findFirst({
      where: { isDeleted: false },
      orderBy: { order: "desc" },
      select: { order: true },
    })
    return (last?.order ?? -1) + 1
  } catch (error) {
    console.error("Error getting next hero slide order:", error)
    throw new Error("Failed to get next hero slide order")
  }
}
