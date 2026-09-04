export type AdminCategory = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  featured: boolean
  tags: string[]
  isActive: boolean
  isDeleted: boolean
  sortOrder: number | null
  icon: string | null
  color: string | null
  parentId: string | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}
