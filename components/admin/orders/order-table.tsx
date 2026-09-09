"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { getOrderStatusBadge } from "@/components/admin/overview/recent-orders-table"
import { OrderDetailsSheet } from "@/components/admin/orders/order-details-sheet"
import { DataPagination } from "@/components/admin/common/data-pagination"
import type { AdminOrder, OrderItem } from "@/lib/admin-orders-data"
import type { OrderStatus } from "@prisma/client"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 6

type OrderCounts = Record<OrderStatus | "all", number>

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

interface OrderTableProps {
  orders: AdminOrder[]
  counts: OrderCounts
  total: number
  totalPages: number
  search: string
  status: string
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  status: string
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.status !== "all") params.set("status", state.status)
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/orders?${qs}` : "/admin/orders"
}

export function OrderTable({
  orders,
  counts,
  total,
  totalPages,
  search,
  status,
  page,
  pageSize,
}: OrderTableProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState(search)
  const searchFocusedRef = React.useRef(false)
  const committedRef = React.useRef<CommittedState>({ search, status, page, pageSize })
  const pendingSizeRef = React.useRef<number | null>(null)
  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrder | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  React.useEffect(() => {
    committedRef.current = { search, status, page, pageSize }
  }, [search, status, page, pageSize])

  React.useEffect(() => {
    if (searchFocusedRef.current) return
    setSearchInput(search)
  }, [search])

  const navigate = React.useCallback(
    (overrides: Partial<CommittedState>) => {
      const next = { ...committedRef.current, ...overrides }
      committedRef.current = next
      router.push(buildQuery(next), { scroll: false })
    },
    [router]
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next !== committedRef.current.search) navigate({ search: next, page: 1 })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, navigate])

  const handleSearchBlur = () => {
    searchFocusedRef.current = false
    const next = searchInput.trim()
    if (next !== committedRef.current.search) navigate({ search: next, page: 1 })
  }
  const handleSearchFocus = () => {
    searchFocusedRef.current = true
  }

  function handleStatusChange(next: string) {
    navigate({ status: next, page: 1 })
  }

  function handlePageChange(nextPage: number) {
    const size = pendingSizeRef.current
    pendingSizeRef.current = null
    navigate(size !== null ? { pageSize: size, page: nextPage } : { page: nextPage })
  }
  function handlePageSizeChange(nextSize: number) {
    pendingSizeRef.current = nextSize
  }

  function handleOpenOrder(order: AdminOrder) {
    setSelectedOrder(order)
    setSheetOpen(true)
  }

  const getTabCount = (value: string) =>
    value === "all" ? counts.all : counts[value as OrderStatus] ?? 0

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Status Tabs */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search by order #, customer, email…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_TABS.map((tab) => {
            const count = getTabCount(tab.value)
            const isActive = status === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
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
              {orders.length > 0 ? (
                orders.map((order) => (
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
                          {order.items.map((i: OrderItem) => i.productName.split("—")[0]).join(", ")}
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
                    No orders found matching status &quot;{status}&quot; or search query.
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
          totalItems={total}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24, 48]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
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
