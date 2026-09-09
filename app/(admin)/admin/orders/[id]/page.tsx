import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrderDetailsView } from "@/components/admin/orders/order-details-view"
import {
  getOrderById,
  getOrderByOrderNumber,
} from "@/lib/data-layer/admin/orders/order-data-layer"
import { mapOrderToAdminOrder } from "@/lib/data-layer/admin/orders/order-mapper"

export const metadata: Metadata = {
  title: "Order Details — Flex Aura Admin",
  description: "Review and update a customer order's status, tracking, and notes.",
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The URL may reference either the Mongo id or the human order number.
  const dbOrder = (await getOrderById(id)) ?? (await getOrderByOrderNumber(id))

  if (!dbOrder) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Order Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          No customer order matching &quot;{id}&quot; was found in the workshop system.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/orders" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Orders Pipeline
        </Button>
      </div>
    )
  }

  return (
    <OrderDetailsView key={dbOrder.id} order={mapOrderToAdminOrder(dbOrder)} />
  )
}
