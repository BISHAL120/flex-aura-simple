import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { KPICards } from "@/components/admin/overview/kpi-cards"
import { RevenueChart } from "@/components/admin/overview/revenue-chart"
import { CategoryPieChart } from "@/components/admin/overview/category-pie-chart"
import { RecentOrdersTable } from "@/components/admin/overview/recent-orders-table"
import { PendingCustomOrders } from "@/components/admin/overview/pending-custom-orders"
import {
  getCustomOrderDashboardCounts,
  getRecentOpenCustomOrders,
} from "@/lib/data-layer/admin/custom-orders/custom-order-data-layer"
import { mapCustomOrdersToAdminCustomOrders } from "@/lib/data-layer/admin/custom-orders/custom-order-mapper"
import {
  getOrderDashboardStats,
  getRecentOrders,
} from "@/lib/data-layer/admin/orders/order-data-layer"
import { mapOrdersToAdminOrders } from "@/lib/data-layer/admin/orders/order-mapper"

export const metadata: Metadata = {
  title: "Admin Overview — Flex Aura",
  description: "Administrative control center for Flex Aura metal art and custom backlit fabrication.",
}

export default async function AdminOverviewPage() {
  const [customOrderCounts, recentCustomOrders, orderStats, recentOrders] = await Promise.all([
    getCustomOrderDashboardCounts(),
    getRecentOpenCustomOrders(4),
    getOrderDashboardStats(),
    getRecentOrders(5),
  ])
  const recentCustom = mapCustomOrdersToAdminCustomOrders(recentCustomOrders)
  const recent = mapOrdersToAdminOrders(recentOrders)

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Workshop Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time analytics, order queue, and laser cutting fabrication workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/custom-orders" />}
            nativeButton={false}
            className="text-xs h-9 gap-1.5"
          >
            <SparklesIcon className="size-3.5 text-amber-500" />
            <span>Custom Orders</span>
          </Button>
          <Button
            size="sm"
            render={<Link href="/admin/products" />}
            nativeButton={false}
            className="text-xs h-9 gap-1.5"
          >
            <PlusIcon className="size-3.5" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards customOrderCounts={customOrderCounts} orderCounts={orderStats} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersTable orders={recent} />
        <PendingCustomOrders orders={recentCustom} />
      </div>
    </div>
  )
}
