import { AdminShell } from "@/components/admin/admin-shell"
import { isAdmin } from "@/lib/check-Access"
import { getCustomOrderDashboardCounts } from "@/lib/data-layer/admin/custom-orders/custom-order-data-layer"
import * as React from "react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

  await isAdmin()

  const customOrderCounts = await getCustomOrderDashboardCounts()

  return (
    <AdminShell customOrderCounts={customOrderCounts}>{children}</AdminShell>
  )
}
