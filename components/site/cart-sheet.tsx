"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import { useStore, cartItemKey } from "@/components/store-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { formatPrice } from "@/lib/data"

export function CartSheet() {
  const { cartItems, cartOpen, closeCart, subtotal, updateQuantity, removeFromCart } = useStore()

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="!w-full max-w-md p-0 sm:!max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="size-4" />
            Your Cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review the items in your cart before checking out.
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <ShoppingBagIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add something you love and it will show up here.
              </p>
            </div>
            <Button render={<Link href="/" />} nativeButton={false} onClick={closeCart}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {cartItems.map((item) => (
                <div
                  key={cartItemKey(item.product.id, item.variant)}
                  className="flex gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                      <button
                        type="button"
                        aria-label={`Remove ${item.product.name}`}
                        onClick={() => removeFromCart(item.product.id, item.variant)}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Variant: {item.variant}</p>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div
                        role="group"
                        aria-label={`Quantity of ${item.product.name}`}
                        className="flex items-center gap-1 rounded-md border"
                      >
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.product.id, item.variant, item.quantity - 1)
                          }
                          className="flex size-8 items-center justify-center rounded-l-md transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <MinusIcon className="size-3.5" />
                        </button>
                        <span
                          aria-live="polite"
                          className="w-6 text-center text-sm font-medium"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.product.name}`}
                          disabled={item.quantity >= 99}
                          onClick={() =>
                            updateQuantity(item.product.id, item.variant, item.quantity + 1)
                          }
                          className="flex size-8 items-center justify-center rounded-r-md transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <PlusIcon className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  render={<Link href="/cart" />}
                  nativeButton={false}
                  onClick={closeCart}
                >
                  View Cart
                </Button>
                <Button render={<Link href="/checkout" />} nativeButton={false} onClick={closeCart}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
