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
import type { AdminCategory } from "@/lib/admin-categories-data"

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: AdminCategory | null
  onConfirm: () => void
  isLoading?: boolean
  permanent?: boolean
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isLoading = false,
  permanent = false,
}: CategoryDeleteDialogProps) {
  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-semibold text-destructive">
            {permanent ? "Permanently Delete Category?" : "Delete Category?"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {permanent ? (
              <>
                This will permanently remove the category{" "}
                <strong className="text-foreground">{category.name}</strong> and its cover
                image from the database. This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to remove the category{" "}
                <strong className="text-foreground">{category.name}</strong>? Existing
                products with matching tags will not be deleted, but they will no longer be
                categorized under this slug. You can restore it later from the Deleted tab.
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
                : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
