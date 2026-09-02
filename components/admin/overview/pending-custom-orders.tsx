"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, SparklesIcon, LightbulbIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/data"
import { initialCustomOrders, type CustomOrderInquiry } from "@/lib/admin-data"

export function PendingCustomOrders() {
  const customOrders: CustomOrderInquiry[] = initialCustomOrders
  const pendingInquiries = customOrders.slice(0, 4)

  return (
    <Card className="flex flex-col border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-lg font-semibold tracking-tight flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-500" />
            Custom Orders Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            Inbound custom silhouettes, backlit signs &amp; personalized pieces
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/custom-orders" />}
          nativeButton={false}
          className="text-xs h-8 gap-1"
        >
          <span>Manage orders</span>
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {pendingInquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start gap-3 min-w-0">
              {inquiry.referenceImage ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={inquiry.referenceImage}
                    alt={inquiry.customerName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <SparklesIcon className="size-5" />
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {inquiry.customerName}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ({inquiry.inquiryNumber})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {inquiry.designRequirement}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {inquiry.sizeOption === "custom"
                      ? inquiry.customDimensions
                      : inquiry.sizeOption}
                  </span>
                  {inquiry.withBacklitLed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.2 text-amber-600 font-medium text-[10px]">
                      <LightbulbIcon className="size-2.5" /> Backlit LED
                    </span>
                  )}
                  <span>· {inquiry.country}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {inquiry.quotedPrice ? (
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(inquiry.quotedPrice)}
                </span>
              ) : (
                <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20">
                  Needs Pricing
                </Badge>
              )}
              <Badge variant="secondary" className="capitalize text-[10px]">
                {inquiry.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
