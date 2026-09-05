import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CustomOrderDetailsView } from "@/components/admin/custom-orders/custom-order-details-view"
import {
  getCustomOrderById,
  getCustomOrderByOrderNumber,
} from "@/lib/data-layer/admin/custom-orders/custom-order-data-layer"
import { mapCustomOrderToAdminCustomOrder } from "@/lib/data-layer/admin/custom-orders/custom-order-mapper"

export const metadata: Metadata = {
  title: "Custom Order Details — Flex Aura Admin",
  description: "Review and update a custom laser-cut art order's quote, status, and workshop notes.",
}

export default async function AdminCustomOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The URL may reference either the Mongo id or the human order number.
  const dbOrder =
    (await getCustomOrderById(id)) ?? (await getCustomOrderByOrderNumber(id))

  if (!dbOrder) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Custom Order Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          No custom metal art order matching &quot;{id}&quot; was found in the workshop records.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/custom-orders" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Custom Orders
        </Button>
      </div>
    )
  }

  return (
    <CustomOrderDetailsView
      key={dbOrder.id}
      order={mapCustomOrderToAdminCustomOrder(dbOrder)}
    />
  )
}
