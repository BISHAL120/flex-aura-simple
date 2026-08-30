"use client"

import * as React from "react"
import { toast } from "@/components/ui/toast"
import {
  products as initialProductsList,
  campaigns as initialCampaignsList,
  heroSlides as initialHeroSlidesList,
  reviews as initialReviewsList,
  type Product,
  type Campaign,
  type HeroSlide,
  type Review,
} from "@/lib/data"
import {
  initialOrders,
  initialCustomOrders,
  initialStoreSettings,
  initialCategories,
  type AdminOrder,
  type CustomOrderInquiry,
  type OrderStatus,
  type CustomOrderStatus,
  type StoreSettings,
  type AdminCategory,
} from "@/lib/admin-data"

const ADMIN_STORAGE_KEY = "flex-aura-admin-data-v1"

type AdminStoreContextType = {
  hasHydrated: boolean
  products: Product[]
  orders: AdminOrder[]
  customOrders: CustomOrderInquiry[]
  categories: AdminCategory[]
  campaigns: Campaign[]
  heroSlides: HeroSlide[]
  reviews: Review[]
  settings: StoreSettings
  // Product actions
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  // Category actions
  addCategory: (category: Omit<AdminCategory, "id">) => void
  updateCategory: (id: string, data: Partial<AdminCategory>) => void
  deleteCategory: (id: string) => void
  // Order actions
  updateOrderStatus: (id: string, status: OrderStatus, trackingNumber?: string) => void
  updateOrderNotes: (id: string, notes: string) => void
  // Custom order actions
  updateCustomOrderStatus: (
    id: string,
    status: CustomOrderStatus,
    quotedPrice?: number,
    notes?: string
  ) => void
  // Settings actions
  updateSettings: (data: Partial<StoreSettings>) => void
  // Campaign & Hero actions
  updateCampaign: (slug: string, data: Partial<Campaign>) => void
  updateHeroSlide: (id: string, data: Partial<HeroSlide>) => void
  // Review actions
  deleteReview: (idOrName: string, date?: string) => void
  // Reset
  resetToDefaults: () => void
}

