import type { Category } from "@prisma/client"
import type { AdminCategory } from "@/lib/admin-categories-data"

export function mapCategoryToAdminCategory(cat: Category): AdminCategory {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
    image: cat.imageUrl,
    featured: cat.featured,
    tags: cat.tags,
    isActive: cat.isActive,
    isDeleted: cat.isDeleted,
    sortOrder: cat.sortOrder,
    icon: cat.icon,
    color: cat.color,
    parentId: cat.parentId,
    metaTitle: cat.metaTitle,
    metaDescription: cat.metaDescription,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }
}

export function mapCategoriesToAdminCategories(categories: Category[]): AdminCategory[] {
  return categories.map(mapCategoryToAdminCategory)
}
