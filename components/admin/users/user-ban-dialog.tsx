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
import { Badge } from "@/components/ui/badge"
import { BanIcon, CheckCircle2Icon, Loader2Icon, ShieldAlertIcon } from "lucide-react"
import type { AdminUser } from "@/lib/admin-users-data"

interface UserBanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onConfirm: (user: AdminUser) => Promise<void>
  isLoading?: boolean
}

export function UserBanDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading = false,
}: UserBanDialogProps) {
  if (!user) return null

  const isBanned = user.isBanned

  async function handleAction() {
    if (!user || isLoading) return
    await onConfirm(user)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                isBanned
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {isBanned ? (
                <CheckCircle2Icon className="size-5" />
              ) : (
                <BanIcon className="size-5" />
              )}
            </div>
            <DialogTitle className="font-heading text-base font-semibold">
              {isBanned ? "Unban User Account" : "Ban User Account"}
            </DialogTitle>
          </div>

          <DialogDescription className="pt-2 text-xs text-muted-foreground leading-relaxed">
            {isBanned ? (
              <>
                Are you sure you want to unban{" "}
                <strong className="text-foreground">{user.name}</strong> (
                {user.email})? They will immediately regain access to their account,
                saved shopping cart, and custom order history.
              </>
            ) : (
              <>
                Are you sure you want to ban{" "}
                <strong className="text-foreground">{user.name}</strong> (
                {user.email})? This user will be immediately blocked from signing
                in, viewing past orders, and submitting custom metal art inquiries.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* User Summary Card */}
        <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <code className="font-mono text-[11px] bg-background px-1.5 py-0.5 rounded">
              {user.id}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assigned Roles:</span>
            <div className="flex gap-1">
              {user.role.map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current State:</span>
            <Badge
              variant={isBanned ? "destructive" : "outline"}
              className="text-[10px] px-1.5 py-0"
            >
              {isBanned ? "Banned" : "Active"}
            </Badge>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
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
            variant={isBanned ? "default" : "destructive"}
            disabled={isLoading}
            onClick={handleAction}
            className="gap-2"
          >
            {isLoading && <Loader2Icon className="size-4 animate-spin" />}
            {isBanned ? (
              isLoading ? "Unbanning User..." : "Confirm Unban"
            ) : (
              isLoading ? "Banning User..." : "Confirm Ban"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
