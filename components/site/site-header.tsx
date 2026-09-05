"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  MenuIcon,
  ShoppingBagIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react"

import { Container } from "@/components/site/container"
import { useStore } from "@/components/store-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import HeaderStrip from "./header-strip"
import { ProductSearch } from "./product-search"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Custom Order", href: "/custom-order" },
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

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { data: session, isPending: sessionPending } = authClient.useSession()

  // The client session type doesn't model the server-added `role` field, so
  // read it defensively. Only authenticated ADMIN users get the Admin button.
  const role = session?.user ? (session.user as { role?: string[] }).role : undefined
  const isAdmin = !sessionPending && !!session?.user && Array.isArray(role) && role.includes("ADMIN")

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      {/* Header Strip */}
      <HeaderStrip />

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
                  <ProductSearch onSubmitted={() => setMenuOpen(false)} inputClassName="h-10" />
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
            <ProductSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin" />}
                nativeButton={false}
                className="hidden sm:inline-flex text-xs h-8 gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              >
                <span>Admin</span>
              </Button>
            )}

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
