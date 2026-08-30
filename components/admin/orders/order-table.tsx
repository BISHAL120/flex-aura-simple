"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, EyeIcon, ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice } from "@/lib/data"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import { getOrderStatusBadge } from "@/components/admin/overview/recent-orders-table"
import { OrderDetailsSheet } from "@/components/admin/orders/order-details-sheet"
import { DataPagination } from "@/components/admin/common/data-pagination"
import type { AdminOrder } from "@/lib/admin-data"

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Laser Cutting", value: "in-production" },
  { label: "Powder Coating", value: "powder-coating" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

export function OrderTable() {
  const { orders } = useAdminStore()
  const [activeTab, setActiveTab] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrder | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    let list = [...orders]

    if (activeTab !== "all") {
      list = list.filter((o) => o.status === activeTab)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.shippingAddress.city.toLowerCase().includes(q) ||
          o.shippingAddress.country.toLowerCase().includes(q) ||
          o.items.some((item) => item.productName.toLowerCase().includes(q))
      )
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [orders, activeTab, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))
  const paginatedOrders = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  function handleOpenOrder(order: AdminOrder) {
    setSelectedOrder(order)
    setSheetOpen(true)
  }

  // Count helper
  const getTabCount = (tabValue: string) => {
    if (tabValue === "all") return orders.length
    return orders.filter((o) => o.status === tabValue).length
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Status Tabs */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by order #, customer, email, city…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_TABS.map((tab) => {
            const count = getTabCount(tab.value)
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value)
                  setPage(1)
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px] text-xs">Order</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Destination</TableHead>
                <TableHead className="text-xs">Items</TableHead>
                <TableHead className="text-xs">Total</TableHead>
                <TableHead className="text-xs">Fulfillment Status</TableHead>
                <TableHead className="w-[100px] text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => handleOpenOrder(order)}
                    className="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {order.customerEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.country}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-foreground">
                          {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {order.items.map((i) => i.productName.split("—")[0]).join(", ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenOrder(order)
                          }}
                          title="Quick view (Slide-over)"
                        >
                          <EyeIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/admin/orders/${order.id}`} />}
                          nativeButton={false}
                          onClick={(e) => e.stopPropagation()}
                          title="Full order details page"
                        >
                          <ExternalLinkIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    No orders found matching status &quot;{activeTab}&quot; or search query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Reusable Data Pagination */}
        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24, 48]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="orders"
        />
      </div>

      {/* Slide-over inspector sheet */}
      <OrderDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        order={selectedOrder}
      />
    </div>
  )
}