const AdminStoreContext = React.createContext<AdminStoreContextType | null>(null)

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [hasHydrated, setHasHydrated] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>(initialProductsList)
  const [orders, setOrders] = React.useState<AdminOrder[]>(initialOrders)
  const [customOrders, setCustomOrders] = React.useState<CustomOrderInquiry[]>(initialCustomOrders)
  const [categories, setCategories] = React.useState<AdminCategory[]>(initialCategories)
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(initialCampaignsList)
  const [heroSlides, setHeroSlides] = React.useState<HeroSlide[]>(initialHeroSlidesList)
  const [reviews, setReviews] = React.useState<Review[]>(() =>
    initialReviewsList.map((r, i) => ({ ...r, id: r.id ?? `rev-${i + 1}` }))
  )
  const [settings, setSettings] = React.useState<StoreSettings>(initialStoreSettings)

  // Hydrate from localStorage once on mount with strict schema validation
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.products)) {
            setProducts(
              parsed.products.filter(
                (p: unknown): p is Product =>
                  Boolean(p && typeof p === "object" && "id" in p && "name" in p && "price" in p)
              )
            )
          }
          if (Array.isArray(parsed.orders)) {
            setOrders(
              parsed.orders.filter(
                (o: unknown): o is AdminOrder =>
                  Boolean(o && typeof o === "object" && "id" in o && "orderNumber" in o)
              )
            )
          }
          if (Array.isArray(parsed.customOrders)) {
            setCustomOrders(
              parsed.customOrders.filter(
                (c: unknown): c is CustomOrderInquiry =>
                  Boolean(c && typeof c === "object" && "id" in c && "inquiryNumber" in c)
              )
            )
          }
          if (Array.isArray(parsed.categories)) {
            setCategories(
              parsed.categories.filter(
                (cat: unknown): cat is AdminCategory =>
                  Boolean(cat && typeof cat === "object" && "id" in cat && "name" in cat && "slug" in cat)
              )
            )
          }
          if (Array.isArray(parsed.campaigns)) {
            setCampaigns(
              parsed.campaigns.filter(
                (cmp: unknown): cmp is Campaign =>
                  Boolean(cmp && typeof cmp === "object" && "slug" in cmp && "title" in cmp)
              )
            )
          }
          if (Array.isArray(parsed.heroSlides)) {
            setHeroSlides(
              parsed.heroSlides.filter(
                (s: unknown): s is HeroSlide =>
                  Boolean(s && typeof s === "object" && "id" in s && "title" in s)
              )
            )
          }
          if (Array.isArray(parsed.reviews)) {
            setReviews(
              parsed.reviews
                .filter(
                  (r: unknown): r is Review =>
                    Boolean(r && typeof r === "object" && "name" in r && "rating" in r)
                )
                .map((r, i) => ({ ...r, id: r.id ?? `rev-${i + 1}` }))
            )
          }
          if (parsed.settings && typeof parsed.settings === "object" && "storeName" in parsed.settings) {
            setSettings(parsed.settings)
          }
        }
      }
    } catch {
      // Storage unavailable or corrupted
    } finally {
      setHasHydrated(true)
    }
  }, [])

  // Persist to localStorage whenever data changes after hydration
  const hasHydratedRef = React.useRef(false)
  React.useEffect(() => {
    if (!hasHydratedRef.current) {
      if (hasHydrated) hasHydratedRef.current = true
      return
    }
    try {
      window.localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({
          products,
          orders,
          customOrders,
          categories,
          campaigns,
          heroSlides,
          reviews,
          settings,
        })
      )
    } catch {
      // ignore
    }
  }, [hasHydrated, products, orders, customOrders, categories, campaigns, heroSlides, reviews, settings])

  // Product Actions
  const addProduct = React.useCallback((newProductData: Omit<Product, "id">) => {
    const id = `p-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()}`
    const product: Product = { ...newProductData, id }
    setProducts((prev) => [product, ...prev])
    toast.add({
      type: "success",
      title: "Product added",
      description: `${product.name} has been published to the catalog.`,
    })
  }, [])

  const updateProduct = React.useCallback((id: string, data: Partial<Product>) => {
    let found = false
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          found = true
          return { ...item, ...data }
        }
        return item
      })
    )
    if (found) {
      toast.add({
        type: "success",
        title: "Product updated",
        description: "Changes have been saved.",
      })
    }
  }, [])

  const deleteProduct = React.useCallback((id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id))
    toast.add({
      type: "info",
      title: "Product removed",
      description: "Product was deleted from the catalog.",
    })
  }, [])

  // Category Actions
  const addCategory = React.useCallback((newCatData: Omit<AdminCategory, "id">) => {
    const id = `cat-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()}`
    const category: AdminCategory = { ...newCatData, id }
    setCategories((prev) => [...prev, category])
    toast.add({
      type: "success",
      title: "Category created",
      description: `${category.name} is now active.`,
    })
  }, [])

  const updateCategory = React.useCallback((id: string, data: Partial<AdminCategory>) => {
    let found = false
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          found = true
          return { ...cat, ...data }
        }
        return cat
      })
    )
    if (found) {
      toast.add({
        type: "success",
        title: "Category updated",
        description: "Category changes saved.",
      })
    }
  }, [])

  const deleteCategory = React.useCallback((id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
    toast.add({
      type: "info",
      title: "Category deleted",
      description: "Category was removed.",
    })
  }, [])

  // Order Actions
  const updateOrderStatus = React.useCallback(
    (id: string, status: OrderStatus, trackingNumber?: string) => {
      let found = false
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) return order
          found = true
          return {
            ...order,
            status,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
          }
        })
      )
      if (found) {
        toast.add({
          type: "success",
          title: "Order status updated",
          description: `Order updated to ${status}.`,
        })
      }
    },
    []
  )

  const updateOrderNotes = React.useCallback((id: string, notes: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, notes } : order))
    )
    toast.add({
      type: "info",
      title: "Notes saved",
      description: "Order notes updated successfully.",
    })
  }, [])

  // Custom Order Actions
  const updateCustomOrderStatus = React.useCallback(
    (
      id: string,
      status: CustomOrderStatus,
      quotedPrice?: number,
      notes?: string
    ) => {
      let found = false
      setCustomOrders((prev) =>
        prev.map((inquiry) => {
          if (inquiry.id !== id) return inquiry
          found = true
          return {
            ...inquiry,
            status,
            quotedPrice: quotedPrice !== undefined ? quotedPrice : inquiry.quotedPrice,
            notes: notes !== undefined ? notes : inquiry.notes,
          }
        })
      )
      if (found) {
        toast.add({
          type: "success",
          title: "Custom order updated",
          description: `Inquiry status changed to ${status}.`,
        })
      }
    },
    []
  )

  const updateSettings = React.useCallback((data: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }))
    toast.add({
      type: "success",
      title: "Settings saved",
      description: "Store configuration has been updated.",
    })
  }, [])

  const updateCampaign = React.useCallback((slug: string, data: Partial<Campaign>) => {
    let found = false
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.slug === slug) {
          found = true
          return { ...c, ...data }
        }
        return c
      })
    )
    if (found) {
      toast.add({
        type: "success",
        title: "Campaign updated",
        description: "Promotion details saved.",
      })
    }
  }, [])

  const updateHeroSlide = React.useCallback((id: string, data: Partial<HeroSlide>) => {
    let found = false
    setHeroSlides((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          found = true
          return { ...s, ...data }
        }
        return s
      })
    )
    if (found) {
      toast.add({
        type: "success",
        title: "Hero slide updated",
        description: "Homepage banner changes saved.",
      })
    }
  }, [])

  const deleteReview = React.useCallback((idOrName: string, date?: string) => {
    setReviews((prev) =>
      prev.filter((r) => {
        if (r.id && r.id === idOrName) return false
        if (date && r.name === idOrName && r.date === date) return false
        return true
      })
    )
    toast.add({
      type: "info",
      title: "Review removed",
      description: "Customer review was deleted.",
    })
  }, [])

  const resetToDefaults = React.useCallback(() => {
    setProducts(initialProductsList)
    setOrders(initialOrders)
    setCustomOrders(initialCustomOrders)
    setCategories(initialCategories)
    setCampaigns(initialCampaignsList)
    setHeroSlides(initialHeroSlidesList)
    setReviews(initialReviewsList.map((r, i) => ({ ...r, id: `rev-${i + 1}` })))
    setSettings(initialStoreSettings)
    try {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch {
      // ignore
    }
    toast.add({
      type: "info",
      title: "Reset complete",
      description: "All admin demo data reset to default seed state.",
    })
  }, [])

  const value = React.useMemo(
    () => ({
      hasHydrated,
      products,
      orders,
      customOrders,
      categories,
      campaigns,
      heroSlides,
      reviews,
      settings,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      updateOrderStatus,
      updateOrderNotes,
      updateCustomOrderStatus,
      updateSettings,
      updateCampaign,
      updateHeroSlide,
      deleteReview,
      resetToDefaults,
    }),
    [
      hasHydrated,
      products,
      orders,
      customOrders,
      categories,
      campaigns,
      heroSlides,
      reviews,
      settings,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      updateOrderStatus,
      updateOrderNotes,
      updateCustomOrderStatus,
      updateSettings,
      updateCampaign,
      updateHeroSlide,
      deleteReview,
      resetToDefaults,
    ]
  )

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  )
}

export function useAdminStore() {
  const context = React.useContext(AdminStoreContext)
  if (!context) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider")
  }
  return context
}
