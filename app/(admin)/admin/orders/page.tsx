import * as React from "react"
import type { Metadata } from "next"
import { OrderTable } from "@/components/admin/orders/order-table"

export const metadata: Metadata = {
  title: "Orders & Fulfillment — Flex Aura Admin",
  description: "Manage incoming metal art orders, fibre laser cutting queue, powder coating, and shipments.",
}

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Orders &amp; Workshop Fulfillment
        </h1>
        <p className="text-sm text-muted-foreground">
          Track customer purchases across laser cutting, powder coating, packing, and international dispatch.
        </p>
      </div>

      <OrderTable />
    </div>
  )
}
