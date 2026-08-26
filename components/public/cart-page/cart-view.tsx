"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import { useStore, cartItemKey } from "@/components/store-provider"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"
import { FREE_SHIPPING_THRESHOLD, getShipping } from "@/lib/cart"

const CartPage = () => {
  const { cartItems, subtotal, updateQuantity, removeFromCart } = useStore()

  const shipping = getShipping(subtotal)
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-5 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBagIcon className="size-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-semibold">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground">
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Button size="lg" render={<Link href="/" />} nativeButton={false}>
          Continue shopping
          <ArrowRightIcon />
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading align="left" eyebrow="Cart" title="Your cart" className="mb-8" />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div className="flex flex-col gap-4">
          {cartItems.map((item) => (
            <div
              key={cartItemKey(item.product.id, item.variant)}
              className="flex gap-4 rounded-lg border bg-card p-4"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Variant: {item.variant}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.product.name}`}
                    onClick={() => removeFromCart(item.product.id, item.variant)}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
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
                    <span aria-live="polite" className="w-8 text-center text-sm font-medium">
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
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(item.price)} each
                    </span>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-heading text-base font-semibold">Order summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Free shipping on orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} or more.
              </p>
            )}
            <div className="my-1 border-t" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button size="lg" className="w-full" render={<Link href="/checkout" />} nativeButton={false}>
            Proceed to Checkout
            <ArrowRightIcon />
          </Button>
          <Button variant="ghost" render={<Link href="/" />} nativeButton={false}>
            Continue shopping
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default CartPage