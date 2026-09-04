import db from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export interface CategoryListResult {
  categories: Prisma.CategoryGetPayload<object>[]
  counts: {
    total: number
    featured: number
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

export const getAllCategories = async (
  page: number = 1,
  per_page: number = 6,
  search: string = "",
  featured: boolean | null = null,
  deletedOnly: boolean = false,
  activeOnly: boolean = false,
): Promise<CategoryListResult> => {
  try {
    const skip = (page - 1) * per_page
    const limit = per_page

    // Active scope by default; deletedOnly shows the trash.
    const where: Prisma.CategoryWhereInput = { isDeleted: deletedOnly }
    if (activeOnly) where.isActive = true

    // Text search across name, slug, description, and tags (case-insensitive
    // contains, matching the user data layer pattern)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    if (featured !== null && featured !== undefined && !deletedOnly) {
      where.featured = featured
    }

    const total = await db.category.count({ where })

    const [featuredCount, deletedCount] = await Promise.all([
      db.category.count({ where: { isDeleted: false, featured: true } }),
      db.category.count({ where: { isDeleted: true } }),
    ])

    const categories = await db.category.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
    })

    return {
      categories,
      counts: { total, featured: featuredCount, deleted: deletedCount },
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
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

export const getCategoryById = async (id: string) => {
  try {
    return await db.category.findFirst({
      where: { id, isDeleted: false },
    })
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error)
    throw new Error("Failed to fetch category")
  }
}

export const getCategoryBySlug = async (slug: string, activeOnly = false) => {
  try {
    return await db.category.findFirst({
      where: { slug, isDeleted: false, ...(activeOnly && { isActive: true }) },
    })
  } catch (error) {
    console.error(`Error fetching category by slug ${slug}:`, error)
    throw new Error("Failed to fetch category by slug")
  }
}

export const createCategory = async (data: {
  name: string
  slug: string
  imageUrl: string
  description?: string | null
  tags?: string[]
  featured?: boolean
  icon?: string | null
  color?: string | null
  sortOrder?: number | null
  parentId?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
}) => {
  try {
    return await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl,
        description: data.description ?? null,
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        icon: data.icon ?? null,
        color: data.color ?? null,
        sortOrder: data.sortOrder ?? 0,
        parentId: data.parentId ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    })
  } catch (error) {
    console.error("Error creating category:", error)
    throw new Error("Failed to create category")
  }
}

export const updateCategory = async (
  id: string,
  data: {
    name?: string
    slug?: string
    imageUrl?: string
    description?: string | null
    tags?: string[]
    featured?: boolean
    icon?: string | null
    color?: string | null
    sortOrder?: number | null
    parentId?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
  },
) => {
  try {
    return await db.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && {
          metaDescription: data.metaDescription,
        }),
      },
    })
  } catch (error) {
    console.error(`Error updating category ${id}:`, error)
    throw new Error("Failed to update category")
  }
}

export const deleteCategory = async (id: string) => {
  try {
    return await db.category.update({
      where: { id },
      data: { isDeleted: true },
    })
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error)
    throw new Error("Failed to delete category")
  }
}

export const restoreCategory = async (id: string) => {
  try {
    return await db.category.update({
      where: { id },
      data: { isDeleted: false },
      select: { id: true, isDeleted: true, name: true }
    })
  } catch (error) {
    console.error(`Error restoring category ${id}:`, error)
    throw new Error("Failed to restore category")
  }
}

export const permanentDeleteCategory = async (id: string) => {
  try {
    return await db.category.delete({
      where: { id },
    })
  } catch (error) {
    console.error(`Error permanently deleting category ${id}:`, error)
    throw new Error("Failed to permanently delete category")
  }
}
