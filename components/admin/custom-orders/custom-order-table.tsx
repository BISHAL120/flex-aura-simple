"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
  SparklesIcon,
  LightbulbIcon,
  ExternalLinkIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CustomOrderDialog } from "@/components/admin/custom-orders/custom-order-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import type { AdminCustomOrder, CustomOrderStatus } from "@/lib/admin-custom-orders-data"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 6

type CustomOrderCounts = Record<CustomOrderStatus | "all", number>

const PIPELINE_TABS: { label: string; value: CustomOrderStatus | "all" }[] = [
  { label: "All Custom Orders", value: "all" },
  { label: "New (Needs Pricing)", value: "new" },
  { label: "Priced / In Review", value: "quoted" },
  { label: "Approved / Deposit", value: "approved" },
  { label: "In Production", value: "inProduction" },
  { label: "Completed", value: "completed" },
  { label: "Declined", value: "declined" },
]

function getCustomStatusBadge(status: CustomOrderStatus) {
  switch (status) {
    case "new":
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">New Request</Badge>
    case "quoted":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Priced</Badge>
    case "approved":
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>
    case "inProduction":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">In Production</Badge>
    case "completed":
      return <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20">Completed</Badge>
    case "declined":
      return <Badge variant="destructive">Declined</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

interface CustomOrderTableProps {
  orders: AdminCustomOrder[]
  counts: CustomOrderCounts
  total: number
  totalPages: number
  search: string
  status: CustomOrderStatus | "all"
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  status: CustomOrderStatus | "all"
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
  return qs ? `/admin/custom-orders?${qs}` : "/admin/custom-orders"
}

export function CustomOrderTable({
  orders,
  counts,
  total,
  totalPages,
  search,
  status,
  page,
  pageSize,
}: CustomOrderTableProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState(search)
  const searchFocusedRef = React.useRef(false)
  const committedRef = React.useRef<CommittedState>({ search, status, page, pageSize })
  const pendingSizeRef = React.useRef<number | null>(null)
  const [selectedOrder, setSelectedOrder] = React.useState<AdminCustomOrder | null>(null)

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
      if (next !== committedRef.current.search) {
        navigate({ search: next, page: 1 })
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, navigate])

  const handleSearchBlur = () => {
    searchFocusedRef.current = false
    const next = searchInput.trim()
    if (next !== committedRef.current.search) {
      navigate({ search: next, page: 1 })
    }
  }

  const handleSearchFocus = () => {
    searchFocusedRef.current = true
  }

  function handleStatusChange(next: CustomOrderStatus | "all") {
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
            placeholder="Search custom requests by name, design, phone…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {PIPELINE_TABS.map((tab) => {
            const count = counts[tab.value] ?? 0
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

      {/* Custom Orders Table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[70px] text-xs">Ref</TableHead>
                <TableHead className="text-xs">Order #</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Design Requirement</TableHead>
                <TableHead className="text-xs">Specs &amp; LED</TableHead>
                <TableHead className="text-xs">Custom Price</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="w-[80px] text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell>
                      {order.referenceImage ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={order.referenceImage}
                            alt="Reference preview"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <SparklesIcon className="size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      <Link
                        href={`/admin/custom-orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="block font-sans text-[10px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {order.customerPhone}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80">
                          {order.country}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs leading-relaxed text-foreground line-clamp-2">
                        {order.designRequirement}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-foreground">
                          {order.sizeOption === "custom"
                            ? order.customDimensions
                            : order.sizeOption}
                        </span>
                        {order.withBacklitLed ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-600">
                            <LightbulbIcon className="size-2.5" /> Backlit LED
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Plain Metal</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.quotedPrice != null ? (
                        <span className="text-xs font-bold text-foreground">
                          {formatPrice(order.quotedPrice / 100)}
                        </span>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-[10px] text-amber-600 border-amber-500/20">
                          Needs Pricing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getCustomStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/admin/custom-orders/${order.id}`} />}
                          nativeButton={false}
                          onClick={(e) => e.stopPropagation()}
                          title="Full custom order details page"
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
                    No custom orders found in this pipeline tab.
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
          itemName="custom orders"
        />
      </div>

      {/* Quote inspection dialog */}
      {selectedOrder && (
        <CustomOrderDialog
          key={selectedOrder.id}
          open={!!selectedOrder}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null)
          }}
          order={selectedOrder}
        />
      )}
    </div>
  )
}
