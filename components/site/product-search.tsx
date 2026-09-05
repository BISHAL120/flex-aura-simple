"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Loader2Icon, SearchIcon, ArrowRightIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/data"
import { cn } from "@/lib/utils"

interface SearchProduct {
  id: string
  slug: string
  name: string
  image: string
  badge: string | null
  price: number
}

type ProductSearchProps = {
  onSubmitted?: () => void
  className?: string
  inputClassName?: string
  autoFocus?: boolean
}

const DEBOUNCE_MS = 300

export function ProductSearch({
  onSubmitted,
  className,
  inputClassName,
  autoFocus = false,
}: ProductSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const listboxId = React.useId()
  const [query, setQuery] = React.useState("")
  const [products, setProducts] = React.useState<SearchProduct[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const latestQueryRef = React.useRef("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Close the dropdown on outside click.
  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  // Cancel in-flight requests on unmount.
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  async function runSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) {
      setProducts([])
      setLoading(false)
      setOpen(false)
      return
    }
    latestQueryRef.current = trimmed
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
      if (!res.ok) return
      const data = await res.json()
      // Only the newest query may write results — stale responses are dropped.
      if (controller.signal.aborted || latestQueryRef.current !== trimmed) return
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch {
      // Abort or network error — keep current results rather than crashing.
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
        setActiveIndex(-1)
      }
    }
  }

  function cancelInFlight() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }

  function handleChange(value: string) {
    setQuery(value)
    setActiveIndex(-1)
    // Cancel whatever is in flight so a stale response can't overwrite results.
    cancelInFlight()
    if (!value.trim()) {
      setProducts([])
      setOpen(false)
      setLoading(false)
      latestQueryRef.current = ""
      return
    }
    // Debounce so we don't hit the server on every keystroke.
    debounceRef.current = setTimeout(() => {
      void runSearch(value.trim())
    }, DEBOUNCE_MS)
  }

  function goTo(href: string) {
    cancelInFlight()
    setOpen(false)
    setQuery("")
    setProducts([])
    setLoading(false)
    onSubmitted?.()

    // Avoid stacking duplicate history entries when navigating to the current
    // route (e.g. pressing Enter on a query already on /shop).
    const target = href.split(/[?#]/)[0]
    if (target === pathname) {
      router.replace(href)
    } else {
      router.push(href)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = query.trim()
    if (q) goTo(`/shop?q=${encodeURIComponent(q)}`)
    else inputRef.current?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || products.length === 0) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % products.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      // From no selection, ArrowUp should land on the last item.
      setActiveIndex((i) => (i <= 0 ? products.length - 1 : i - 1))
    } else if (event.key === "Enter") {
      // If a suggestion is highlighted, open it; otherwise submit the query.
      if (activeIndex >= 0 && products[activeIndex]) {
        event.preventDefault()
        goTo(`/products/${products[activeIndex].slug}`)
      }
    } else if (event.key === "Escape") {
      // Stop propagation so Escape closes the dropdown only — not the mobile
      // Sheet dialog this input can live inside.
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
  }

  // Safari's native search clear button doesn't fire onChange — sync state so
  // the input value and the component stay in agreement.
  function handleInput(event: React.FormEvent<HTMLInputElement>) {
    const value = (event.target as HTMLInputElement).value
    if (value !== query) handleChange(value)
  }

  const showResults = open && (loading || products.length > 0)
  const activeDescendant =
    activeIndex >= 0 && products[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} role="search" className="relative w-full">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => handleChange(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && (products.length > 0 || loading)) setOpen(true)
          }}
          placeholder="Search products…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          className={cn("pl-9", inputClassName)}
        />
      </form>

      {showResults ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Product suggestions"
          className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border bg-card shadow-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Loader2Icon className="size-3.5 animate-spin" />
              Searching…
            </div>
          ) : (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {products.map((product, index) => (
                  <li
                    key={product.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goTo(`/products/${product.slug}`)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                        index === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                      )}
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      {product.badge ? (
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {product.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t">
                <button
                  type="button"
                  onClick={() => goTo(`/shop?q=${encodeURIComponent(query.trim())}`)}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-muted/60"
                >
                  <span>
                    View all results for &ldquo;{query.trim()}&rdquo;
                  </span>
                  <ArrowRightIcon className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
