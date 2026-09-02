"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import type { CustomOrderInquiry, CustomOrderStatus } from "@/lib/admin-data"

const STATUS_OPTIONS: { value: CustomOrderStatus; label: string }[] = [
  { value: "new", label: "New (Needs Pricing)" },
  { value: "quoted", label: "Priced (Awaiting Customer Approval)" },
  { value: "approved", label: "Approved & CAD Confirmed" },
  { value: "in-production", label: "In Laser Cutting & Coating" },
  { value: "completed", label: "Completed & Dispatched" },
  { value: "declined", label: "Declined" },
]

export function CustomOrderDetailsView({ inquiry: initialInquiry }: { inquiry: CustomOrderInquiry }) {
  const liveInquiry = initialInquiry

  const [quotePrice, setQuotePrice] = React.useState(
    liveInquiry.quotedPrice ? liveInquiry.quotedPrice.toString() : ""
  )
  const [status, setStatus] = React.useState<CustomOrderStatus>(liveInquiry.status)
  const [notes, setNotes] = React.useState(liveInquiry.notes ?? "")
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.add({
      type: "success",
      title: "Custom order saved",
      description: `Inquiry ${liveInquiry.inquiryNumber} status updated to ${status}.`,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const inquiry = liveInquiry

  // WhatsApp reply link
  const waPhone = inquiry.customerPhone.replace(/[^0-9]/g, "")
  const quotedAmountStr = quotePrice ? `$${quotePrice}` : "your requested specification"
  const waReplyMessage = encodeURIComponent(
    `Hi ${inquiry.customerName}! Flex Aura here regarding your custom metal art order (${inquiry.inquiryNumber}). We have reviewed your design requirement: "${inquiry.designRequirement.slice(0, 60)}...". Our custom price for this piece is ${quotedAmountStr}. Would you like us to prepare the initial CAD drawing for your approval?`
  )
  const waReplyLink = `https://wa.me/${waPhone}?text=${waReplyMessage}`

  return (
    <div className="flex flex-col gap-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
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
                Custom Order: {inquiry.inquiryNumber}
              </h1>
              <Badge variant="secondary" className="capitalize text-xs">
                {inquiry.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted on {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
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
            className="gap-1.5 text-xs bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 border-emerald-500/30"
          >
            <SendIcon className="size-3.5" />
            <span>Send WhatsApp Message</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 text-xs font-semibold"
          >
            <SaveIcon className="size-3.5" />
            <span>{savedSuccess ? "Saved!" : "Save Custom Order"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Design Specs & Photo & Quote Controls */}
        <div className="flex flex-col gap-6">
          {/* Design Request Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                <SparklesIcon className="size-4 text-amber-500" />
                Custom Design Requirements
              </CardTitle>
              <CardDescription className="text-xs">
                Customer submitted concept and technical requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="rounded-lg border bg-muted/20 p-4 leading-relaxed text-foreground">
                {inquiry.designRequirement}
              </div>

              {inquiry.specialRequest && (
                <div className="flex flex-col gap-1 rounded-lg border bg-amber-500/5 border-amber-500/20 p-3 text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">
                    Special Mounting / Finish Request:
                  </span>
                  <p className="text-muted-foreground">{inquiry.specialRequest}</p>
                </div>
              )}

              {/* Specs & Dimensions */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                    <RulerIcon className="size-3" /> Requested Sizing
                  </span>
                  <span className="font-medium text-sm text-foreground">
                    {inquiry.sizeOption === "custom"
                      ? inquiry.customDimensions
                      : inquiry.sizeOption}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Precision 2mm Fibre Laser Profile Cut
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                    <LightbulbIcon className="size-3" /> LED Backlight Feature
                  </span>
                  {inquiry.withBacklitLed ? (
                    <span className="font-medium text-sm text-amber-600 flex items-center gap-1">
                      Warm White Ambient LED Strip Included
                    </span>
                  ) : (
                    <span className="font-medium text-sm text-muted-foreground">
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
                  className="gap-1.5 text-xs font-semibold"
                >
                  <SaveIcon className="size-3.5" />
                  <span>{savedSuccess ? "Saved!" : "Save Custom Order"}</span>
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
              {inquiry.referenceImage ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={inquiry.referenceImage}
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
              <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                <UserIcon className="size-4 text-primary" />
                Customer Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Full Name
                </span>
                <span className="font-medium text-sm text-foreground">
                  {inquiry.customerName}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Email Address
                </span>
                <a
                  href={`mailto:${inquiry.customerEmail}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <MailIcon className="size-3" />
                  {inquiry.customerEmail}
                </a>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Phone / WhatsApp
                </span>
                <a
                  href={`tel:${inquiry.customerPhone}`}
                  className="flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground"
                >
                  <PhoneIcon className="size-3" />
                  {inquiry.customerPhone}
                </a>
              </div>

              <div className="flex flex-col gap-0.5 border-t pt-3">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Delivery Destination
                </span>
                <span className="text-muted-foreground">{inquiry.deliveryAddress}</span>
                <span className="font-medium text-foreground">{inquiry.country}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
