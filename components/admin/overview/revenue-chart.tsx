"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { revenueMonthlyData } from "@/lib/admin-data"
import { formatPrice } from "@/lib/data"

export function RevenueChart() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  return (
    <Card className="flex flex-col border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-lg font-semibold tracking-tight">
            Revenue &amp; Production Trends
          </CardTitle>
          <CardDescription className="text-xs">
            Monthly gross sales across all metal art &amp; custom LED orders
          </CardDescription>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex text-xs">
          Last 6 Months
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[280px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueMonthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                  className="text-[11px] fill-muted-foreground"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-popover p-3 text-xs shadow-md">
                          <p className="font-semibold text-foreground mb-1.5">{label} 2026</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="size-2 rounded-full bg-primary" />
                                Revenue:
                              </span>
                              <span className="font-bold text-foreground">
                                {formatPrice(payload[0]?.value as number)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="size-2 rounded-full bg-muted-foreground" />
                                Orders:
                              </span>
                              <span className="font-medium text-foreground">
                                {payload[0]?.payload?.orders} units
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Loading trends…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
