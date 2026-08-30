"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import { CustomOrderDetailsView } from "@/components/admin/custom-orders/custom-order-details-view"

export default function AdminCustomOrderDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const { customOrders, hasHydrated } = useAdminStore()

  const inquiry = React.useMemo(() => {
    return customOrders.find((c) => c.id === id || c.inquiryNumber.toLowerCase() === id?.toLowerCase())
  }, [customOrders, id])

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Custom Inquiry Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          No custom metal art inquiry matching &quot;{id}&quot; was found in the workshop records.
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

  return <CustomOrderDetailsView key={inquiry.id} inquiry={inquiry} />
}
