"use client"

import * as React from "react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { categorySalesData } from "@/lib/admin-data"

const COLORS = [
  "oklch(0.205 0 0)",
  "oklch(0.556 0 0)",
  "oklch(0.708 0 0)",
  "oklch(0.87 0 0)",
]

export function CategoryPieChart() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  return (
    <Card className="flex flex-col border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg font-semibold tracking-tight">
          Sales by Category
        </CardTitle>
        <CardDescription className="text-xs">
          Distribution across metal silhouette styles
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center pt-2 pb-4">
        <div className="h-[200px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categorySalesData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="stroke-background transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-popover p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-foreground">{data.name}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {data.value}% of sales ({data.count} units)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Loading category breakdown…
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 grid grid-cols-2 gap-2 w-full pt-2 border-t">
          {categorySalesData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-medium text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
