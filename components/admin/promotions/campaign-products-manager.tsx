"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, Loader2Icon, PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/data"
import { showError, showSuccess } from "@/lib/toast"
import type { AdminCampaign } from "@/lib/admin-campaigns-data"
import type { AdminProduct } from "@/lib/admin-products-data"
import {
  addProductToCampaign,
  removeProductFromCampaign,
} from "@/lib/data-layer/admin/campaigns/campaign-actions"

interface CampaignProductsManagerProps {
  campaign: AdminCampaign
  selectedProducts: AdminProduct[]
  catalog: AdminProduct[]
}

export function CampaignProductsManager({
  campaign,
  selectedProducts,
  catalog,
}: CampaignProductsManagerProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const selectedIds = React.useMemo(
    () => new Set(selectedProducts.map((p) => p.id)),
    [selectedProducts]
  )

  // Catalog rows that aren't already in the campaign, filtered by search.
  const available = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return catalog
      .filter((p) => !selectedIds.has(p.id))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.badge ?? "").toLowerCase().includes(q)
      )
      .slice(0, 30)
  }, [catalog, selectedIds, search])

  async function handleAdd(productId: string) {
    if (busyId) return
    setBusyId(productId)
    try {
      await addProductToCampaign(campaign.id, productId)
      showSuccess({ title: "Product added", message: "Product added to this campaign." })
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to add product" })
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(productId: string) {
    if (busyId) return
    setBusyId(productId)
    try {
      await removeProductFromCampaign(campaign.id, productId)
      showSuccess({ title: "Product removed", message: "Product removed from this campaign." })
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to remove product" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/promotions" />}
            nativeButton={false}
            title="Back to campaigns"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Products in {campaign.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Landing page: /promotions/{campaign.slug}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/promotions/${campaign.slug}`} target="_blank" />}
          nativeButton={false}
          className="h-8 text-xs"
        >
          View landing page
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border bg-card p-4 shadow-xs">
          <CardDescription className="text-xs">Products in this card</CardDescription>
          <p className="mt-1 font-heading text-2xl font-bold">{selectedProducts.length}</p>
        </Card>
        <Card className="border bg-card p-4 shadow-xs">
          <CardDescription className="text-xs">Visible on the landing page</CardDescription>
          <p className="mt-1 font-heading text-2xl font-bold">
            {selectedProducts.filter((p) => p.isActive).length}
          </p>
        </Card>
        <Card className="border bg-card p-4 shadow-xs">
          <CardDescription className="text-xs">Total in catalog</CardDescription>
          <p className="mt-1 font-heading text-2xl font-bold">{catalog.length}</p>
        </Card>
      </div>

      {/* Selected products */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base font-semibold">
            Selected Products ({selectedProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProducts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="block truncate text-xs font-semibold text-foreground hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(product.id)}
                    disabled={busyId === product.id}
                    title="Remove from campaign"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {busyId === product.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <XIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/20 p-10 text-center text-xs text-muted-foreground">
              <p>No products in this campaign yet.</p>
              <p>Search the catalog below and add products to this landing page.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add products */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base font-semibold">Add Products</CardTitle>
          <CardDescription className="text-xs">
            Search the catalog and add products to this campaign landing page
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, slug or badge…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          {available.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {product.name}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => handleAdd(product.id)}
                    disabled={busyId === product.id}
                    title="Add to campaign"
                  >
                    {busyId === product.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <PlusIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              <CheckIcon className="size-4" />
              {search
                ? "No catalog products match your search."
                : "All catalog products are already in this campaign."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected product ids hint (admin helper) */}
      <Badge variant="secondary" className="w-fit text-[10px]">
        Product count stored on campaign: {campaign.productIds.length}
      </Badge>
    </div>
  )
}
