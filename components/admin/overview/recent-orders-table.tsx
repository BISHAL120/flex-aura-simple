"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice } from "@/lib/data"
import type { AdminOrder } from "@/lib/admin-orders-data"

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>
    case "processing":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Processing</Badge>
    case "in-production":
      return <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20">Laser Cutting</Badge>
    case "powder-coating":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">Powder Coating</Badge>
    case "shipped":
      return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20">Shipped</Badge>
    case "delivered":
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Delivered</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function RecentOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const recentOrders = React.useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [orders])

  return (
    <Card className="flex flex-col border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-lg font-semibold tracking-tight">
            Recent Orders
          </CardTitle>
          <CardDescription className="text-xs">
            Live orders moving through the workshop
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/orders" />}
          nativeButton={false}
          className="text-xs h-8 gap-1"
        >
          <span>View all orders</span>
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px] text-xs">Order</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Items</TableHead>
                <TableHead className="text-xs">Total</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">
                        {order.customerName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {order.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
