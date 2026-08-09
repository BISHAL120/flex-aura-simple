"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, SlidersHorizontalIcon, PackageSearchIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import { ProductGrid } from "@/components/site/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { products, type Product } from "@/lib/data"

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest"

const CATEGORIES = ["All", "Cars", "Motorcycles", "Custom & Backlit", "Abstract"] as const
const SORT_KEYS: SortKey[] = ["featured", "price-asc", "price-desc", "rating", "newest"]

function isCategory(value: string): value is (typeof CATEGORIES)[number] {
  return (CATEGORIES as readonly string[]).includes(value)
}

function isSortKey(value: string): value is SortKey {
  return SORT_KEYS.includes(value as SortKey)
}

function productCategory(product: Product): (typeof CATEGORIES)[number] {
  if (product.tags.includes("custom") || product.tags.includes("backlit")) return "Custom & Backlit"
  if (product.tags.includes("motorcycle")) return "Motorcycles"
  if (product.tags.includes("abstract")) return "Abstract"
  return "Cars"
}

export function ShopView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // The URL is the single source of truth for search/filter/sort state so the
  // back button, shareable links and the header search all stay in sync.
  const query = searchParams.get("q") ?? ""
  const categoryParam = searchParams.get("category") ?? "All"
  const sortParam = searchParams.get("sort") ?? "featured"
  const category: (typeof CATEGORIES)[number] = isCategory(categoryParam) ? categoryParam : "All"
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured"

  function updateParam(key: string, value: string, defaultValue: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value === defaultValue || value === "") {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    const qs = next.toString()
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false })
  }

  const filtered = React.useMemo(() => {
    let result = products

    if (category !== "All") {
      result = result.filter((p) => productCategory(p) === category)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        result = [...result].sort((a, b) =>
          b.tags.includes("new-arrival") === a.tags.includes("new-arrival") ? 0 : b.tags.includes("new-arrival") ? 1 : -1
        )
        break
      default:
        break
    }

    return result
  }, [query, category, sort])

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        align="left"
        eyebrow="Shop"
        title="Metal Art Collection"
        as="h1"
        description="Laser-cut 2mm metal wall art — cars, bikes, custom designs and backlit LED pieces, made to order in your size."
        className="mb-8"
      />

      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => updateParam("q", e.target.value, "")}
            placeholder="Search products…"
            aria-label="Search products"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={category}
            onValueChange={(value) => {
              if (value && isCategory(value)) updateParam("category", value, "All")
            }}
          >
            <SelectTrigger aria-label="Filter by category" className="w-40 rounded-md">
              <SlidersHorizontalIcon />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => {
              if (value && isSortKey(value)) updateParam("sort", value, "featured")
            }}
          >
            <SelectTrigger aria-label="Sort products" className="w-40 rounded-md">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Screen-reader announcement of the live result count */}
      <p aria-live="polite" role="status" className="sr-only">
        {filtered.length} {filtered.length === 1 ? "product" : "products"} shown
      </p>

      {/* Results */}
      {filtered.length > 0 ? (
        <ProductGrid products={filtered} />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-card py-20 text-center">
          <PackageSearchIcon className="size-10 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search or clear the filters.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.replace("/shop", { scroll: false })}>
            Reset filters
          </Button>
        </div>
      )}
    </Container>
  )
}
