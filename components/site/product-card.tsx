"use client"

import * as React from "react"
import Image from "next/image"
import { ShoppingCartIcon, StarIcon } from "lucide-react"

import { useStore } from "@/components/store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatPrice, type Product } from "@/lib/data"

const SWAP_THRESHOLD_PX = 48

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart } = useStore()
  const defaultVariant = product.variants[0] ?? ""
  const [variant, setVariant] = React.useState(defaultVariant)
  const [imageIndex, setImageIndex] = React.useState(0)
  // Track cursor position and the position of the last committed swap so a
  // single continuous stroke crosses the threshold at most once per 48px.
  const lastXRef = React.useRef(0)
  const lastSwapXRef = React.useRef(0)
  const hasEnteredRef = React.useRef(false)

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    lastXRef.current = event.clientX - rect.left
    lastSwapXRef.current = lastXRef.current
    hasEnteredRef.current = true
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!hasEnteredRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const delta = x - lastXRef.current
    lastXRef.current = x

    const distance = Math.abs(x - lastSwapXRef.current)
    if (distance < SWAP_THRESHOLD_PX || delta === 0) return

    const direction = delta > 0 ? 1 : -1
    const steps = Math.max(1, Math.round(distance / SWAP_THRESHOLD_PX))
    lastSwapXRef.current += steps * SWAP_THRESHOLD_PX * direction
    setImageIndex((index) => (index + steps * direction + product.images.length) % product.images.length)
  }

  function handleMouseLeave() {
    if (!hasEnteredRef.current) return
    hasEnteredRef.current = false
    lastXRef.current = 0
    lastSwapXRef.current = 0
    setImageIndex(0)
  }

  const discount =
    product.compareAtPrice != null && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden py-0">
      <div
        className="relative aspect-square overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {product.images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={product.name}
            fill
            priority={priority && index === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-300",
              index === imageIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {product.badge ? (
          <Badge className="absolute top-2.5 left-2.5">{product.badge}</Badge>
        ) : null}
        {discount != null ? (
          <Badge variant="destructive" className="absolute top-2.5 right-2.5">
            -{discount}%
          </Badge>
        ) : null}
      </div>

      <CardHeader className="gap-0 px-4 pt-3 pb-0">
        <CardTitle className="line-clamp-2 min-h-10 text-sm leading-5 font-medium">
          {product.name}
        </CardTitle>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground">
            <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
          <span>({product.reviewCount})</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-1.5 px-4 pt-3 pb-0">
        <div role="group" aria-label={`${product.name} options`} className="contents">
          {product.variants.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={variant === v}
              onClick={() => setVariant(v)}
              className={cn(
                "rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
                variant === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-stretch gap-2.5 px-4 pt-3 pb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice != null ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <Button
          size="lg"
          className="w-full h-11"
          onClick={() => addToCart(product, variant)}
        >
          <ShoppingCartIcon />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
