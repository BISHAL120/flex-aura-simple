"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
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
import { toast } from "@/components/ui/toast"
import type { CustomOrderInquiry, CustomOrderStatus } from "@/lib/admin-data"

const STATUS_OPTIONS: { value: CustomOrderStatus; label: string }[] = [
  { value: "new", label: "New (Needs Pricing)" },
  { value: "quoted", label: "Priced (Awaiting Customer Confirmation)" },
  { value: "approved", label: "Approved / Deposit Paid" },
  { value: "in-production", label: "In Laser Production & Coating" },
  { value: "completed", label: "Completed & Delivered" },
  { value: "declined", label: "Declined" },
]

interface CustomOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inquiry: CustomOrderInquiry | null
}

export function CustomOrderDialog({
  open,
  onOpenChange,
  inquiry,
}: CustomOrderDialogProps) {
  const [quotePrice, setQuotePrice] = React.useState("")
  const [status, setStatus] = React.useState<CustomOrderStatus>("new")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (inquiry) {
      queueMicrotask(() => {
        setQuotePrice(inquiry.quotedPrice ? inquiry.quotedPrice.toString() : "")
        setStatus(inquiry.status)
        setNotes(inquiry.notes ?? "")
      })
    }
  }, [inquiry])

  if (!inquiry) return null

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!inquiry) return
    toast.add({
      type: "success",
      title: "Custom order updated",
      description: `Inquiry ${inquiry.inquiryNumber} status updated to ${status}.`,
    })
    onOpenChange(false)
  }

  // Build WhatsApp pre-filled response link
  const waPhone = inquiry.customerPhone.replace(/[^0-9]/g, "")
  const quotedAmountStr = quotePrice ? `$${quotePrice}` : "your requested specification"
  const waReplyMessage = encodeURIComponent(
    `Hi ${inquiry.customerName}! Flex Aura here regarding your custom metal art order (${inquiry.inquiryNumber}). We have reviewed your design request: "${inquiry.designRequirement.slice(0, 60)}...". Our custom price for this piece is ${quotedAmountStr}. Would you like us to prepare the initial CAD drawing for your approval?`
  )
  const waReplyLink = `https://wa.me/${waPhone}?text=${waReplyMessage}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading text-lg font-semibold flex items-center gap-2">
              <SparklesIcon className="size-4.5 text-amber-500" />
              Custom Order: {inquiry.inquiryNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize text-xs">
                {inquiry.status}
              </Badge>
              <Button
                variant="outline"
                size="xs"
                render={<Link href={`/admin/custom-orders/${inquiry.id}`} />}
                nativeButton={false}
                className="h-6 text-[11px] gap-1 px-2"
                title="Open full page view"
              >
                <ExternalLinkIcon className="size-3" />
                <span>Full Page</span>
              </Button>
            </div>
          </div>
          <DialogDescription className="text-xs">
            Inquiry submitted on {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
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
              <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <UserIcon className="size-3.5 text-muted-foreground" />
                Customer Contact
              </span>
              <span className="font-medium text-foreground">{inquiry.customerName}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MailIcon className="size-3" /> {inquiry.customerEmail}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground font-mono">
                <PhoneIcon className="size-3" /> {inquiry.customerPhone}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3.5 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <MapPinIcon className="size-3.5 text-muted-foreground" />
                Delivery Location
              </span>
              <span className="text-muted-foreground">{inquiry.deliveryAddress}</span>
              <span className="font-medium text-foreground mt-0.5">{inquiry.country}</span>
            </div>
          </div>

          {/* Design Specs & Reference Photo */}
          <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
            <span className="font-semibold text-xs text-foreground">Design Requirements &amp; Specs</span>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {inquiry.referenceImage && (
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={inquiry.referenceImage}
                    alt="Reference Art"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5 text-xs">
                <p className="text-foreground leading-relaxed">
                  {inquiry.designRequirement}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[11px] gap-1">
                    <RulerIcon className="size-3" />
                    Size: {inquiry.sizeOption === "custom" ? inquiry.customDimensions : inquiry.sizeOption}
                  </Badge>
                  {inquiry.withBacklitLed ? (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1 text-[11px]">
                      <LightbulbIcon className="size-3" /> Backlit Warm LED Strip
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[11px]">
                      Plain Powder-Coated Metal
                    </Badge>
                  )}
                </div>
                {inquiry.specialRequest && (
                  <p className="mt-1 text-[11px] text-muted-foreground italic">
                    Special notes: {inquiry.specialRequest}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Status Controls */}
          <div className="grid gap-4 sm:grid-cols-2 rounded-lg border bg-card p-4">
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
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="e.g. 245.00"
                  className="h-9 pl-7 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custom-quote-status" className="text-xs font-semibold">
                Inquiry Status
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
          <div className="flex items-center justify-between rounded-lg border bg-emerald-500/10 border-emerald-500/20 p-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Direct WhatsApp Reply
              </span>
              <span className="text-[11px] text-muted-foreground">
                Launch chat with prefilled custom price and mock specification
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<a href={waReplyLink} target="_blank" rel="noreferrer" />}
              nativeButton={false}
              className="h-8 text-xs gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 border-none"
            >
              <SendIcon className="size-3" />
              <span>Send WhatsApp</span>
            </Button>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Custom Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
