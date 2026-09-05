"use client"

import {
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  RotateCcwIcon,
  SearchIcon,
  StoreIcon,
  SunIcon
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { Spinner } from "@/components/ui/spinner"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)

  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authClient.signOut()
      router.push("/sign-in")
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Sign out failed",
        description: "Something went wrong while signing out. Please try again.",
      })
      setSigningOut(false)
    }
  }

  const isDark = resolvedTheme === "dark"

  // Generate breadcrumb text from pathname
  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "Overview & Analytics"
    if (pathname.includes("/admin/products")) return "Products Catalog"
    if (pathname.includes("/admin/categories")) return "Categories Management"
    if (pathname.includes("/admin/orders")) return "Orders & Fulfillment"
    if (pathname.includes("/admin/custom-orders")) return "Custom Orders"
    if (pathname.includes("/admin/promotions")) return "Promotions & Hero Banners"
    if (pathname.includes("/admin/hero-sliders")) return "Hero Sliders"
    if (pathname.includes("/admin/reviews")) return "Customer Reviews Moderation"
    if (pathname.includes("/admin/contact-submissions")) return "Contact Submissions"
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

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {mounted ? (isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />) : null}
        </Button>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          {signingOut ? (
            <Spinner className="size-3.5" />
          ) : (
            <LogOutIcon className="size-3.5" />
          )}
          <span>{signingOut ? "Signing out…" : "Logout"}</span>
        </Button>
      </div>
    </header>
  )
}
