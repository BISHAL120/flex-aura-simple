import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { CustomOrderStatus } from "@prisma/client"
import { CustomOrderTable } from "@/components/admin/custom-orders/custom-order-table"
import {
  getAllCustomOrders,
} from "@/lib/data-layer/admin/custom-orders/custom-order-data-layer"
import { mapCustomOrdersToAdminCustomOrders } from "@/lib/data-layer/admin/custom-orders/custom-order-mapper"
import { CUSTOM_ORDER_STATUSES } from "@/lib/admin-custom-orders-data"

export const metadata: Metadata = {
  title: "Custom Orders — Flex Aura Admin",
  description: "Manage inbound custom laser-cut art requests, backlit signs, custom dimensions, and customer orders.",
}

const VALID_PAGE_SIZES = [6, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 6

export default async function AdminCustomOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = (params?.search || "").trim()

  const rawStatus = params?.status || "all"
  const status: CustomOrderStatus | "all" =
    rawStatus !== "all" && CUSTOM_ORDER_STATUSES.includes(rawStatus as CustomOrderStatus)
      ? (rawStatus as CustomOrderStatus)
      : "all"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const result = await getAllCustomOrders(page, pageSize, search, status)
  const orders = mapCustomOrdersToAdminCustomOrders(result.orders)

  // If the requested page is out of range, send the user back to a valid page.
  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const redirectParams = new URLSearchParams()
    if (search) redirectParams.set("search", search)
    if (status !== "all") redirectParams.set("status", status)
    if (pageSize !== DEFAULT_PAGE_SIZE) redirectParams.set("per_page", String(pageSize))
    redirectParams.set("page", "1")
    redirect(`/admin/custom-orders?${redirectParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Custom Orders Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review reference photos, custom sizing specifications, pricing estimates, and customer requests.
        </p>
      </div>

      <CustomOrderTable
        orders={orders}
        counts={result.counts}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        search={search}
        status={status}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
