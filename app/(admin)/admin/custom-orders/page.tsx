import * as React from "react"
import type { Metadata } from "next"
import { CustomOrderTable } from "@/components/admin/custom-orders/custom-order-table"

export const metadata: Metadata = {
  title: "Custom Orders — Flex Aura Admin",
  description: "Manage inbound custom laser-cut art requests, backlit signs, custom dimensions, and customer orders.",
}

export default function AdminCustomOrdersPage() {
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

      <CustomOrderTable />
    </div>
  )
}
