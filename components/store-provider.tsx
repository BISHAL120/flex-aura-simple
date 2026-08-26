"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"
import { formatPrice, getVariantPrice, products, type Product } from "@/lib/data"

const productsById = new Map(products.map((p) => [p.id, p]))

export type CartItem = {
  product: Product
  variant: string
  /** Unit price for the selected variant, resolved at add time. */
  price: number
  quantity: number
}

export function cartItemKey(productId: string, variant: string) {
  return `${productId}__${variant}`
}

const CART_STORAGE_KEY = "flex-aura-cart"
const MAX_QUANTITY = 99

type StoredCartItem = {
  productId: string
  variant: string
  quantity: number
}

type StoreContextValue = {
  cartCount: number
  cartItems: CartItem[]
  subtotal: number
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (product: Product, variant: string) => void
  updateQuantity: (productId: string, variant: string, quantity: number) => void
  removeFromCart: (productId: string, variant: string) => void
  clearCart: () => void
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

function readStoredCart(): StoredCartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is StoredCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredCartItem).productId === "string" &&
        typeof (item as StoredCartItem).variant === "string" &&
        typeof (item as StoredCartItem).quantity === "number" &&
        Number.isFinite((item as StoredCartItem).quantity)
    )
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Start empty on both server and client so the hydration HTML always
  // matches. The persisted cart is read once after mount.
  const [cartItems, setCartItems] = React.useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = React.useState(false)

  // Rehydrate from localStorage once, after the first client render.
  React.useEffect(() => {
    const stored = readStoredCart()
    if (stored.length > 0) {
      const restored: CartItem[] = stored.flatMap((item) => {
        const product = productsById.get(item.productId)
        // Reject stale variants that no longer exist on the product, and clamp
        // any tampered quantity to the valid range.
        if (!product || !product.variants.some((v) => v.name === item.variant)) return []
        const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(item.quantity)))
        return [{ product, variant: item.variant, price: getVariantPrice(product, item.variant), quantity }]
      })
      if (restored.length > 0) {
        queueMicrotask(() => setCartItems(restored))
      }
    }
  }, [])

  // Persist whenever the cart changes (including after rehydration, which is
  // idempotent) once hydration has completed.
  const hasHydratedRef = React.useRef(false)
  React.useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      return
    }
    try {
      const stored: StoredCartItem[] = cartItems.map((item) => ({
        productId: item.product.id,
        variant: item.variant,
        quantity: item.quantity,
      }))
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // storage unavailable (private mode / quota) — cart still works in memory
    }
  }, [cartItems])

  const openCart = React.useCallback(() => setCartOpen(true), [])
  const closeCart = React.useCallback(() => setCartOpen(false), [])

  // Tracks whether the cart is currently empty so rapid clicks always agree on
  // whether to auto-open the sheet (avoids the batched-updater race).
  const isEmptyRef = React.useRef(true)
  React.useEffect(() => {
    isEmptyRef.current = cartItems.length === 0
  }, [cartItems])

  const addToCart = React.useCallback((product: Product, variant: string) => {
    const wasEmpty = isEmptyRef.current
    setCartItems((items) => {
      const key = cartItemKey(product.id, variant)
      const existing = items.find((item) => cartItemKey(item.product.id, item.variant) === key)
      if (existing) {
        return items.map((item) =>
          cartItemKey(item.product.id, item.variant) === key
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) }
            : item
        )
      }
      return [...items, { product, variant, price: getVariantPrice(product, variant), quantity: 1 }]
    })
    // Auto-open the sheet only when the cart was empty, so it doesn't fight
    // the user while they keep adding items.
    if (wasEmpty) setCartOpen(true)
    toast.add({
      type: "success",
      title: "Added to cart",
      description: `${product.name} (${variant}) — ${formatPrice(getVariantPrice(product, variant))}`,
    })
  }, [])

  const updateQuantity = React.useCallback(
    (productId: string, variant: string, quantity: number) => {
      setCartItems((items) =>
        quantity <= 0
          ? items.filter(
              (item) => cartItemKey(item.product.id, item.variant) !== cartItemKey(productId, variant)
            )
          : items.map((item) =>
              cartItemKey(item.product.id, item.variant) === cartItemKey(productId, variant)
                ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }
                : item
            )
      )
    },
    []
  )

  const removeFromCart = React.useCallback((productId: string, variant: string) => {
    setCartItems((items) =>
      items.filter(
        (item) => cartItemKey(item.product.id, item.variant) !== cartItemKey(productId, variant)
      )
    )
  }, [])

  const clearCart = React.useCallback(() => setCartItems([]), [])

  const cartCount = React.useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const subtotal = React.useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  const value = React.useMemo(
    () => ({
      cartCount,
      cartItems,
      subtotal,
      cartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cartCount,
      cartItems,
      subtotal,
      cartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = React.useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
