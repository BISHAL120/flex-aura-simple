"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRightIcon, RulerIcon, ShieldCheckIcon, ShoppingCartIcon, TruckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/components/store-provider"
import { formatPrice, getVariant, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

const TRUST_PERKS = [
  { icon: TruckIcon, label: "Free shipping over $50" },
  { icon: RulerIcon, label: "Custom sizes available" },
  { icon: ShieldCheckIcon, label: "30-day returns" },
]

export function ProductInfo({ product }: { product: Product }) {
  const { addToCart } = useStore()
  const defaultVariant = product.variants[0]?.name ?? ""
  const [variant, setVariant] = React.useState(defaultVariant)

  const activeVariant = getVariant(product, variant)
  const price = activeVariant?.price ?? product.price
  const compareAtPrice = activeVariant?.compareAtPrice
  const discount =
    compareAtPrice != null && compareAtPrice > price
      ? Math.round((1 - price / compareAtPrice) * 100)
      : null

  return (
    <div className="flex flex-col gap-6">
      {/* Title + rating */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {product.badge ? <Badge>{product.badge}</Badge> : null}
          {discount != null ? (
            <Badge variant="destructive">-{discount}%</Badge>
          ) : null}
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">/ 5</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{product.reviewCount} reviews</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight">
          {formatPrice(price)}
        </span>
        {compareAtPrice != null ? (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(compareAtPrice)}
          </span>
        ) : null}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground sm:text-base">{product.description}</p>

      {/* Variant selector */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Size</span>
        <div role="group" aria-label="Size" className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.name}
              type="button"
              aria-pressed={variant === v.name}
              onClick={() => setVariant(v.name)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                variant === v.name
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add to cart */}
      <Button
        size="lg"
        className="h-12 w-full"
        onClick={() => addToCart(product, variant)}
      >
        <ShoppingCartIcon />
        Add to Cart
      </Button>
      <p className="sr-only" aria-live="polite">
        Selected size: {variant}
      </p>

      {/* Trust perks */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
        {TRUST_PERKS.map((perk) => (
          <div key={perk.label} className="flex items-center gap-2 text-sm">
            <perk.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{perk.label}</span>
          </div>
        ))}
      </div>

      {/* Custom order CTA */}
      <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">Want this in a different design or size?</p>
        <p className="text-sm text-muted-foreground">
          Send us your own car, bike, logo or idea and we&apos;ll cut it for you.
        </p>
        <Button
          variant="link"
          className="h-auto w-fit p-0"
          render={<Link href="/custom-order" />}
          nativeButton={false}
        >
          Start a custom order
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
