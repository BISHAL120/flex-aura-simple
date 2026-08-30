"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

interface DataPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  itemName?: string
}

export function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [8, 16, 32],
  onPageChange,
  onPageSizeChange,
  itemName = "items",
}: DataPaginationProps) {
  if (totalItems === 0) return null

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
      {/* Left: Item Range & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-foreground">{startItem}–{endItem}</strong> of{" "}
          <strong className="text-foreground">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 pl-2 border-l">
            <span className="text-[11px]">Rows:</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              className="h-7 rounded border bg-background px-2 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-ring"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First page"
            aria-label="Go to first page"
          >
            <ChevronsLeftIcon className="size-3.5" />
          </Button>

          {/* Previous Page */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            title="Previous page"
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>

          {/* Number Buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs text-muted-foreground select-none"
                  >
                    …
                  </span>
                )
              }
              const isActive = p === currentPage
              return (
                <Button
                  key={p}
                  type="button"
                  variant={isActive ? "outline" : "ghost"}
                  size="icon-xs"
                  onClick={() => onPageChange(p)}
                  className={`h-7 w-7 text-xs font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            })}
          </div>

          {/* Next Page */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            title="Next page"
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>

          {/* Last Page */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last page"
            aria-label="Go to last page"
          >
            <ChevronsRightIcon className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
