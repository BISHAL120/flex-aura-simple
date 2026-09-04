export type AdminProductVariant = {
  name: string
  price: number
  compareAtPrice?: number
}

export type AdminProduct = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  image: string
  images: string[]
  badge?: string
  variants: AdminProductVariant[]
  rating: number
  reviewCount: number
  tags: string[]
  isActive: boolean
  isDeleted: boolean
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  createdAt: string
  updatedAt: string
}

export type AdminBadgeCount = {
  badge: string
  count: number
}
