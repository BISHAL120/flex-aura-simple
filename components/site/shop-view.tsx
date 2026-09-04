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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Product } from "@/lib/data"
import type { AdminCategory } from "@/lib/admin-categories-data"

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest"

const SORT_KEYS: SortKey[] = ["featured", "price-asc", "price-desc", "rating", "newest"]

function isSortKey(value: string): value is SortKey {
  return SORT_KEYS.includes(value as SortKey)
}

interface ShopViewProps {
  products: Product[]
  total: number
  totalPages: number
  categories: AdminCategory[]
  query: string
  category: string
  sort: string
  currentPage: number
}

export function ShopView({
  products,
  total,
  totalPages,
  categories,
  query,
  category,
  sort,
  currentPage,
}: ShopViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // The URL is the single source of truth for search/filter/sort/pagination state.
  const effectiveSort: SortKey = isSortKey(sort) ? sort : "featured"

  const [searchInput, setSearchInput] = React.useState(query)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Adjust during render when the URL query changes (e.g. back/forward),
  // avoiding a separate effect pass that would cascade renders.
  const [prevQuery, setPrevQuery] = React.useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    setSearchInput(query)
  }

  // Debounce search so we don't round-trip to the server on every keystroke.
  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParam("q", value, "")
    }, 350)
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function updateParam(key: string, value: string, defaultValue: string, resetPage = true) {
    const next = new URLSearchParams(searchParams.toString())
    if (value === defaultValue || value === "") {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    if (resetPage && key !== "page") {
      next.delete("page")
    }
    const qs = next.toString()
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false })
  }

  function setPage(newPage: number) {
    updateParam("page", newPage.toString(), "1", false)
  }

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
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={category || "All"}
            onValueChange={(value) => {
              if (value === "All") updateParam("category", "", "All")
              else updateParam("category", value || "", "All")
            }}
          >
            <SelectTrigger aria-label="Filter by category" className="w-40 rounded-md">
              <SlidersHorizontalIcon />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={effectiveSort}
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
        {total} {total === 1 ? "product" : "products"} shown
      </p>

      {/* Results */}
      {products.length > 0 ? (
        <div className="flex flex-col gap-10">
          <ProductGrid products={products} />

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
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
