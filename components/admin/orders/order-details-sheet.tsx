"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingBagIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ExternalLinkIcon,
  PackageIcon,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from "@/lib/data"
import { toast } from "@/components/ui/toast"
import { getOrderStatusBadge } from "@/components/admin/overview/recent-orders-table"
import type { AdminOrder, OrderStatus } from "@/lib/admin-data"

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending (New Order)" },
  { value: "processing", label: "Processing" },
  { value: "in-production", label: "Laser Cutting (Fibre Laser)" },
  { value: "powder-coating", label: "Powder Coating (Black Matte)" },
  { value: "shipped", label: "Shipped / Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

interface OrderDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: AdminOrder | null
}

export function OrderDetailsSheet({
  open,
  onOpenChange,
  order: initialOrder,
}: OrderDetailsSheetProps) {
  const liveOrder = initialOrder

  const [currentStatus, setCurrentStatus] = React.useState<OrderStatus>("pending")
  const [trackingNumber, setTrackingNumber] = React.useState("")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (liveOrder) {
      queueMicrotask(() => {
        setCurrentStatus(liveOrder.status)
        setTrackingNumber(liveOrder.trackingNumber ?? "")
        setNotes(liveOrder.notes ?? "")
      })
    }
  }, [liveOrder])

  if (!liveOrder) return null
  const order = liveOrder

  function handleStatusChange(newStatus: OrderStatus) {
    if (!order) return
    setCurrentStatus(newStatus)
    toast.add({
      type: "success",
      title: "Order status updated",
      description: `Order status set to ${newStatus}.`,
    })
  }

  function handleSaveTracking(e: React.FormEvent) {
    e.preventDefault()
    if (!order) return
    toast.add({
      type: "success",
      title: "Tracking number saved",
      description: `Tracking number set to ${trackingNumber.trim()}.`,
    })
  }

  function handleSaveNotes() {
    if (!order) return
    toast.add({
      type: "info",
      title: "Notes saved",
      description: "Order notes saved successfully.",
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full! max-w-xl p-0 sm:max-w-xl! overflow-y-auto">
        <SheetHeader className="border-b p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="size-4 text-primary" />
              <SheetTitle className="font-heading text-base font-semibold">
                Order {order.orderNumber}
              </SheetTitle>
            </div>
            <div className="flex items-center gap-2">
              {getOrderStatusBadge(currentStatus)}
              <Button
                variant="outline"
                size="xs"
                render={<Link href={`/admin/orders/${order.id}`} />}
                nativeButton={false}
                className="h-6 text-[11px] gap-1 px-2"
                title="Open full page view"
              >
                <ExternalLinkIcon className="size-3" />
                <span>Full Page</span>
              </Button>
            </div>
          </div>
          <SheetDescription className="text-xs">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-5 text-xs">
          {/* Status Updater Section */}
          <div className="rounded-lg border bg-muted/20 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Fulfillment Status</Label>
              <span className="text-[11px] text-muted-foreground">Live Sync</span>
            </div>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="h-9 w-full rounded-md border bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Tracking number */}
            <form onSubmit={handleSaveTracking} className="flex gap-2 mt-1">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking code (e.g. DHL-982341772DE)"
                className="h-8 text-xs font-mono"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs shrink-0">
                Save Tracking
              </Button>
            </form>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-lg border bg-card p-3.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-muted-foreground" />
                Customer
              </span>
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <span className="font-medium text-foreground">{order.customerName}</span>
                <span className="flex items-center gap-1">
                  <MailIcon className="size-3" /> {order.customerEmail}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon className="size-3" /> {order.customerPhone}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border bg-card p-3.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPinIcon className="size-3.5 text-muted-foreground" />
                Shipping Address
              </span>
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <span>{order.shippingAddress.street}</span>
                <span>
                  {order.shippingAddress.city}, {order.shippingAddress.zip}
                </span>
                <span className="font-medium text-foreground">
                  {order.shippingAddress.country}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
            <span className="font-semibold text-foreground">Ordered Metal Art Pieces</span>
            <div className="divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.productImage ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <PackageIcon className="size-4" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.productName}</span>
                      <span className="text-muted-foreground">
                        Size: {item.variant} · Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financials */}
            <div className="border-t pt-3 flex flex-col gap-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-foreground">
                  {order.shipping === 0 ? "Free Shipping" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span>Payment: {order.paymentMethod}</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Workshop Notes */}
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
            <Label className="font-semibold text-foreground">Workshop Internal Notes</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Included extra transparent wall hook spacers; laser cut completed at 14:00…"
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveNotes}
              className="self-end text-xs h-7"
            >
              Save Notes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
