"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { initialOrders } from "@/lib/admin-data"
import { OrderDetailsView } from "@/components/admin/orders/order-details-view"

export default function AdminOrderDetailsPage() {
  const params = useParams()
  const id = params?.id as string

  const order = React.useMemo(() => {
    return initialOrders.find((o) => o.id === id || o.orderNumber.toLowerCase() === id?.toLowerCase())
  }, [id])

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
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

  return <OrderDetailsView key={order.id} order={order} />
}
