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
import { toast } from "@/components/ui/toast"
import type { Product } from "@/lib/data"

interface ProductDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
}: ProductDeleteDialogProps) {
  if (!product) return null

  function handleDelete() {
    if (!product) return
    toast.add({
      type: "info",
      title: "Product removed",
      description: `${product.name} deleted from catalog.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-semibold text-destructive">
            Delete Product?
          </DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{product.name}</strong> from the
            Flex Aura catalog? This action will remove the product and its variants.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
