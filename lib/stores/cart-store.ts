"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/toast"
import { formatPrice, getVariantPrice, products, type Product } from "@/lib/data"

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

interface CartState {
  cartItems: CartItem[]
  cartOpen: boolean
  hasHydrated: boolean
  // Actions
  setHasHydrated: (hydrated: boolean) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (product: Product, variant: string) => void
  updateQuantity: (productId: string, variant: string, quantity: number) => void
  removeFromCart: (productId: string, variant: string) => void
  clearCart: () => void
}

const productsById = new Map(products.map((p) => [p.id, p]))

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartOpen: false,
      hasHydrated: false,

      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),

      addToCart: (product: Product, variant: string) => {
        const state = get()
        const wasEmpty = state.cartItems.length === 0
        const key = cartItemKey(product.id, variant)
        const existingIndex = state.cartItems.findIndex(
          (item) => cartItemKey(item.product.id, item.variant) === key
        )

        let updatedItems: CartItem[]

        if (existingIndex > -1) {
          updatedItems = state.cartItems.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) }
              : item
          )
        } else {
          const unitPrice = getVariantPrice(product, variant)
          updatedItems = [
            ...state.cartItems,
            { product, variant, price: unitPrice, quantity: 1 },
          ]
        }

        set({
          cartItems: updatedItems,
          // Auto-open drawer when adding the very first item
          cartOpen: wasEmpty ? true : state.cartOpen,
        })

        toast.add({
          type: "success",
          title: "Added to cart",
          description: `${product.name} (${variant}) — ${formatPrice(getVariantPrice(product, variant))}`,
        })
      },

      updateQuantity: (productId: string, variant: string, quantity: number) => {
        const key = cartItemKey(productId, variant)
        if (quantity <= 0) {
          get().removeFromCart(productId, variant)
          return
        }

        const clamped = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)))
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            cartItemKey(item.product.id, item.variant) === key
              ? { ...item, quantity: clamped }
              : item
          ),
        }))
      },

      removeFromCart: (productId: string, variant: string) => {
        const key = cartItemKey(productId, variant)
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => cartItemKey(item.product.id, item.variant) !== key
          ),
        }))
      },

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems.map((item) => ({
          productId: item.product.id,
          variant: item.variant,
          quantity: item.quantity,
        })),
      }),
      // Validate and reconstruct full Product objects on rehydration
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          const rawItems = (state as unknown as { cartItems: StoredCartItem[] }).cartItems
          if (Array.isArray(rawItems)) {
            const restored: CartItem[] = rawItems.flatMap((item) => {
              const product = productsById.get(item.productId)
              if (!product || !product.variants.some((v) => v.name === item.variant)) return []
              const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(item.quantity)))
              return [
                {
                  product,
                  variant: item.variant,
                  price: getVariantPrice(product, item.variant),
                  quantity,
                },
              ]
            })
            state.cartItems = restored
          }
          state.hasHydrated = true
        }
      },
    }
  )
)

// Granular Selectors
export const useCartCount = () =>
  useCartStore((state) =>
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  )

export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

export const useCartItems = () => useCartStore((state) => state.cartItems)
export const useCartOpen = () => useCartStore((state) => state.cartOpen)
export const useCartHydrated = () => useCartStore((state) => state.hasHydrated)
