"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  PackageIcon,
  LayoutGridIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  SettingsIcon,
  ExternalLinkIcon,
  StoreIcon,
  ShieldCheckIcon,
  UsersIcon,
  MegaphoneIcon,
  GalleryVerticalEndIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { initialOrders } from "@/lib/admin-data"

export const ADMIN_NAV_ITEMS = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboardIcon,
    badgeKey: null,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: PackageIcon,
    badgeKey: null,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: LayoutGridIcon,
    badgeKey: null,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBagIcon,
    badgeKey: "pendingOrders",
  },
  {
    title: "Custom Orders",
    href: "/admin/custom-orders",
    icon: SparklesIcon,
    badgeKey: "newCustomOrders",
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: MegaphoneIcon,
    badgeKey: null,
  },
  {
    title: "Hero Sliders",
    href: "/admin/hero-sliders",
    icon: GalleryVerticalEndIcon,
    badgeKey: null,
  },
  {
    title: "Customer Reviews",
    href: "/admin/reviews",
    icon: StarIcon,
    badgeKey: null,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UsersIcon,
    badgeKey: "users",
  },
  {
    title: "Store Settings",
    href: "/admin/settings",
    icon: SettingsIcon,
    badgeKey: null,
  },
]

export function AdminSidebar({
  className,
  onNavigate,
  newCustomOrdersCount = 0,
}: {
  className?: string
  onNavigate?: () => void
  newCustomOrdersCount?: number
}) {
  const pathname = usePathname()
  const orders = initialOrders

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "in-production"
  ).length

  const getBadgeValue = (key: string | null) => {
    if (key === "pendingOrders") return pendingOrdersCount > 0 ? pendingOrdersCount : null
    if (key === "newCustomOrders")
      return newCustomOrdersCount > 0 ? newCustomOrdersCount : null
    return null
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-card/60 backdrop-blur-md",
        className
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center justify-between border-b px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm">
            FA
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-sm font-semibold tracking-tight">
              Flex <span className="text-muted-foreground">Aura</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Admin Workspace
            </span>
          </div>
        </Link>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          v1.0
        </Badge>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Management
        </div>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            const badgeValue = getBadgeValue(item.badgeKey)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {badgeValue != null && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : item.badgeKey === "newCustomOrders" || item.badgeKey === "pendingOrders"
                          ? "bg-primary/10 text-primary font-bold"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 mb-2 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Storefront & Tools
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <div className="flex items-center gap-3">
              <StoreIcon className="size-4" />
              <span>Live Storefront</span>
            </div>
            <ExternalLinkIcon className="size-3.5 text-muted-foreground/70" />
          </Link>
          <Link
            href="/custom-order"
            target="_blank"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <div className="flex items-center gap-3">
              <SparklesIcon className="size-4" />
              <span>Custom Order Form</span>
            </div>
            <ExternalLinkIcon className="size-3.5 text-muted-foreground/70" />
          </Link>
        </div>
      </div>

      {/* Footer Profile / Store Health */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              <ShieldCheckIcon className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">
                User Name Here
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                User email here
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
