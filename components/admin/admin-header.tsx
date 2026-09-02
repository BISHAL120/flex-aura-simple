"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  MenuIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  RotateCcwIcon,
  StoreIcon,
  SparklesIcon,
  ShoppingBagIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { initialOrders, initialCustomOrders } from "@/lib/admin-data"
import { toast } from "@/components/ui/toast"

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const orders = initialOrders
  const customOrders = initialCustomOrders
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const isDark = resolvedTheme === "dark"

  const pendingQuotes = customOrders.filter((c) => c.status === "new" || c.status === "quoted")
  const recentOrders = orders.slice(0, 3)

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/admin/products?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery("")
  }

  // Generate breadcrumb text from pathname
  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "Overview & Analytics"
    if (pathname.includes("/admin/products")) return "Products Catalog"
    if (pathname.includes("/admin/categories")) return "Categories Management"
    if (pathname.includes("/admin/orders")) return "Orders & Fulfillment"
    if (pathname.includes("/admin/custom-orders")) return "Custom Orders"
    if (pathname.includes("/admin/promotions")) return "Promotions & Hero Banners"
    if (pathname.includes("/admin/reviews")) return "Customer Reviews Moderation"
    if (pathname.includes("/admin/settings")) return "Store Settings"
    return "Dashboard"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open admin navigation menu"
              />
            }
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AdminSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground font-medium hidden sm:inline"
          >
            Admin
          </Link>
          <span className="text-muted-foreground/40 hidden sm:inline">/</span>
          <span className="font-semibold text-foreground">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex flex-1 max-w-md mx-4 hidden md:block">
        <form onSubmit={handleSearch} className="relative w-full">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Quick search products, SKUs, or customer tags…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs bg-muted/40 border-muted focus-visible:bg-background"
          />
        </form>
      </div>

      {/* Right Utility Actions */}
      <div className="flex items-center gap-2">
        {/* Storefront Link */}
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/" target="_blank" />}
          nativeButton={false}
          className="h-8 text-xs gap-1.5 hidden sm:flex"
        >
          <StoreIcon className="size-3.5" />
          <span>View Store</span>
        </Button>

        {/* Demo Data Reset Trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            toast.add({
              type: "info",
              title: "Demo Data Ready",
              description: "Flex Aura sample catalog and order records loaded.",
            })
          }}
          title="Reset sample orders, custom orders, products, and categories to defaults"
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcwIcon className="size-3.5" />
        </Button>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="View notifications"
              />
            }
          >
            <BellIcon className="size-4" />
            {pendingQuotes.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-lg">
            <div className="flex items-center justify-between border-b p-3">
              <span className="text-xs font-semibold">Notifications</span>
              <Badge variant="secondary" className="text-[10px]">
                {pendingQuotes.length} custom orders
              </Badge>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y">
              {pendingQuotes.length > 0 ? (
                pendingQuotes.map((q) => (
                  <Link
                    key={q.id}
                    href="/admin/custom-orders"
                    className="flex items-start gap-3 p-3 text-xs transition-colors hover:bg-muted"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <SparklesIcon className="size-3.5" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Custom Order: {q.customerName}
                      </p>
                      <p className="text-muted-foreground line-clamp-1">
                        {q.designRequirement}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80">
                        {q.withBacklitLed ? "Backlit LED · " : ""}
                        {q.sizeOption}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No pending custom order notifications.
                </div>
              )}

              {recentOrders.map((ord) => (
                <Link
                  key={ord.id}
                  href="/admin/orders"
                  className="flex items-start gap-3 p-3 text-xs transition-colors hover:bg-muted"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                    <ShoppingBagIcon className="size-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      Order {ord.orderNumber} ({ord.customerName})
                    </p>
                    <p className="text-muted-foreground">
                      Status: <span className="capitalize">{ord.status}</span> · ${ord.total}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="border-t p-2 text-center">
              <Link
                href="/admin/orders"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                View all orders &amp; pipeline →
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {mounted ? (isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />) : null}
        </Button>
      </div>
    </header>
  )
}
