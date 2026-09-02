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
import { Checkbox } from "@/components/ui/checkbox"
import { ShieldCheckIcon, Loader2Icon } from "lucide-react"
import type { AdminUser, UserRole } from "@/lib/admin-users-data"

interface UserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSaveRoles: (userId: string, newRoles: UserRole[]) => Promise<void>
  isLoading?: boolean
}

const AVAILABLE_ROLES: { role: UserRole; label: string; desc: string; badgeVariant: "default" | "secondary" | "outline" }[] = [
  {
    role: "ADMIN",
    label: "Administrator",
    desc: "Full permissions: manage products, categories, revenue, user accounts, and workshop settings.",
    badgeVariant: "default",
  },
  {
    role: "MANAGER",
    label: "Workshop Manager",
    desc: "Operational permissions: review custom orders, update production phases, and moderate reviews.",
    badgeVariant: "secondary",
  },
  {
    role: "USER",
    label: "Standard User",
    desc: "Storefront access: purchase metal art, submit bespoke design inquiries, and track personal shipments.",
    badgeVariant: "outline",
  },
]

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
  onSaveRoles,
  isLoading = false,
}: UserRoleDialogProps) {
  const [selectedRoles, setSelectedRoles] = React.useState<UserRole[]>([])

  React.useEffect(() => {
    if (user) {
      setSelectedRoles([...user.role])
    }
  }, [user])

  if (!user) return null

  function toggleRole(role: UserRole) {
    if (selectedRoles.includes(role)) {
      // Must keep at least one role
      if (selectedRoles.length === 1) return
      setSelectedRoles(selectedRoles.filter((r) => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  async function handleSave() {
    if (!user || isLoading) return
    await onSaveRoles(user.id, selectedRoles)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-base font-semibold">
                Manage Access Roles
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set role permissions for {user.name} ({user.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {AVAILABLE_ROLES.map(({ role, label, desc, badgeVariant }) => {
            const isChecked = selectedRoles.includes(role)
            return (
              <div
                key={role}
                onClick={() => !isLoading && toggleRole(role)}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                  isChecked
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleRole(role)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{label}</span>
                    <Badge variant={badgeVariant} className="text-[10px]">
                      {role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            disabled={isLoading || selectedRoles.length === 0}
            onClick={handleSave}
            className="gap-2"
          >
            {isLoading && <Loader2Icon className="size-4 animate-spin" />}
            {isLoading ? "Saving Roles..." : "Save Role Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
