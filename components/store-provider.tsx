"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"
import { formatPrice, products, type Product } from "@/lib/data"

const productsById = new Map(products.map((p) => [p.id, p]))

export type CartItem = {
  product: Product
  variant: string
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
        typeof (item as StoredCartItem).quantity === "number"
    )
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    // Rehydrate from localStorage on the client only. SSR renders an empty
    // cart so server and client HTML always match.
    const stored = readStoredCart()
    if (stored.length === 0) return []
    return stored.flatMap((item) => {
      const product = productsById.get(item.productId)
      if (!product) return []
      return [{ product, variant: item.variant, quantity: item.quantity }]
    })
  })
  const [cartOpen, setCartOpen] = React.useState(false)
  const hydratedRef = React.useRef(false)

  // Persist on every change after the first client render.
  React.useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true
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

  const addToCart = React.useCallback((product: Product, variant: string) => {
    let wasEmpty = false
    setCartItems((items) => {
      wasEmpty = items.length === 0
      const key = cartItemKey(product.id, variant)
      const existing = items.find((item) => cartItemKey(item.product.id, item.variant) === key)
      if (existing) {
        return items.map((item) =>
          cartItemKey(item.product.id, item.variant) === key
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) }
            : item
        )
      }
      return [...items, { product, variant, quantity: 1 }]
    })
    // Auto-open the sheet only when the cart was empty, so it doesn't fight
    // the user while they keep adding items.
    if (wasEmpty) setCartOpen(true)
    toast.add({
      type: "success",
      title: "Added to cart",
      description: `${product.name} (${variant}) — ${formatPrice(product.price)}`,
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
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
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
