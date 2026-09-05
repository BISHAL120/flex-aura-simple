"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  SparklesIcon,
  LightbulbIcon,
  RulerIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  ExternalLinkIcon,
  Loader2Icon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface CustomOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: AdminCustomOrder
}

export function CustomOrderDialog({ open, onOpenChange, order }: CustomOrderDialogProps) {
  const router = useRouter()
  const [quotePrice, setQuotePrice] = React.useState("")
  const [status, setStatus] = React.useState<CustomOrderStatus>("new")
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        // quotedPrice is stored as integer cents; the admin edits in dollars.
        setQuotePrice(order.quotedPrice != null ? (order.quotedPrice / 100).toString() : "")
        setStatus(order.status)
        setNotes(order.notes ?? "")
      })
    }
  }, [open, order])

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
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update custom order",
      })
    } finally {
      setSaving(false)
    }
  }

  // Build WhatsApp pre-filled response link
  const waPhone = order.customerPhone.replace(/[^0-9]/g, "")
  const quotedAmountStr = quotePrice ? `$${quotePrice}` : "your requested specification"
  const waReplyMessage = encodeURIComponent(
    `Hi ${order.customerName}! Flex Aura here regarding your custom metal art order (${order.orderNumber}). We have reviewed your design request: "${order.designRequirement.slice(0, 60)}...". Our custom price for this piece is ${quotedAmountStr}. Would you like us to prepare the initial CAD drawing for your approval?`
  )
  const waReplyLink = `https://wa.me/${waPhone}?text=${waReplyMessage}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading flex items-center gap-2 text-lg font-semibold">
              <SparklesIcon className="size-4.5 text-amber-500" />
              Custom Order: {order.orderNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {order.status}
              </Badge>
              <Button
                variant="outline"
                size="xs"
                render={<Link href={`/admin/custom-orders/${order.id}`} />}
                nativeButton={false}
                className="h-6 gap-1 px-2 text-[11px]"
                title="Open full page view"
              >
                <ExternalLinkIcon className="size-3" />
                <span>Full Page</span>
              </Button>
            </div>
          </div>
          <DialogDescription className="text-xs">
            Request submitted on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-5 py-2">
          {/* Customer & Address Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3.5 text-xs">
              <span className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                <UserIcon className="size-3.5 text-muted-foreground" />
                Customer Contact
              </span>
              <span className="font-medium text-foreground">{order.customerName}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MailIcon className="size-3" /> {order.customerEmail}
              </span>
              <span className="flex items-center gap-1 font-mono text-muted-foreground">
                <PhoneIcon className="size-3" /> {order.customerPhone}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3.5 text-xs">
              <span className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                <MapPinIcon className="size-3.5 text-muted-foreground" />
                Delivery Location
              </span>
              <span className="text-muted-foreground">{order.deliveryAddress || "—"}</span>
              <span className="mt-0.5 font-medium text-foreground">{order.country}</span>
            </div>
          </div>

          {/* Design Specs & Reference Photo */}
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
            <span className="text-xs font-semibold text-foreground">Design Requirements &amp; Specs</span>
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              {order.referenceImage && (
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={order.referenceImage}
                    alt="Reference Art"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5 text-xs">
                <p className="leading-relaxed text-foreground">
                  {order.designRequirement}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-[11px]">
                    <RulerIcon className="size-3" />
                    Size: {order.sizeOption === "custom" ? order.customDimensions : order.sizeOption}
                  </Badge>
                  {order.withBacklitLed ? (
                    <Badge className="gap-1 border-amber-500/30 bg-amber-500/15 text-[11px] text-amber-700 dark:text-amber-300">
                      <LightbulbIcon className="size-3" /> Backlit Warm LED Strip
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[11px]">
                      Plain Powder-Coated Metal
                    </Badge>
                  )}
                </div>
                {order.specialRequest && (
                  <p className="mt-1 text-[11px] italic text-muted-foreground">
                    Special notes: {order.specialRequest}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Status Controls */}
          <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custom-quote-price" className="text-xs font-semibold">
                Quoted Price ($ USD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  id="custom-quote-price"
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
              <Label htmlFor="custom-quote-status" className="text-xs font-semibold">
                Order Status
              </Label>
              <select
                id="custom-quote-status"
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

          {/* Internal Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-quote-notes" className="text-xs font-medium">
              Internal Workshop Notes
            </Label>
            <Textarea
              id="custom-quote-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs 3mm thickness fibre cut; customer asked for brass finish…"
              className="text-xs"
            />
          </div>

          {/* WhatsApp Direct Action Helper */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Direct WhatsApp Reply
              </span>
              <span className="text-[11px] text-muted-foreground">
                Opens a chat with the current quote pre-filled for this order.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<a href={waReplyLink} target="_blank" rel="noreferrer" />}
              nativeButton={false}
              className="h-8 gap-1.5 border-none bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              <SendIcon className="size-3" />
              <span>Send WhatsApp</span>
            </Button>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2Icon className="size-4 animate-spin" />}
              {saving ? "Saving…" : "Save Custom Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
