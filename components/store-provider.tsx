"use client"

import * as React from "react"
import {
  useCartStore,
  useCartCount,
  useCartSubtotal,
  cartItemKey,
  type CartItem,
} from "@/lib/stores/cart-store"

export { cartItemKey, type CartItem }

/**
 * Backward compatibility wrapper hook that forwards to Zustand useCartStore.
 * Allows all existing components to use useStore() seamlessly.
 */
export function useStore() {
  const cartItems = useCartStore((state) => state.cartItems)
  const cartOpen = useCartStore((state) => state.cartOpen)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)

  const cartCount = useCartCount()
  const subtotal = useCartSubtotal()

  return {
    cartCount,
    cartItems,
    subtotal,
    cartOpen,
    hasHydrated,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
}

/**
 * StoreProvider is retained as a pass-through provider so root layouts
 * don't need changes, while state is 100% managed by Zustand.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
