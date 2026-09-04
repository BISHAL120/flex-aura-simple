"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
import type { AdminProduct } from "@/lib/admin-products-data"

interface ProductDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProduct | null
  onConfirm: () => void
  isLoading?: boolean
  permanent?: boolean
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isLoading = false,
  permanent = false,
}: ProductDeleteDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-semibold text-destructive">
            {permanent ? "Permanently Delete Product?" : "Delete Product?"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {permanent ? (
              <>
                This will permanently remove the product{" "}
                <strong className="text-foreground">{product.name}</strong>, its size
                variants, and the cover image from the database. This action cannot be
                undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <strong className="text-foreground">{product.name}</strong> from the
                Flex Aura catalog? This action will remove the product and its variants.
                You can restore it later from the Deleted tab.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading && <Loader2Icon className="size-3.5 animate-spin" />}
            {isLoading
              ? permanent
                ? "Deleting Permanently..."
                : "Deleting..."
              : permanent
                ? "Permanently Delete"
                : "Delete Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
