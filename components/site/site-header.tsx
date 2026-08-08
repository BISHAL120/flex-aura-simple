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
  TruckIcon,
  RotateCcwIcon,
  HeadsetIcon,
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

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Summer Sale", href: "/promotions/summer-sale" },
  { label: "Clearance", href: "/promotions/clearance" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
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

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      {/* Utility bar */}
      <div className="hidden border-b bg-muted/40 md:block">
        <Container className="flex h-8 items-center justify-between text-xs text-muted-foreground">
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <TruckIcon className="size-3.5" /> Free shipping over $50
            </span>
            <span className="inline-flex items-center gap-1">
              <RotateCcwIcon className="size-3.5" /> 30-day returns
            </span>
            <span className="inline-flex items-center gap-1">
              <HeadsetIcon className="size-3.5" /> 24/7 support
            </span>
          </p>
          <p>Welcome to Flex Aura</p>
        </Container>
      </div>

      <Container className="flex h-16 items-center justify-between gap-4">
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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
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

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="relative">
            <CartButton />
          </div>
        </div>
      </Container>
    </header>
  )
}
