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
import { useAdminStore } from "@/components/admin/admin-store-provider"
import type { AdminCategory } from "@/lib/admin-data"

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: AdminCategory | null
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
}: CategoryDeleteDialogProps) {
  const { deleteCategory } = useAdminStore()

  if (!category) return null

  function handleDelete() {
    if (!category) return
    deleteCategory(category.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-semibold text-destructive">
            Delete Category?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Are you sure you want to remove the category{" "}
            <strong className="text-foreground">{category.name}</strong>? Existing products with matching tags will not be deleted, but they will no longer be categorized under this slug.
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
            Delete Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
