import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { OrderStatus } from "@prisma/client"
import { OrderTable } from "@/components/admin/orders/order-table"
import { getAllOrders } from "@/lib/data-layer/admin/orders/order-data-layer"
import { mapOrdersToAdminOrders } from "@/lib/data-layer/admin/orders/order-mapper"

export const metadata: Metadata = {
  title: "Orders & Fulfillment — Flex Aura Admin",
  description: "Manage incoming metal art orders and fulfillment statuses.",
}

const VALID_PAGE_SIZES = [6, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 6

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = (params?.search || "").trim()

  // The UI keeps "in-production"/"powder-coating" tabs; they have no DB
  // results under the current status model, so treat them as "all but empty".
  const rawStatus = params?.status || "all"
  const legacy = rawStatus !== "all" && !ACTIVE_STATUSES.includes(rawStatus as OrderStatus)
  const status: OrderStatus | "all" = legacy
    ? "all"
    : rawStatus !== "all"
      ? (rawStatus as OrderStatus)
      : "all"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const result = await getAllOrders(page, pageSize, search, status)

  if (!legacy && page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const redirectParams = new URLSearchParams()
    if (search) redirectParams.set("search", search)
    if (status !== "all") redirectParams.set("status", status)
    if (pageSize !== DEFAULT_PAGE_SIZE) redirectParams.set("per_page", String(pageSize))
    redirectParams.set("page", "1")
    redirect(`/admin/orders?${redirectParams.toString()}`)
  }

  const orders = legacy ? [] : mapOrdersToAdminOrders(result.orders)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Orders &amp; Workshop Fulfillment
        </h1>
        <p className="text-sm text-muted-foreground">
          Track customer purchases across processing, shipping, and delivery.
        </p>
      </div>

      <OrderTable
        orders={orders}
        counts={result.counts}
        total={legacy ? 0 : result.pagination.total}
        totalPages={legacy ? 0 : result.pagination.totalPages}
        search={search}
        status={rawStatus}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
