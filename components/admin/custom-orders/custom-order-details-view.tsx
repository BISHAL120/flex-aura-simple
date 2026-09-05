"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  SparklesIcon,
  LightbulbIcon,
  RulerIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  SaveIcon,
  Loader2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showError, showSuccess } from "@/lib/toast"
import {
  CUSTOM_ORDER_STATUS_LABELS,
  CUSTOM_ORDER_STATUSES,
  type AdminCustomOrder,
  type CustomOrderStatus,
} from "@/lib/admin-custom-orders-data"
import { patchCustomOrder } from "@/lib/data-layer/admin/custom-orders/custom-order-actions"

const STATUS_OPTIONS: { value: CustomOrderStatus; label: string }[] =
  CUSTOM_ORDER_STATUSES.map((s) => ({ value: s, label: CUSTOM_ORDER_STATUS_LABELS[s] }))

export function CustomOrderDetailsView({ order }: { order: AdminCustomOrder }) {
  const router = useRouter()
  const [quotePrice, setQuotePrice] = React.useState(
    order.quotedPrice != null ? (order.quotedPrice / 100).toString() : ""
  )
  const [status, setStatus] = React.useState<CustomOrderStatus>(order.status)
  const [notes, setNotes] = React.useState(order.notes ?? "")
  const [saving, setSaving] = React.useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    const price = quotePrice.trim()
    const quotedPrice = price === "" ? null : Number(price)
    if (price !== "" && (Number.isNaN(quotedPrice) || (quotedPrice as number) < 0)) {
      showError({ message: "Please enter a valid quoted price." })
      setSaving(false)
      return
    }

    try {
      await patchCustomOrder(order.id, {
        status,
        notes: notes.trim() || null,
        quotedPrice,
      })
      showSuccess({
        title: "Custom order updated",
        message: `${order.orderNumber} status updated to ${CUSTOM_ORDER_STATUS_LABELS[status]}.`,
      })
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update custom order",
      })
    } finally {
      setSaving(false)
    }
  }

  // WhatsApp reply link
  const waPhone = order.customerPhone.replace(/[^0-9]/g, "")
  const quotedAmountStr = quotePrice ? `$${quotePrice}` : "your requested specification"
  const waReplyMessage = encodeURIComponent(
    `Hi ${order.customerName}! Flex Aura here regarding your custom metal art order (${order.orderNumber}). We have reviewed your design requirement: "${order.designRequirement.slice(0, 60)}...". Our custom price for this piece is ${quotedAmountStr}. Would you like us to prepare the initial CAD drawing for your approval?`
  )
  const waReplyLink = `https://wa.me/${waPhone}?text=${waReplyMessage}`

  return (
    <div className="flex flex-col gap-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/custom-orders" />}
            nativeButton={false}
            title="Back to custom orders list"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Custom Order: {order.orderNumber}
              </h1>
              <Badge variant="secondary" className="text-xs capitalize">
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
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
            render={<a href={waReplyLink} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            className="gap-1.5 border-emerald-500/30 bg-emerald-600/10 text-xs text-emerald-700 hover:bg-emerald-600/20"
          >
            <SendIcon className="size-3.5" />
            <span>Send WhatsApp Message</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 text-xs font-semibold"
          >
            {saving ? <Loader2Icon className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
            <span>{saving ? "Saving…" : "Save Custom Order"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Design Specs & Photo & Quote Controls */}
        <div className="flex flex-col gap-6">
          {/* Design Request Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
                <SparklesIcon className="size-4 text-amber-500" />
                Custom Design Requirements
              </CardTitle>
              <CardDescription className="text-xs">
                Customer submitted concept and technical requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="rounded-lg border bg-muted/20 p-4 leading-relaxed text-foreground">
                {order.designRequirement}
              </div>

              {order.specialRequest && (
                <div className="flex flex-col gap-1 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">
                    Special Mounting / Finish Request:
                  </span>
                  <p className="text-muted-foreground">{order.specialRequest}</p>
                </div>
              )}

              {/* Specs & Dimensions */}
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase">
                    <RulerIcon className="size-3" /> Requested Sizing
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {order.sizeOption === "custom" ? order.customDimensions : order.sizeOption}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Precision 2mm Fibre Laser Profile Cut
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase">
                    <LightbulbIcon className="size-3" /> LED Backlight Feature
                  </span>
                  {order.withBacklitLed ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                      Warm White Ambient LED Strip Included
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      Standard Matte Black Powder Coat (No LED)
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    Includes 1.5cm floating wall standoffs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Status Controls */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Pricing &amp; Status Management
              </CardTitle>
              <CardDescription className="text-xs">
                Set final custom price and update order production status
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="view-quote-price" className="font-semibold">
                    Custom Price ($ USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="view-quote-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      placeholder="e.g. 245.00"
                      className="h-9 pl-7 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="view-quote-status" className="font-semibold">
                    Order Status
                  </Label>
                  <select
                    id="view-quote-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CustomOrderStatus)}
                    className="h-9 w-full rounded-md border bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Workshop Internal Notes */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="view-quote-notes" className="font-semibold">
                  Workshop Internal Notes &amp; CAD Specs
                </Label>
                <Textarea
                  id="view-quote-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Vector artwork traced from customer photo; 3mm anchor points verified..."
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  size="sm"
                  disabled={saving}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {saving ? <Loader2Icon className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
                  <span>{saving ? "Saving…" : "Save Custom Order"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reference Image & Customer Profile */}
        <div className="flex flex-col gap-6">
          {/* Reference Photo Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Customer Reference Art Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              {order.referenceImage ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={order.referenceImage}
                    alt="Customer reference design"
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted/40 text-xs text-muted-foreground">
                  No reference photo attached
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Profile Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
                <UserIcon className="size-4 text-primary" />
                Customer Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Full Name
                </span>
                <span className="text-sm font-medium text-foreground">
                  {order.customerName}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
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
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
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

              <div className="flex flex-col gap-0.5 border-t pt-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Delivery Destination
                </span>
                <span className="text-muted-foreground">{order.deliveryAddress || "—"}</span>
                <span className="font-medium text-foreground">{order.country}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
