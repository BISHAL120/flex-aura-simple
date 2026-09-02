"use client"

import * as React from "react"
import {
  DollarSignIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrendingUpIcon,
  LayersIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/data"
import { initialOrders, initialCustomOrders, type AdminOrder, type CustomOrderInquiry } from "@/lib/admin-data"

export function KPICards() {
  const orders: AdminOrder[] = initialOrders
  const customOrders: CustomOrderInquiry[] = initialCustomOrders

  // Calculate live dynamic metrics from store
  const totalRevenue = orders.reduce((sum: number, order: AdminOrder) => sum + order.total, 0)
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
  const pendingProduction = orders.filter(
    (o: AdminOrder) => o.status === "in-production" || o.status === "powder-coating" || o.status === "processing"
  ).length
  const pendingCustomOrders = customOrders.filter((c: CustomOrderInquiry) => c.status === "new" || c.status === "quoted").length

  const kpis = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue + 42850), // base store revenue + active demo
      subtitle: "+14.2% from last month",
      trend: "up",
      icon: DollarSignIcon,
      accent: "text-emerald-500",
      bgAccent: "bg-emerald-500/10",
    },
    {
      title: "Total Orders",
      value: (orders.length + 384).toString(),
      subtitle: `${pendingProduction} in laser cutting & coating`,
      trend: "neutral",
      icon: ShoppingBagIcon,
      accent: "text-blue-500",
      bgAccent: "bg-blue-500/10",
    },
    {
      title: "Custom Orders",
      value: customOrders.length.toString(),
      subtitle: `${pendingCustomOrders} pending design requests`,
      trend: pendingCustomOrders > 0 ? "action" : "neutral",
      icon: SparklesIcon,
      accent: "text-amber-500",
      bgAccent: "bg-amber-500/10",
    },
    {
      title: "Avg. Order Value",
      value: formatPrice(averageOrderValue > 0 ? averageOrderValue : 111.58),
      subtitle: "Includes multi-variant sets",
      trend: "up",
      icon: LayersIcon,
      accent: "text-purple-500",
      bgAccent: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden border bg-card p-0 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
              <div className={`flex size-9 items-center justify-center rounded-lg ${kpi.bgAccent}`}>
                <kpi.icon className={`size-4.5 ${kpi.accent}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {kpi.value}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {kpi.trend === "up" && (
                <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUpIcon className="size-3" />
                </span>
              )}
              {kpi.trend === "action" && (
                <Badge variant="destructive" className="h-4 px-1 text-[10px] uppercase font-bold">
                  Action
                </Badge>
              )}
              <span>{kpi.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
