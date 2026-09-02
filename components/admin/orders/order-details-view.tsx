"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeftIcon,
  PrinterIcon,
  TruckIcon,
  CheckCircle2Icon,
  ClockIcon,
  SparklesIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  SaveIcon,
  FlameIcon,
  BoxIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/data"
import { toast } from "@/components/ui/toast"
import { getOrderStatusBadge } from "@/components/admin/overview/recent-orders-table"
import type { AdminOrder, OrderItem, OrderStatus } from "@/lib/admin-data"

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: "pending", label: "Order Placed", icon: ClockIcon },
  { status: "processing", label: "CAD Queued", icon: SparklesIcon },
  { status: "in-production", label: "Laser Cutting", icon: FlameIcon },
  { status: "powder-coating", label: "Powder Coating", icon: BoxIcon },
  { status: "shipped", label: "Dispatched", icon: TruckIcon },
  { status: "delivered", label: "Delivered", icon: CheckCircle2Icon },
]

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending (New Order Placed)" },
  { value: "processing", label: "Processing (CAD Model Prepared)" },
  { value: "in-production", label: "In Laser Production (2mm Fibre Laser)" },
  { value: "powder-coating", label: "Powder Coating (Matte Black Finish)" },
  { value: "shipped", label: "Shipped / Dispatched with Carrier" },
  { value: "delivered", label: "Delivered to Customer" },
  { value: "cancelled", label: "Cancelled / Refunded" },
]

function getStepIndex(status: OrderStatus) {
  switch (status) {
    case "pending":
      return 0
    case "processing":
      return 1
    case "in-production":
      return 2
    case "powder-coating":
      return 3
    case "shipped":
      return 4
    case "delivered":
      return 5
    default:
      return -1
  }
}

export function OrderDetailsView({ order: initialOrder }: { order: AdminOrder }) {
  const liveOrder = initialOrder

  const [currentStatus, setCurrentStatus] = React.useState<OrderStatus>(liveOrder.status)
  const [trackingNumber, setTrackingNumber] = React.useState(liveOrder.trackingNumber ?? "")
  const [notes, setNotes] = React.useState(liveOrder.notes ?? "")
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  const activeStepIdx = getStepIndex(currentStatus)

  function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault()
    toast.add({
      type: "success",
      title: "Order updated",
      description: "Order status, tracking, and notes saved successfully.",
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  function handlePrint() {
    window.print()
  }

  const order = liveOrder

  return (
    <div className="flex flex-col gap-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/orders" />}
            nativeButton={false}
            title="Back to orders list"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Order {order.orderNumber}
              </h1>
              {getOrderStatusBadge(currentStatus)}
            </div>
            <p className="text-xs text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <PrinterIcon className="size-3.5" />
            <span>Print Packing Slip</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveStatus}
            className="gap-1.5 text-xs font-semibold"
          >
            <SaveIcon className="size-3.5" />
            <span>{savedSuccess ? "Saved!" : "Save Updates"}</span>
          </Button>
        </div>
      </div>

      {/* Production Progress Stepper (Hidden on cancel) */}
      {currentStatus !== "cancelled" && (
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-sm font-semibold flex items-center justify-between">
              <span>Workshop Fulfillment Lifecycle</span>
              <span className="text-xs font-normal text-muted-foreground">
                Step {activeStepIdx + 1} of 6
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              {STATUS_STEPS.map((step, idx) => {
                const StepIcon = step.icon
                const isCompleted = activeStepIdx >= idx
                const isCurrent = activeStepIdx === idx

                return (
                  <button
                    key={step.status}
                    type="button"
                    onClick={() => setCurrentStatus(step.status)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                        : isCompleted
                        ? "border-border bg-muted/40 text-foreground"
                        : "border-dashed border-muted text-muted-foreground opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`flex size-8 items-center justify-center rounded-full ${
                        isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="size-4" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight">{step.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Ordered Items & Workshop Fulfillment Controls */}
        <div className="flex flex-col gap-6">
          {/* Ordered Line Items */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Ordered Metal Art Pieces ({order.items.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Laser-cut artwork, selected dimensions, and quantity breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y text-xs">
              {order.items.map((item: OrderItem, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-xs text-foreground">
                        {item.productName}
                      </span>
                      <span className="text-muted-foreground">
                        Dimensions: <strong>{item.variant}</strong> · 2mm Steel
                      </span>
                      <span className="text-muted-foreground">
                        Unit Price: {formatPrice(item.price)} × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-heading text-sm font-bold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              {/* Order Financials Summary */}
              <div className="pt-4 flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping &amp; Express Protective Crate</span>
                  <span className="text-foreground">
                    {order.shipping === 0 ? "Free (Standard Promo)" : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                  <span>Total Amount Paid</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Status & Tracking Management */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Fulfillment Controls &amp; Shipment Tracking
              </CardTitle>
              <CardDescription className="text-xs">
                Update status and assign carrier tracking codes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="order-status-select" className="font-semibold">
                    Current Fulfillment Status
                  </Label>
                  <select
                    id="order-status-select"
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                    className="h-9 w-full rounded-md border bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="order-tracking-input" className="font-semibold">
                    Carrier Tracking Number
                  </Label>
                  <Input
                    id="order-tracking-input"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DHL-849204821DE"
                    className="h-9 text-xs font-mono font-medium"
                  />
                </div>
              </div>

              {/* Workshop Internal Notes */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="order-notes-input" className="font-semibold">
                  Workshop Internal Notes &amp; Special Handling
                </Label>
                <Textarea
                  id="order-notes-input"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Added extra silicone wall standoffs; package inspected and boxed at station #2..."
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleSaveStatus}
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <SaveIcon className="size-3.5" />
                  <span>{savedSuccess ? "Status & Notes Saved!" : "Save Changes"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Shipping Profile */}
        <div className="flex flex-col gap-6">
          {/* Customer Profile Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                <UserIcon className="size-4 text-primary" />
                Customer Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Full Name
                </span>
                <span className="font-medium text-sm text-foreground">
                  {order.customerName}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Email Address
                </span>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <MailIcon className="size-3" />
                  {order.customerEmail}
                </a>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Phone / WhatsApp
                </span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground"
                >
                  <PhoneIcon className="size-3" />
                  {order.customerPhone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                <MapPinIcon className="size-4 text-primary" />
                Shipping Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground text-sm">
                {order.customerName}
              </span>
              <span>{order.shippingAddress.street}</span>
              <span>
                {order.shippingAddress.city}, {order.shippingAddress.zip}
              </span>
              <span className="font-medium text-foreground">
                {order.shippingAddress.country}
              </span>
            </CardContent>
          </Card>

          {/* Payment & Security */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                <CreditCardIcon className="size-4 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                >
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Reference</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {order.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
