"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  SearchIcon,
  SparklesIcon,
  LightbulbIcon,
  EyeIcon,
  ExternalLinkIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice } from "@/lib/data"
import { CustomOrderDialog } from "@/components/admin/custom-orders/custom-order-dialog"
import { DataPagination } from "@/components/admin/common/data-pagination"
import { initialCustomOrders, type CustomOrderInquiry, type CustomOrderStatus } from "@/lib/admin-data"

const PIPELINE_TABS: { label: string; value: string }[] = [
  { label: "All Custom Orders", value: "all" },
  { label: "New (Needs Pricing)", value: "new" },
  { label: "Priced / In Review", value: "quoted" },
  { label: "Approved / Deposit", value: "approved" },
  { label: "In Production", value: "in-production" },
  { label: "Completed", value: "completed" },
  { label: "Declined", value: "declined" },
]

function getCustomStatusBadge(status: CustomOrderStatus) {
  switch (status) {
    case "new":
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">New Request</Badge>
    case "quoted":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Priced</Badge>
    case "approved":
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>
    case "in-production":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">In Production</Badge>
    case "completed":
      return <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20">Completed</Badge>
    case "declined":
      return <Badge variant="destructive">Declined</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function CustomOrderTable() {
  const customOrders: CustomOrderInquiry[] = initialCustomOrders
  const [activeTab, setActiveTab] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const [selectedInquiry, setSelectedInquiry] = React.useState<CustomOrderInquiry | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    let list = [...customOrders]

    if (activeTab !== "all") {
      list = list.filter((c) => c.status === activeTab)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.inquiryNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.customerEmail.toLowerCase().includes(q) ||
          c.customerPhone.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.designRequirement.toLowerCase().includes(q)
      )
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [customOrders, activeTab, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))
  const paginatedInquiries = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  function handleOpenInquiry(inquiry: CustomOrderInquiry) {
    setSelectedInquiry(inquiry)
    setDialogOpen(true)
  }

  const getTabCount = (tabValue: string) => {
    if (tabValue === "all") return customOrders.length
    return customOrders.filter((c) => c.status === tabValue).length
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Status Tabs */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search custom requests by name, design, phone…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {PIPELINE_TABS.map((tab) => {
            const count = getTabCount(tab.value)
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value)
                  setPage(1)
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Orders Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[70px] text-xs">Ref</TableHead>
                <TableHead className="text-xs">Order #</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Design Requirement</TableHead>
                <TableHead className="text-xs">Specs &amp; LED</TableHead>
                <TableHead className="text-xs">Custom Price</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="w-[80px] text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInquiries.length > 0 ? (
                paginatedInquiries.map((inquiry) => (
                  <TableRow
                    key={inquiry.id}
                    onClick={() => handleOpenInquiry(inquiry)}
                    className="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell>
                      {inquiry.referenceImage ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={inquiry.referenceImage}
                            alt="Reference preview"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <SparklesIcon className="size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      <Link
                        href={`/admin/custom-orders/${inquiry.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {inquiry.inquiryNumber}
                      </Link>
                      <span className="block text-[10px] text-muted-foreground font-sans">
                        {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground">
                          {inquiry.customerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {inquiry.customerPhone}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80">
                          {inquiry.country}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                        {inquiry.designRequirement}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-foreground">
                          {inquiry.sizeOption === "custom"
                            ? inquiry.customDimensions
                            : inquiry.sizeOption}
                        </span>
                        {inquiry.withBacklitLed ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-600">
                            <LightbulbIcon className="size-2.5" /> Backlit LED
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Plain Metal</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {inquiry.quotedPrice ? (
                        <span className="text-xs font-bold text-foreground">
                          {formatPrice(inquiry.quotedPrice)}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20">
                          Needs Pricing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getCustomStatusBadge(inquiry.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenInquiry(inquiry)
                          }}
                          title="Quick edit & price (Modal)"
                        >
                          <EyeIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/admin/custom-orders/${inquiry.id}`} />}
                          nativeButton={false}
                          onClick={(e) => e.stopPropagation()}
                          title="Full custom order details page"
                        >
                          <ExternalLinkIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    No custom orders found in this pipeline tab.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Reusable Data Pagination */}
        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 12, 24, 48]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="custom orders"
        />
      </div>

      {/* Quote inspection modal */}
      <CustomOrderDialog
        key={selectedInquiry?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inquiry={selectedInquiry}
      />
    </div>
  )
}
