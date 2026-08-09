"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  MenuIcon,
  SearchIcon,
  ShoppingBagIcon,
  SunIcon,
  MoonIcon,
  TruckIcon,
  RotateCcwIcon,
  HeadsetIcon,
} from "lucide-react"

import { Container } from "@/components/site/container"
import { useStore } from "@/components/store-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Custom Order", href: "/custom-order" },
  { label: "Custom Metal Art", href: "/promotions/custom-metal-art" },
  { label: "Backlit LED", href: "/promotions/backlit-collection" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : null}
    </Button>
  )
}

function CartButton() {
  const { cartCount, openCart } = useStore()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Cart, ${cartCount} items`}
      onClick={openCart}
      className="relative"
    >
      <ShoppingBagIcon aria-hidden="true" />
      <span aria-live="polite" className="sr-only">
        {cartCount > 0 ? `${cartCount} items in cart` : "Cart is empty"}
      </span>
      {cartCount > 0 && (
        <Badge
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 size-5 rounded-full p-0 text-[10px]"
        >
          {cartCount}
        </Badge>
      )}
    </Button>
  )
}

function SearchForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = query.trim()
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop")
    setQuery("")
    onSubmitted?.()
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="pl-9"
      />
    </form>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      {/* Utility bar */}
      <div className="hidden border-b bg-muted/40 md:block">
        <Container className="flex h-8 items-center justify-between text-xs text-muted-foreground">
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <TruckIcon className="size-3.5" /> Free shipping over $50
            </span>
            <span className="inline-flex items-center gap-1">
              <RotateCcwIcon className="size-3.5" /> 2mm laser-cut metal
            </span>
            <span className="inline-flex items-center gap-1">
              <HeadsetIcon className="size-3.5" /> Custom sizes available
            </span>
          </p>
          <p>Welcome to Flex Aura</p>
        </Container>
      </div>

      {/* Row 1: logo, search, actions */}
      <div className="border-b">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu" />
                }
              >
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 sm:max-w-sm">
                <SheetHeader className="border-b">
                  <SheetTitle>Flex Aura</SheetTitle>
                </SheetHeader>
                <div className="p-4 pb-2">
                  <SearchForm onSubmitted={() => setMenuOpen(false)} />
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  {NAV_LINKS.map((link) => {
                    const active = pathname === link.href
                    return (
                      <SheetClose key={link.href} render={<Link href={link.href} aria-current={active ? "page" : undefined} />}>
                        <span
                          className={cn(
                            "flex rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                            active && "bg-muted text-foreground"
                          )}
                        >
                          {link.label}
                        </span>
                      </SheetClose>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
              Flex <span className="text-muted-foreground">Aura</span>
            </Link>
          </div>

          {/* Search (hidden on mobile — lives in the sheet) */}
          <div className="hidden w-full max-w-md md:block">
            <SearchForm />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="relative">
              <CartButton />
            </div>
          </div>
        </Container>
      </div>

      {/* Row 2: navigation (desktop) */}
      <div className="hidden md:block">
        <Container>
          <nav className="flex items-center justify-center gap-1 py-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active && "bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </Container>
      </div>
    </header>
  )
}
