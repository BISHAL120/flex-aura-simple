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
import type { Review } from "@/lib/data"

interface ReviewDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: Review | null
}

export function ReviewDeleteDialog({
  open,
  onOpenChange,
  review,
}: ReviewDeleteDialogProps) {
  if (!review) return null

  function handleDelete() {
    if (!review) return
    toast.add({
      type: "info",
      title: "Review removed",
      description: `Review from ${review.name} was removed.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-semibold text-destructive">
            Delete Customer Review?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Are you sure you want to remove the review from{" "}
            <strong className="text-foreground">{review.name}</strong> (&ldquo;{review.title}&rdquo;)? This review will no longer be visible on the store.
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
            Delete Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
