"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@/components/ui/toast"
import { formatPrice, getVariantPrice, type Product } from "@/lib/data"

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

type SetState = (
  partial:
    | Partial<CartState>
    | ((state: CartState) => Partial<CartState>)
) => void

/**
 * Re-fetches current prices from the server and patches cart items whose
 * price or availability changed. Items no longer available are dropped;
 * on any network error the rehydrated snapshot is kept.
 */
async function revalidateCartPrices(
  set: SetState,
  items: CartItem[]
): Promise<void> {
  try {
    const res = await fetch("/api/cart/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ id: item.product.id, variant: item.variant })),
      }),
    })
    if (!res.ok) return
    const data = (await res.json()) as {
      items: {
        id: string
        slug: string
        name: string
        image: string
        variant: string | null
        price: number
        compareAtPrice: number | null
      }[]
    }
    const freshByKey = new Map(
      data.items.map((item) => [cartItemKey(item.id, item.variant ?? ""), item])
    )

    set((state) => {
      const updated: CartItem[] = []
      for (const item of state.cartItems) {
        const fresh = freshByKey.get(cartItemKey(item.product.id, item.variant))
        if (!fresh) continue // product removed, hidden, or variant gone — drop the line
        updated.push({
          variant: fresh.variant ?? item.variant,
          quantity: item.quantity,
          price: fresh.price,
          product: {
            ...item.product,
            name: fresh.name,
            image: fresh.image,
            price: fresh.price,
            compareAtPrice: fresh.compareAtPrice ?? undefined,
          },
        })
      }
      return { cartItems: updated }
    })
  } catch {
    // Network/parse failure: keep the rehydrated snapshot rather than clearing it.
  }
}

type StoredCartItem = {
  product: Product
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
  revalidatePrices: () => Promise<void>
}

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

      revalidatePrices: async () => {
        const items = get().cartItems
        if (items.length === 0) return
        await revalidateCartPrices(set, items)
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems.map((item) => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
        })),
      }),
      // Validate and reconstruct cart items from the persisted product snapshot
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          const rawItems = (state as unknown as { cartItems: StoredCartItem[] }).cartItems
          if (Array.isArray(rawItems)) {
            const restored: CartItem[] = rawItems.flatMap((item) => {
              const product = item.product
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

            // Revalidate prices against the DB so sold-out / price-changed
            // items reflect current data instead of a stale snapshot.
            if (restored.length > 0) {
              void useCartStore.getState().revalidatePrices()
            }
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
